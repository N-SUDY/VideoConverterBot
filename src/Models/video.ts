export class Video {
    name: string;
    id: string;
    extension: string;
    futureExtension: string;
    url?: URL;

    constructor() {
        this.name = "";
        this.id = "";
        this.extension = "";
        this.futureExtension = "";
    }
}