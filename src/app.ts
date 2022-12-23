import {Telegraf, Context} from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram';
import { BotController } from './Controllers/botController';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf<Context<Update>>(process.env.TELEGRAM_BOT_TOKEN as string);

const botController = new BotController(bot);
botController.run();

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
