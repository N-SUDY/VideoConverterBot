import Ffmpeg from 'fluent-ffmpeg'

export class FFmpegController {
    constructor(path: string) {
        Ffmpeg.setFfmpegPath(path);
    }

    async Convert(inputPath: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            Ffmpeg(inputPath)
            .save(outputPath)
            .on('end', () => {
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            });
        });
    }
}