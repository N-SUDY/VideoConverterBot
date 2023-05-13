import fs from 'fs'
import https from 'https'

const maxFileSize: number = 20971520;
const tempFolder: string = "temp";

export class FileService {
    static async downloadFile(url: URL, outputFilename: string) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(tempFolder)) {
                fs.mkdir(tempFolder, (error) => {
                    if (error) {
                        reject(error);
                    }
                });
            }

            const file = fs.createWriteStream(`${tempFolder}/${outputFilename}`);

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
                    return;
                }

                resolve();
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
        if (fileSize <= maxFileSize) {
            return true;
        }

        return false;
    }
}