import {Telegraf, Context} from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram';
import { BotController } from './Controllers/botController'
import data from './config.json';

const bot = new Telegraf<Context<Update>>(data.token);

const botController = new BotController(bot);
botController.run();

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
