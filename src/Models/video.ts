export class Video {
    name: string;
    extension: string;
    futureExtension: string;
    url?: URL;

    constructor() {
        this.name = "";
        this.extension = "";
        this.futureExtension = "";
    }
}