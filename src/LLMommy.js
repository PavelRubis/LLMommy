import { Logger } from './Infrastructure/Utils/Logger.js';
import AiAssistantBase from './Contracts/AiAssistantBase.js';
import MommyResponseContext from './DTOs/MommyResponseContext.js';
import MommyTextMessageContext from './DTOs/MommyTextMessageContext.js';

export default class LLMommy {
    #assistant;
    #translator;

    constructor(aiAssistant, translator) {
        this.#assistant = aiAssistant;
        this.#translator = translator;
    }

    async proccessPurrMessage(mommyPurrContext) {
        try {
            const purrTranscription = await this.#translator.getTranscription(mommyPurrContext.purrFileUrl);
            return this.proccessTextMessage(new MommyTextMessageContext(mommyPurrContext.userId, mommyPurrContext.contextMessages, purrTranscription));
        } catch (e) {
            Logger.error(e, `Error while proccessing voice message`);
        }
    }

    async proccessTextMessage(mommyTextContext) {
        try {
            const newContextMessages = mommyTextContext.contextMessages.slice();
            newContextMessages.push(this.#assistant.formatTextForContext(mommyTextContext.messageText));
            const response = await this.#assistant.chat(newContextMessages, mommyTextContext.userId);
            newContextMessages.push(this.#assistant.formatTextForContext(response.content, AiAssistantBase.ROLES.ASSISTANT));
            return new MommyResponseContext(mommyTextContext.messageText, response, newContextMessages);
        } catch (e) {
            Logger.error(e, `Error while proccessing text message`);
        }
    }
}
