import fs from 'fs'
import https from 'https'

export class FileController {
    private static readonly maxFileSize: number = 20971520;

    static async downloadFile(url: URL, outputFilename: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync("temp")) {
                fs.mkdir("temp", (error) => {
                    if (error) {
                        reject(error);
                    }
                });
            }

            const file = fs.createWriteStream("temp/" + outputFilename);

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

    static async deleteFile(filename: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.unlink(filename, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }

    static validateFileName(fileName: string): boolean {
        if (fileName != "") {
            return true;
        }

        return false;
    }

    static validateFileExtension(extensions: string[], extension: string): boolean {
        if (extension != "" && extensions.includes(extension.toLowerCase())) {
            return true;
        }

        return false;
    }

    static validateFileSize(fileSize: number): boolean {
        if (fileSize <= this.maxFileSize) {
            return true;
        }

        return false;
    }
}