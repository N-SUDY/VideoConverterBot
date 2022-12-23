"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var telegraf_1 = require("telegraf");
var botController_1 = require("./Controllers/botController");
var config_json_1 = __importDefault(require("./config.json"));
var bot = new telegraf_1.Telegraf(config_json_1.default.token);
var botController = new botController_1.BotController(bot);
botController.run();
bot.launch();
process.once('SIGINT', function () { return bot.stop('SIGINT'); });
process.once('SIGTERM', function () { return bot.stop('SIGTERM'); });
