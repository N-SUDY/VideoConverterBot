import { Telegraf, Context } from "telegraf"
import { Update } from "telegraf/typings/core/types/typegram"
import { message } from "telegraf/filters"
import { FileController } from "./fileController";
import { FFmpegController } from "./ffmpegController";
import { Video } from "../Models/video";
import fs from 'fs'
import path from "path";
import { callback } from "telegraf/typings/button";

export class BotController {
    private bot: Telegraf<Context<Update>>;
    private ffMpegController: FFmpegController;
    private video: Video;

    constructor(bot: Telegraf<Context<Update>>) {
        this.bot = bot;
        this.ffMpegController = new FFmpegController();
        this.video = new Video(); 
    }

    private async downloadFile(): Promise<void> {
        await FileController.downloadFile(this.video.url!, this.video.id + `${this.video.extension}`);
    }

    private async runConverter(): Promise<void> {
        await this.downloadFile();
        await this.ffMpegController.Convert(`${this.video.id}${this.video.extension}`, `${this.video.id}.${this.video.futureExtension}`)
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

                const url = context.telegram.getFileLink(this.video.id)
                .then((url) => this.video.url = url);

                await context.telegram.sendMessage(context.message.chat.id, "Choose extension", { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
            }
            else {
                await context.telegram.sendMessage(context.message.chat.id, "Too big file!");
            }
        });

        this.bot.on('callback_query', async (context) => {
            console.log( );
        });

        // this.bot.action('mp4', async (context) => {
        //     console.log();
        //     // this.video.futureExtension = "mp4";
        //     // await this.runConverter();
        //     // await this.bot.telegram.sendVideo(context.callbackQuery.message?.chat.id!, {
        //     //     source: await fs.createReadStream(`./temp/${this.video.id}.${this.video.futureExtension}`)
        //     // });
        // });

        // this.bot.action('avi', async (context) => {

            

        //     this.video.futureExtension = "avi";
        //     await this.runConverter();
        //     await this.bot.telegram.sendVideo(context.callbackQuery.message?.chat.id!, {
        //         source: await fs.createReadStream(`./temp/${this.video.id}.${this.video.futureExtension}`)
        //     });
        // });

        // this.bot.action('mpeg', async (context) => {
        //     this.video.futureExtension = "mpeg";
        //     await this.runConverter();
        //     await this.bot.telegram.sendVideo(context.callbackQuery.message?.chat.id!, {
        //         source: await fs.createReadStream(`./temp/${this.video.id}.${this.video.futureExtension}`)
        //     });
        // });
    }
}

