import Ffmpeg from 'fluent-ffmpeg'
import { FileService } from "../services";
import { Video } from '../models';

export class FFmpegService {
    private static async Convert(inputPath: string, outputPath: string) {
        return new Promise<void>((resolve, reject) => {
            Ffmpeg(inputPath)
                .videoCodec('libx264')
                .audioCodec('libmp3lame')
                .save(outputPath)
                .on('end', () => {
                    resolve();
                })
                .on('error', (err) => {
                    reject(err);
                });
        });
    }

    static async runConverter(video: Video) {
        const inputPath = `temp/${video.name}${video.extension}`;
        const outputPath = `temp/${video.name}${video.futureExtension}`;

        await FileService.downloadFile(video.url!, `${video.name}${video.extension}`);
        await this.Convert(inputPath, outputPath);
    }
}