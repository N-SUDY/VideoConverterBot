import {Telegraf, Context} from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram';
import dotenv from 'dotenv';
import { BotService } from './services';

dotenv.config();

const bot = new Telegraf<Context<Update>>(process.env.TELEGRAM_BOT_TOKEN as string);

const botService = new BotService(bot);
botService.initHandlers();

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
