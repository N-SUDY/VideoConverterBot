import { extensions } from "../Models/extensions";
import { FileController } from "./fileController";
import { FFmpegController } from "./ffmpegController";
import { message } from "telegraf/filters"
import path from "path";
import { Telegraf, Context } from "telegraf"
import { Update } from "telegraf/typings/core/types/typegram"
import { Video } from "../Models/video";

export class BotController {
    private bot: Telegraf<Context<Update>>;
    private ffMpegController: FFmpegController;
    private video: Video;

    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.ffMpegController = new FFmpegController(process.env.FFMPEG_PATH as string);
        this.video = new Video(); 
    }

    private async runConverter(): Promise<void> {
        await FileController.downloadFile(this.video.url!, this.video.id + `${this.video.extension}`);
        await this.ffMpegController.Convert(`build/temp/${this.video.id}${this.video.extension}`, `build/temp/${this.video.id}${this.video.futureExtension}`)
    }

    public run(): void {
        this.bot.start(async (context) => {
            await context.telegram.sendMessage(context.message.chat.id,
                `Hello, <b>${context.from.first_name}</b>!` +
                `\nMy name is ${context.botInfo.first_name}, i can convert you video in required format.` +
                `\nJust send video.`, { parse_mode: 'HTML' });
        });

        this.bot.on(message('video'), async (context) => {
            if (context.message.video.file_size! <= 20971520) {
                const keyboard = [
                    [{ text: "MP4", callback_data: "mp4" }],
                    [{ text: "AVI", callback_data: "avi" }],
                    [{ text: "MPEG", callback_data: "mpeg"}]
                ];

                this.video.id = context.message.video.file_id;
                this.video.name = context.message.video.file_name!;
                this.video.extension = path.extname(context.message.video.file_name!);

                context.telegram.getFileLink(this.video.id)
                .then((url) => this.video.url = url);

                await context.telegram.sendMessage(context.message.chat.id, "Choose extension", { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
            }
            else {
                await context.telegram.sendMessage(context.message.chat.id, "Too big file!");
            }
        });

        this.bot.action(extensions, async (context) => {
            this.video.futureExtension = `.${context.match[0]}`;

            if (this.video.extension == this.video.futureExtension) {
                await context.telegram.editMessageText(context.callbackQuery.message!.chat.id, 
                    context.callbackQuery.message!.message_id,
                    context.callbackQuery.inline_message_id, 
                    "Future extension is equal to the current one!❌", {parse_mode: 'HTML'});

                    return;
            }

            await context.telegram.editMessageText(context.callbackQuery.message!.chat.id, 
                context.callbackQuery.message!.message_id,
                context.callbackQuery.inline_message_id, 
                "Processing...");

            await this.runConverter();

            await context.telegram.editMessageText(context.callbackQuery.message!.chat.id, 
                context.callbackQuery.message!.message_id,
                context.callbackQuery.inline_message_id, 
                "Your converted video✅");

            await this.bot.telegram.sendVideo(context.callbackQuery.message?.chat.id!, {
                source: `build/temp/${this.video.id}${this.video.futureExtension}`
            });

            await FileController.deleteFile(`build/temp/${this.video.id}${this.video.extension}`);
            await FileController.deleteFile(`build/temp/${this.video.id}${this.video.futureExtension}`);
        });
    }
}

