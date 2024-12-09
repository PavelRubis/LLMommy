import { Configuration } from './Infrastructure/Utils/Configuration.js';
import mongoose from 'mongoose';
import { Logger } from './Infrastructure/Utils/Logger.js';
import TelegramBot from './Infrastructure/Utils/TelegramBot.js';
import UserRepository from './Infrastructure/Repositories/UserRepository.js';
import ConversationRepository from './Infrastructure/Repositories/ConversationRepository.js';
import LLMommy from './LLMommy.js';
import DependencyResolver from './Infrastructure/Utils/DependencyResolver.js';

class Program {
    static async start() {
        try {
            await Program.connectToDB();
            Logger.info('DB Connected');
            await Program.startBot();
            Logger.info('Telegram bot started');

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
    }

    static async startBot() {
        const botConfig = {
            botToken: Configuration.get('TELEGRAM_TOKEN'),
            allowedUserNames: Configuration.get('TELEGRAM_ALLOWED_USERS_USERNAMES')?.split(','),
            allowedUsersIds: Configuration.get('TELEGRAM_ALLOWED_USERS_IDS')?.split(','),
            maxContextLength: Configuration.get('TELEGRAM_MAX_CONTEXT_MESSAGES_COUNT')
        };
        const mommy = new LLMommy(DependencyResolver.resolveAssistant(), DependencyResolver.resolveSpeechToTextConverter());

        const bot = new TelegramBot(botConfig, mommy, new UserRepository(), new ConversationRepository());
        bot.initialize();
        bot.start();
    }
}

Program.start();
