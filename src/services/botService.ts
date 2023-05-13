import { Context, Telegraf } from "telegraf";
import { FileLogger, Video, Extension, Keyboard } from "../models";
import { Update } from "typegram";
import { message } from "telegraf/filters";
import path from "path";
import { FFmpegService, FileService } from "../services"

export class BotService {
    private readonly bot: Telegraf<Context<Update>>;
    private readonly video: Video;
    private readonly keyboard: Keyboard;
    private readonly extension: Extension;
    private readonly logger: FileLogger;

    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.video = new Video();
        this.keyboard = new Keyboard();
        this.extension = new Extension();
        this.logger = new FileLogger("log.txt");
    }

    private async validateAndNotify(context: Context<Update>) {
        if (!FileService.validateFileExtension(this.extension.videoExtensions, this.video.extension!)) {
            await context.telegram.sendMessage(context.message!.chat.id, "❌The file extension does not match the requirement!❌",
                { reply_to_message_id: context.message!.message_id });

            return;
        }

        if (!FileService.validateFileSize(this.video.size!)) {
            await context.telegram.sendMessage(context.message!.chat.id, "❌Too big file! The maximum size - 20 MB❌",
                { reply_to_message_id: context.message!.message_id });

            return;
        }

        this.video.url = await context.telegram.getFileLink(this.video.name!)

        await context.telegram.sendMessage(context.message!.chat.id, "Choose extension",
            { parse_mode: 'HTML', reply_markup: { inline_keyboard: this.keyboard.extensionsKeyboard }, reply_to_message_id: context.message!.message_id });
    }

    private handleStartCommand() {
        this.bot.start(async (context) => {
            try {
                await context.telegram.sendMessage(context.message.chat.id, `Hi, <b>${context.from.first_name}</b>!` +
                    `\nMy name is ${context.botInfo.first_name}, I can convert you video in required format.` +
                    `\nJust send video or document.`, { parse_mode: 'HTML' });
            } catch (error) {
                this.logger.error((error as Error).stack);
            }
        });
    }

    private handleHelpCommand() {
        this.bot.help(async (context) => {
            try {
                await context.telegram.sendMessage(context.message.chat.id, `<b>${context.botInfo.first_name}</b> - this is a bot, that can convert your video from certain extension to other.` +
                    `\n\nAt the moment, the bot can convert to the following extensions: <b>\nmp4\navi\nmov\nmkv\nwmv</b>` +
                    `\n\nYou have 2 option to send the video: \n<b>1.Send as video</b>\n<b>2.Send as document</b>`, { parse_mode: 'HTML' });
            } catch (error) {
                this.logger.error((error as Error).stack);
            }
        });
    }

    private handleVideoMessage() {
        this.bot.on(message('video'), async (context) => {
            try {
                if (context.message.forward_date) {
                    await context.telegram.sendMessage(context.message!.chat.id,
                        "❌I do not process the forwarded message! Upload your video via computer or phone!❌",
                        { reply_to_message_id: context.message!.message_id });

                    return;
                }

                this.video.name = context.message.video.file_id;
                this.video.extension = path.extname(context.message.video.file_name!);
                this.video.size = context.message.video.file_size;

                this.validateAndNotify(context);
            } catch (error) {
                this.logger.error((error as Error).stack);
            }
        });
    }

    private handleDocumentMessage() {
        this.bot.on(message('document'), async (context) => {
            try {
                if (context.message.forward_date) {
                    await context.telegram.sendMessage(context.message!.chat.id, "❌I do not process the forwarded message! Upload your video via computer or phone!❌",
                        { reply_to_message_id: context.message!.message_id });

                    return;
                }

                this.video.name = context.message.document.file_id;
                this.video.extension = path.extname(context.message.document.file_name!);
                this.video.size = context.message.document.file_size;

                this.validateAndNotify(context);
            }
            catch (error) {
                this.logger.error((error as Error).stack);
            }
        });
    }

    private handleCallbackAction() {
        this.bot.action(this.extension.videoExtensions, async (context) => {
            try {
                this.video.futureExtension = context.match[0];

                if (this.video.extension == this.video.futureExtension) {
                    await context.telegram.editMessageText(context.callbackQuery.message!.chat.id,
                        context.callbackQuery.message!.message_id,
                        context.callbackQuery.inline_message_id,
                        "❌Future extension is equal to the current one!❌",
                        { parse_mode: 'HTML' });

                    return;
                }

                await context.telegram.editMessageText(context.callbackQuery.message?.chat.id,
                    context.callbackQuery.message?.message_id,
                    context.callbackQuery.inline_message_id,
                    "Processing...");

                await FFmpegService.runConverter(this.video);

                await context.telegram.editMessageText(context.callbackQuery.message?.chat.id,
                    context.callbackQuery.message?.message_id,
                    context.callbackQuery.inline_message_id,
                    "✅Done!✅");

                await this.bot.telegram.sendVideo(context.callbackQuery.message?.chat.id!,
                    { source: `temp/${this.video.name}${this.video.futureExtension}` },
                    { caption: `${this.video.extension} ➡️ ${this.video.futureExtension}`});
            } catch (err) {
                await context.telegram.editMessageText(context.callbackQuery.message!.chat.id,
                    context.callbackQuery.message!.message_id,
                    context.callbackQuery.inline_message_id,
                    "❌Something went wrong, try again!❌");

                this.logger.error((err as Error).stack);
            } finally {
                await FileService.deleteFile(`temp/${this.video.name}${this.video.extension}`);
                await FileService.deleteFile(`temp/${this.video.name}${this.video.futureExtension}`);
            }
        });
    }

    //This method contains handlers for telegram bot.
    public initHandlers(): void {
        this.handleStartCommand();
        this.handleHelpCommand();
        this.handleVideoMessage();
        this.handleDocumentMessage();
        this.handleCallbackAction();
    }
}

