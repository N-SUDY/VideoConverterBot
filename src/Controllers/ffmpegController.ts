import Ffmpeg from 'fluent-ffmpeg'
import path from 'path'

export class FFmpegController {
    constructor() {
        Ffmpeg.setFfmpegPath("C:\\ffmpeg\\bin\\ffmpeg.exe");
    }

    async Convert(inputPath: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const absolutePath = path.resolve(".");

            Ffmpeg(`${absolutePath}\\temp\\${inputPath}`)
            .save(`${absolutePath}\\temp\\${outputPath}`)
            .on('end', () => {
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            });
        });
    }
}