export class Keyboard {
    public readonly extensionsKeyboard: { text: string, callback_data: string }[][];

    constructor() {
        this.extensionsKeyboard = [
            [{ text: "MP4", callback_data: ".mp4" }, { text: "AVI", callback_data: ".avi" }],
            [{ text: "MOV", callback_data: ".mov" }, { text: "WMV", callback_data: ".wmv" }],
            [{ text: "MKV", callback_data: ".mkv" }]
        ];
    }
}
