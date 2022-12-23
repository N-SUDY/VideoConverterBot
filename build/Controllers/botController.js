"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotController = void 0;
var filters_1 = require("telegraf/filters");
var fileController_1 = require("./fileController");
var ffmpegController_1 = require("./ffmpegController");
var video_1 = require("../Models/video");
var path_1 = __importDefault(require("path"));
var BotController = /** @class */ (function () {
    function BotController(bot) {
        this.bot = bot;
        this.ffMpegController = new ffmpegController_1.FFmpegController();
        this.video = new video_1.Video();
    }
    BotController.prototype.downloadFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fileController_1.FileController.downloadFile(this.video.url, this.video.id + "".concat(this.video.extension))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BotController.prototype.runConverter = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.downloadFile()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.ffMpegController.Convert("".concat(this.video.id).concat(this.video.extension), "".concat(this.video.id, ".").concat(this.video.futureExtension))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BotController.prototype.run = function () {
        var _this = this;
        this.bot.start(function (context) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, context.telegram.sendMessage(context.message.chat.id, "Hello, <b>".concat(context.from.first_name, "</b>!") +
                            "\nMy name is ".concat(context.botInfo.first_name, ", i can convert you video in required format.") +
                            "\nJust send video.", { parse_mode: 'HTML' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        this.bot.on((0, filters_1.message)('video'), function (context) { return __awaiter(_this, void 0, void 0, function () {
            var keyboard, url;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(context.message.video.file_size <= 20971520)) return [3 /*break*/, 2];
                        keyboard = [
                            [{ text: "MP4", callback_data: "mp4" }],
                            [{ text: "AVI", callback_data: "avi" }],
                            [{ text: "MPEG", callback_data: "mpeg" }]
                        ];
                        this.video.id = context.message.video.file_id;
                        this.video.name = context.message.video.file_name;
                        this.video.extension = path_1.default.extname(context.message.video.file_name);
                        url = context.telegram.getFileLink(this.video.id)
                            .then(function (url) { return _this.video.url = url; });
                        return [4 /*yield*/, context.telegram.sendMessage(context.message.chat.id, "Choose extension", { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, context.telegram.sendMessage(context.message.chat.id, "Too big file!")];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        this.bot.on('callback_query', function (context) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log(context);
                return [2 /*return*/];
            });
        }); });
        // this.bot.action('mp4', async (context) => {
        //     console.log();
        //     // this.video.futureExtension = "mp4";
        //     // await this.runConverter();
        //     // await this.bot.telegram.sendVideo(context.callbackQuery.message?.chat.id!, {
        //     //     source: await fs.createReadStream(`./temp/${this.video.id}.${this.video.futureExtension}`)
        //     // });
        // });
        // this.bot.action('avi', async (context) => {
        //     this.video.futureExtension = "avi";
        //     await this.runConverter();
        //     await this.bot.telegram.sendVideo(context.callbackQuery.message?.chat.id!, {
        //         source: await fs.createReadStream(`./temp/${this.video.id}.${this.video.futureExtension}`)
        //     });
        // });
        // this.bot.action('mpeg', async (context) => {
        //     this.video.futureExtension = "mpeg";
        //     await this.runConverter();
        //     await this.bot.telegram.sendVideo(context.callbackQuery.message?.chat.id!, {
        //         source: await fs.createReadStream(`./temp/${this.video.id}.${this.video.futureExtension}`)
        //     });
        // });
    };
    return BotController;
}());
exports.BotController = BotController;
