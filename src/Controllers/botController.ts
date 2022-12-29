import { extensions } from "../Models/extensions";
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
    private readonly keyboard: {text: string, callback_data: string}[][];

    constructor(bot: Telegraf<Context<Update>>) {
        this.logger = new FileLogger("log.txt");
        this.bot = bot;
        this.ffMpegController = new FFmpegController(process.env.FFMPEG_PATH as string);
        this.video = new Video(); 

        this.keyboard = [
            [{ text: "MP4", callback_data: ".mp4" }],
            [{ text: "AVI", callback_data: ".avi" }],
            [{ text: "MOV", callback_data: ".mov"}],
            [{ text: "WMV", callback_data: ".wmv"}],
            [{ text: "MKV", callback_data: ".mkv"}]
        ];
    }

    private async runConverter(): Promise<void> {
        await FileController.downloadFile(this.video.url!, `${this.video.id}${this.video.extension}`);
        await this.ffMpegController.Convert(`build/temp/${this.video.id}${this.video.extension}`, `build/temp/${this.video.id}${this.video.futureExtension}`);
    }

    public run(): void {
        this.bot.start(async (context) => {
            await context.telegram.sendMessage(context.message.chat.id,
                `Hi, <b>${context.from.first_name}</b>!` +
                `\nMy name is ${context.botInfo.first_name}, i can convert you video in required format.` +
                `\nJust send video or document.`, 
                { 
                    parse_mode: 'HTML' 
                });
        });

        this.bot.help(async (context) => {
            await context.telegram.sendMessage(context.message.chat.id,
                `<b>${context.botInfo.first_name}</b> - this is a bot, that can convert your video from certain extension to other.` +
                `\n\nAt the moment, the bot can convert to the following extensions: <b>\nmp4\navi\nmov\nmkv\nwmv</b>` +
                `\n\nYou have 2 option to send the video: \n<b>1.Send as video</b>\n<b>2.Send as document</b>`,
                { 
                    parse_mode: 'HTML' 
                });
        });

        this.bot.on(message('video'), async (context) => {
            if (context.message.video.file_size! <= 20971520) {
                this.video.id = context.message.video.file_id;
                this.video.name = context.message.video.file_name!;
                this.video.extension = path.extname(context.message.video.file_name!);

                await context.telegram.getFileLink(this.video.id)
                .then((url) => this.video.url = url);

                await context.telegram.sendMessage(context.message.chat.id,
                    "Choose extension",
                    {
                        parse_mode: 'HTML',
                        reply_markup: { inline_keyboard: this.keyboard },
                        reply_to_message_id: context.message.message_id
                    });
            }
            else {
                await context.telegram.sendMessage(context.message.chat.id, 
                    "❌Too big file!❌", 
                    {
                        reply_to_message_id: context.message.message_id
                    });
            }
        });

        this.bot.on(message('document'), async (context) => {
            const extension = path.extname(context.message.document.file_name!);

            if (extensions.includes(extension)) {
                if (context.message.document.file_size! <= 20971520) {
                    this.video.id = context.message.document.file_id;
                    this.video.name = context.message.document.file_name!;
                    this.video.extension = extension;
    
                    await context.telegram.getFileLink(this.video.id)
                    .then((url) => this.video.url = url);
    
                    await context.telegram.sendMessage(context.message.chat.id, "Choose extension", 
                    { 
                        parse_mode: 'HTML', 
                        reply_markup: { inline_keyboard: this.keyboard }, 
                        reply_to_message_id: context.message.message_id 
                    });
                }
                else {
                    await context.telegram.sendMessage(context.message.chat.id, 
                        "❌Too big file!❌", 
                        {
                            reply_to_message_id: context.message.message_id
                        });
                }
            }
            else {
                await context.telegram.sendMessage(context.message.chat.id, 
                    "❌The file extension does not match the requirement!❌", 
                    {
                        reply_to_message_id: context.message.message_id
                    });
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
                        source: `build/temp/${this.video.id}${this.video.futureExtension}`,
                    },
                    {
                        caption: `${this.video.extension} ➡️ ${this.video.futureExtension}`
                    });
    
                await FileController.deleteFile(`build/temp/${this.video.id}${this.video.extension}`);
                await FileController.deleteFile(`build/temp/${this.video.id}${this.video.futureExtension}`);
            })
            .catch(async (err) => {
                await context.telegram.editMessageText(context.callbackQuery.message!.chat.id, 
                    context.callbackQuery.message!.message_id,
                    context.callbackQuery.inline_message_id, 
                    "❌Something went wrong, try again!❌");

                await FileController.deleteFile(`build/temp/${this.video.id}${this.video.extension}`);

                this.logger.error(err, err.stack);
            });
        });
    }
}

