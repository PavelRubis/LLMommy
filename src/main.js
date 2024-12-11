import { Configuration } from './Infrastructure/Utils/Configuration.js';
import { Logger } from './Infrastructure/Utils/Logger.js';
import mongoose from 'mongoose';
import TelegramBot from './Infrastructure/Utils/TelegramBot.js';
import UserRepository from './Infrastructure/Repositories/UserRepository.js';
import ConversationRepository from './Infrastructure/Repositories/ConversationRepository.js';
import LLMommy from './LLMommy.js';
import DependencyResolver from './Infrastructure/Utils/DependencyResolver.js';
import EventEmitter from 'node:events';

class Program {
    static #eventEmitter = new EventEmitter();

    static async start() {
        try {
            await Program.connectToDB();
            Program.configureMommy();
            await Program.configureAndStartBot();

            process.on('uncaughtException', err => {
                Logger.error(err, 'Uncaught exception');
            });

            process.on('unhandledRejection', (reason, promise) => {
                Logger.error(reason, 'unhandledRejection');
            });
        } catch (e) {
            Logger.fatal(e, 'Fatal error. Stopping bot...');
            process.exit(1);
        }
    }

    static async connectToDB() {
        const mongoUri = Configuration.get('MONGO_DB_URI');
        Logger.info(mongoUri, 'mongoUri');
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        Logger.info('DB Connected');
    }

    static configureMommy() {
        Program.mommy = new LLMommy(DependencyResolver.resolveCompletionLLM(), DependencyResolver.resolveSpeechToTextConverter(), Program.#eventEmitter);
    }

    static async configureAndStartBot() {
        const botConfig = {
            botToken: Configuration.get('TELEGRAM_TOKEN'),
            allowedUserNames: Configuration.get('TELEGRAM_ALLOWED_USERS_USERNAMES')?.split(','),
            allowedUsersIds: Configuration.get('TELEGRAM_ALLOWED_USERS_IDS')?.split(','),
            maxContextLength: Configuration.get('TELEGRAM_MAX_CONTEXT_MESSAGES_COUNT')
        };
        const bot = new TelegramBot(botConfig, new UserRepository(), new ConversationRepository(), DependencyResolver.resolveCompletionLLM(), Program.#eventEmitter);
        bot.initialize();
        bot.start();
        Logger.info('Telegram bot started');
    }
}

Program.start();
