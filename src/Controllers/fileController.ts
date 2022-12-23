import fs from 'fs'
import https from 'https'

export class FileController {
    static async downloadFile(url: URL, outputFilename: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream("temp\\" + outputFilename);

                https.get(url, (response) => {
                    response.pipe(file);

                    file.on("finish", () => {
                        resolve(file.close());
                    });

                    file.on("error", (err) => {
                        file.close();
                        reject(err);
                    });
                });
            });
    }

    static deleteFile(filename: string): void {
        fs.unlink(filename, (err) => {
            if (err) {
                throw err;
            }
        });
    }
}