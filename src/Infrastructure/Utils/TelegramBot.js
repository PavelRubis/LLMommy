import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { Logger } from './Logger.js';
import MommyPurrMessageContext from '../../DTOs/MommyPurrMessageContext.js';
import MommyTextMessageContext from '../../DTOs/MommyTextMessageContext.js';
import AiAssistantBase from '../../Contracts/AiAssistantBase.js';

export default class TelegramBot {
    static MAX_TELEGRAM_MESSAGE_LENGTH = 4095;
    static GRETING_TEXT = 'Начат новый диалог. Жду голосовое или текстовое сообщение.';
    static SWEET_GRETING_TEXT = 'Добро пожаловать в бота. Отправьте голосовое или текстовое сообщение для общения.';

    #bot;
    #botToken;
    #mommy;
    #allowedUserNames;
    #allowedUsersIds;
    #maxContextLength;
    #userRepo;
    #conversationRepo;

    constructor(botConfig, llmMommy, userRepo, conversationRepo) {
        this.#botToken = botConfig.botToken;
        this.#mommy = llmMommy;
        this.#allowedUserNames = botConfig.allowedUserNames ?? [];
        this.#allowedUsersIds = botConfig.allowedUsersIds ?? [];
        this.#maxContextLength = botConfig.maxContextLength ?? 100;
        this.#userRepo = userRepo;
        this.#conversationRepo = conversationRepo;
    }

    initialize() {
        this.#bot = new Telegraf(this.#botToken, {
            handlerTimeout: Infinity
        });

        this.#bot.use(session());
        this.#bot.use(this.sessionNormalizationMiddleware.bind(this));
        this.#bot.catch(this.onError.bind(this));

        this.#bot.command('new', async ctx => await this.executeCommand(ctx, this.onStart.bind(this), TelegramBot.GRETING_TEXT));

        this.#bot.command('start', async ctx => await this.executeCommand(ctx, this.onStart.bind(this), TelegramBot.SWEET_GRETING_TEXT));

        this.#bot.command('history', async ctx => await this.executeCommand(ctx, this.onHistoryCommand.bind(this)));

        this.#bot.on(message('text'), async ctx => await this.executeCommand(ctx, this.onTextMessage.bind(this)));

        this.#bot.on(message('voice'), async ctx => await this.executeCommand(ctx, this.onPurrMessage.bind(this)));

        this.#bot.on('callback_query', async ctx => await this.executeCommand(ctx, this.onCallbackQuery.bind(this)));
    }

    start() {
        this.#bot.launch();
    }

    async executeCommand(ctx, commandHandler, params) {
        const dataObj = typeof ctx?.callbackQuery === 'object' && ctx?.callbackQuery !== null ? ctx?.callbackQuery : ctx?.message;
        if (
            this.#allowedUsersIds?.includes(dataObj?.from?.id?.toString()) ||
            this.#allowedUserNames?.includes(dataObj?.from?.username?.toString()) ||
            this.#allowedUsersIds === 'any' ||
            this.#allowedUserNames === 'any'
        ) {
            await commandHandler(ctx, params);
        } else {
            Logger.warn(dataObj, 'Received message from unknown user...');
        }
    }

    async onStart(ctx, message) {
        try {
            ctx.session = this.getEmptySession();
            await this.#reply(ctx, message);
        } catch (e) {
            Logger.error(e, `Error while proccessing text message`);
            this.#reply(ctx, 'Ошибка при обработке сообщения. `', e.message + '`');
        }
    }

    async onPurrMessage(ctx) {
        try {
            const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
            const userId = ctx.message.from.id.toString();

            const mommyResponse = await this.#mommy.proccessPurrMessage(new MommyPurrMessageContext(userId, ctx.session.messages, link));
            ctx.session.messages = mommyResponse.newContextMessages.slice();

            await this.#reply(ctx, 'Ваш запрос: `' + mommyResponse.lastUserMessageText + '`');
            await this.#replyWithSaveButton(ctx, mommyResponse.assistantResponse.content);
        } catch (e) {
            Logger.error(e, `Error while proccessing voice message`);
            this.#reply(ctx, 'Ошибка при обработке голосового сообщения. `', e.message + '`');
        }
    }

    async onTextMessage(ctx) {
        try {
            const text = ctx.message.text;
            if (typeof text !== 'string' && !ctx.message.text.trim()) {
                return;
            }
            const mommyResponse = await this.#mommy.proccessTextMessage(new MommyTextMessageContext(ctx.message.from.id.toString(), ctx.session.messages, text));
            ctx.session.messages = mommyResponse.newContextMessages.slice();
            await this.#replyWithSaveButton(ctx, mommyResponse.assistantResponse.content);
        } catch (e) {
            Logger.error(e, `Error while proccessing text message`);
            this.#reply(ctx, 'Ошибка при обработке сообщения. `', e.message + '`');
        }
    }

    async onCallbackQuery(ctx) {
        try {
            switch (ctx.update.callback_query.data) {
                case 'save-and-close-conversation':
                    await this.#saveConversation(ctx);
                    ctx.session = this.getEmptySession();
                    this.#reply(ctx, 'Переписка сохранена и закрыта. Вы можете начать новую.');
                    break;
                default: {
                    if (ctx.update.callback_query.data.startsWith('conversation')) {
                        const conversationId = ctx.update.callback_query.data.split('-')[1];
                        const conversation = ctx.session.conversations.find(c => c.id === conversationId.trim());
                        await this.#reply(ctx, this.#formatConversation(conversation));
                    }
                    break;
                }
            }
        } catch (e) {
            Logger.error(e, `Error while handling callback query`);
            this.#reply(ctx, `Ошибка при работе с переписками.`);
        }
    }

    async onHistoryCommand(ctx) {
        try {
            const user = await this.#userRepo.createOrGetUser(ctx.message.from);
            const conversations = await this.#conversationRepo.getConversations(user.id);
            ctx.session.conversations = conversations;

            this.#reply(ctx, '*Ваши переписки:*', ctx.replyWithMarkdown, {
                reply_markup: {
                    inline_keyboard: conversations.map(c => [
                        {
                            text: c.title,
                            callback_data: `conversation-${c.id}`
                        }
                    ])
                }
            });
        } catch (e) {
            Logger.error(e, `Error while getting conversations`);
            this.#reply(ctx, `Ошибка при чтении переписок.`);
        }
    }

    onError(e, ctx) {
        Logger.error(e, `Telegram error while proccessing message`);
        this.#reply(ctx, 'Ошибка при обработке сообщения. `', e.message + '`');
    }

    // TODO: code under that string may be thrown to some other files.

    async #saveConversation(ctx) {
        const user = await this.#userRepo.createOrGetUser(ctx.update.callback_query.from);
        const mommyResponse = await this.#mommy.proccessTextMessage(
            new MommyTextMessageContext(user.id.toString(), ctx.session.messages, 'Напиши, пожалуйста, короткий (до трех слов), но ёмкий заголовок для нашего с тобой чата.')
        );
        await this.#conversationRepo.saveConversation(ctx.session.messages, user.id, mommyResponse.assistantResponse.content);
    }

    #formatConversation(conversation) {
        return (
            `*${conversation.title}*\n\r\n\r` +
            conversation.messages
                .map(m => {
                    if (m.role === AiAssistantBase.ROLES.USER) {
                        return `_- ${m.content}_\n\r\n\r`;
                    }
                    return `${m.content}\n\r\n\r`;
                })
                .join('')
        );
    }

    sessionNormalizationMiddleware(ctx, next) {
        this.normalizeSession(ctx);
        return next();
    }

    normalizeSession(ctx) {
        ctx.session ??= this.getEmptySession();
        if (ctx.session.messages.length > this.#maxContextLength) {
            ctx.session = this.getEmptySession();
        }
    }

    getEmptySession() {
        return {
            messages: [],
            conversations: []
        };
    }

    #replyWithSaveButton(ctx, text) {
        this.#reply(ctx, text, ctx.replyWithMarkdown, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Сохранить и закончить переписку?',
                            callback_data: 'save-and-close-conversation'
                        }
                    ]
                ]
            }
        });
    }

    async #reply(ctx, message, method = ctx.replyWithMarkdown, replyMethodParams = null) {
        const replyMethod = method.bind(ctx);

        if (Buffer.byteLength(message, 'utf-8') <= TelegramBot.MAX_TELEGRAM_MESSAGE_LENGTH) {
            await replyMethod(message, replyMethodParams);
            return;
        }

        const parts = this.#splitMessageByByteLength(message, TelegramBot.MAX_TELEGRAM_MESSAGE_LENGTH);
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (replyMethodParams?.reply_markup?.inline_keyboard?.length && i < parts.length - 1) {
                await replyMethod(part);
                continue;
            }
            await replyMethod(part, replyMethodParams);
        }
    }

    #splitMessageByByteLength(messageText, maxBytes) {
        let result = [];
        let currentPart = '';
        let currentBytes = 0;

        for (const char of messageText) {
            const charBytes = Buffer.byteLength(char, 'utf-8');
            if (currentBytes + charBytes > maxBytes) {
                result.push(currentPart);
                currentPart = '';
                currentBytes = 0;
            }

            currentPart += char;
            currentBytes += charBytes;
        }
        if (currentPart) {
            result.push(currentPart);
        }

        return result;
    }
}
