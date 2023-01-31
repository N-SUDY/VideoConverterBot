import { extensions } from "../Models/extensions";
import { extensionsKeyboard } from "../Models/keyboards";
import { FileController } from "./fileController";
import { FFmpegController } from "./ffmpegController";
import { message } from "telegraf/filters"
import path from "path";
import { Telegraf, Context } from "telegraf"
import { Update } from "telegraf/typings/core/types/typegram"
import { Video } from "../Models/video";
import { FileLogger } from "../Models/logger";

export class BotController {
    private readonly logger: FileLogger;
    private readonly bot: Telegraf<Context<Update>>;
    private readonly ffMpegController: FFmpegController;
    private readonly video: Video;
    
    constructor(bot: Telegraf<Context<Update>>) {
        this.logger = new FileLogger("log.txt");
        this.bot = bot;
        //If you want to set path to ffmpeg, pass a parameter to the FFmpegController constructor
        this.ffMpegController = new FFmpegController();
        this.video = new Video();
    }

    //This method checks video extension and file size. 
    //In the good case, method gets and sets url to video and send message with keyboard that contains extensions.
    //In the worst case, method send message to user about certain problem.
    private async validateData(context: Context<Update>, extensions: string[], extension: string, fileSize: number): Promise<void> {
        if (FileController.validateFileExtension(extensions, extension)) {
            if (FileController.validateFileSize(fileSize)) {
                await context.telegram.getFileLink(this.video.name)
                    .then((url) => this.video.url = url);

                await context.telegram.sendMessage(context.message!.chat.id,
                    "Choose extension",
                    {
                        parse_mode: 'HTML',
                        reply_markup: { inline_keyboard: extensionsKeyboard },
                        reply_to_message_id: context.message!.message_id
                    });
            }
            else {
                await context.telegram.sendMessage(context.message!.chat.id,
                    "❌Too big file!❌",
                    {
                        reply_to_message_id: context.message!.message_id
                    });
            }
        }
        else {
            await context.telegram.sendMessage(context.message!.chat.id,
                "❌The file extension does not match the requirement!❌",
                {
                    reply_to_message_id: context.message!.message_id
                });
        }
    }
    
    //This method checks on empty strings. 
    //If one string is empty, then throw Error.
    //Else the next code will be executed
    private async runConverter(): Promise<void> {
        if (!FileController.validateFileName(this.video.name) || !FileController.validateFileExtension(extensions, this.video.extension)) {
            throw new Error("Empty video name or extension!");
        }

        await FileController.downloadFile(this.video.url!, `${this.video.name}${this.video.extension}`);
        await this.ffMpegController.Convert(`temp/${this.video.name}${this.video.extension}`, `temp/${this.video.name}${this.video.futureExtension}`);
    }

    //This method contains handlers for telegram bot.
    public run(): void {
        this.bot.start(async (context) => {
            await context.telegram.sendPhoto(context.message.chat.id,
                {
                    source: process.env.START_PHOTO as string
                },
                {
                    caption: `Hi, <b>${context.from.first_name}</b>!` +
                    `\nMy name is ${context.botInfo.first_name}, I can convert you video in required format.` +
                    `\nJust send video or document.`,
                    parse_mode: 'HTML'
                })
                .catch((error) => {
                    this.logger.error(error, error.stack);
                });
        });

        this.bot.help(async (context) => {
            await context.telegram.sendPhoto(context.message.chat.id, 
                {
                    source: process.env.HELP_PHOTO as string
                },
                {
                    caption: `<b>${context.botInfo.first_name}</b> - this is a bot, that can convert your video from certain extension to other.` +
                    `\n\nAt the moment, the bot can convert to the following extensions: <b>\nmp4\navi\nmov\nmkv\nwmv</b>` +
                    `\n\nYou have 2 option to send the video: \n<b>1.Send as video</b>\n<b>2.Send as document</b>`,
                    parse_mode: 'HTML'
                })
                .catch((error) => {
                    this.logger.error(error, error.stack);
                });
        });

        this.bot.on(message('video'), async (context) => {
            try {
                if (context.message.forward_date != undefined) {
                    await context.telegram.sendMessage(context.message!.chat.id,
                        "❌I do not process the forwarded message! Upload your video via computer or phone!❌",
                        {
                            reply_to_message_id: context.message!.message_id
                        });

                    return;
                }

                this.video.name = context.message.video.file_id;
                this.video.extension = path.extname(context.message.video.file_name!); 

                this.validateData(context, extensions, this.video.extension, context.message.video.file_size!);
            } catch (error) {
                this.logger.error(error);
            }
        });

        this.bot.on(message('document'), async (context) => {
            try {
                if (context.message.forward_date != undefined) {
                    await context.telegram.sendMessage(context.message!.chat.id,
                        "❌I do not process the forwarded message! Upload your video via computer or phone!❌",
                        {
                            reply_to_message_id: context.message!.message_id
                        });

                    return;
                }

                this.video.name = context.message.document.file_id;
                this.video.extension = path.extname(context.message.document.file_name!);
                
                this.validateData(context, extensions, this.video.extension, context.message.document.file_size!)
            }
            catch (error) {
                this.logger.error(error);
            }
        });

        this.bot.action(extensions, async (context) => {
            this.video.futureExtension = context.match[0];

            if (this.video.extension == this.video.futureExtension) {
                await context.telegram.editMessageText(context.callbackQuery.message!.chat.id,
                    context.callbackQuery.message!.message_id,
                    context.callbackQuery.inline_message_id,
                    "❌Future extension is equal to the current one!❌",
                    {
                        parse_mode: 'HTML'
                    });

                return;
            }

            await context.telegram.editMessageText(context.callbackQuery.message!.chat.id,
                context.callbackQuery.message!.message_id,
                context.callbackQuery.inline_message_id,
                "Processing...");

            await this.runConverter()
                .then(async () => {
                    await context.telegram.editMessageText(context.callbackQuery.message!.chat.id,
                        context.callbackQuery.message!.message_id,
                        context.callbackQuery.inline_message_id,
                        "✅Done!✅");

                    await this.bot.telegram.sendVideo(context.callbackQuery.message?.chat.id!,
                        {
                            source: `temp/${this.video.name}${this.video.futureExtension}`,
                        },
                        {
                            caption: `${this.video.extension} ➡️ ${this.video.futureExtension}`
                        });

                    await FileController.deleteFile(`temp/${this.video.name}${this.video.extension}`);
                    await FileController.deleteFile(`temp/${this.video.name}${this.video.futureExtension}`);
                })
                .catch(async (err) => {
                    await context.telegram.editMessageText(context.callbackQuery.message!.chat.id,
                        context.callbackQuery.message!.message_id,
                        context.callbackQuery.inline_message_id,
                        "❌Something went wrong, try again!❌");

                    await FileController.deleteFile(`temp/${this.video.name}${this.video.extension}`);
                    await FileController.deleteFile(`temp/${this.video.name}${this.video.futureExtension}`);

                    this.logger.error(err, err.stack);
                });
        });
    }
}

