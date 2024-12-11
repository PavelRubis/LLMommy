import { Logger } from './Infrastructure/Utils/Logger.js';
import BaseCompletion from './Contracts/BaseCompletion.js';
import BaseLLMommy from './Contracts/BaseLLMommy.js';
import TextMessageResponseContext from './DTOs/TextMessageResponseContext.js';
import TextMessageContext from './DTOs/TextMessageContext.js';

export default class LLMommy extends BaseLLMommy {
    #completionLLM;
    #translator;
    #eventEmitter;

    constructor(completionLLM, translator, eventEmitter) {
        super();
        this.#completionLLM = completionLLM;
        this.#translator = translator;
        this.#eventEmitter = eventEmitter;
        this.#eventEmitter.on(BaseLLMommy.EVENTS.NEW_TEXT_MESSAGE, this.onTextMessage.bind(this));
        this.#eventEmitter.on(BaseLLMommy.EVENTS.NEW_VOICE_MESSAGE, this.onVoiceMessage.bind(this));
    }

    async onTextMessage(textMessageContext) {
        try {
            const textMessageResponse = await this.#getCompletion(textMessageContext);
            this.#eventEmitter.emit(BaseLLMommy.EVENTS.MOMMY_TEXT_MESSAGE_RESPONSE, textMessageResponse);
        } catch (e) {
            Logger.error(e, `Error while proccessing text message`);
        }
    }

    async onVoiceMessage(voiceMessageContext) {
        try {
            const voiceTranscription = await this.#translator.createFileTranscription(voiceMessageContext.fileUrl);
            const voiceMessageResponse = await this.#getCompletion(
                new TextMessageContext(voiceMessageContext.ctx, voiceMessageContext.userId, voiceMessageContext.contextMessages, voiceTranscription)
            );
            this.#eventEmitter.emit(BaseLLMommy.EVENTS.MOMMY_VOICE_MESSAGE_RESPONSE, voiceMessageResponse);
        } catch (e) {
            Logger.error(e, `Error while proccessing voice message`);
        }
    }

    async #getCompletion(textMessageContext) {
        const newContextMessages = textMessageContext.contextMessages.slice();
        newContextMessages.push(new BaseCompletion(textMessageContext.messageText));
        const response = await this.#completionLLM.createChatCompletion(newContextMessages, textMessageContext.userId);
        newContextMessages.push(new BaseCompletion(response.content, BaseCompletion.ROLES.ASSISTANT));
        return new TextMessageResponseContext(textMessageContext.ctx, textMessageContext.messageText, response, newContextMessages);
    }
}
