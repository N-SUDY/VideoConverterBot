import Ffmpeg from 'fluent-ffmpeg'

export class FFmpegController {
    constructor(path?: string) {
        if (path) {
            Ffmpeg.setFfmpegPath(path);
        }
    }

    async Convert(inputPath: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            Ffmpeg(inputPath)
            .videoCodec('libx264')
            .audioCodec('libmp3lame')
            .addOption('-crf 1')
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