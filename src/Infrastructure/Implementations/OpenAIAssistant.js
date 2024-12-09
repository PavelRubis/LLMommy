import { Configuration, OpenAIApi } from 'openai';
import AiAssistantBase from '../../Contracts/AiAssistantBase.js';

export default class OpenAIAssistant extends AiAssistantBase {
    #MODEL_NAMES = ['MTSAIR/Cotype-Nano', 'gpt-4o-2024-11-20', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-3.5-turbo-1106'];
    #RESERVE_MODEL_NAMES = ['MTSAIR/Cotype-Nano', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-3.5-turbo-1106'];
    #DEFAULT_MODEL_NAME = 'gpt-4o-2024-11-20';
    #RESPONSE_STATUSES = { TO_MANY_REQUESTS: 429 };
    #currentModelName;
    #openaiClient;

    constructor(basePath, apiKey, modelName) {
        super();
        this.#currentModelName = this.#MODEL_NAMES.includes(modelName) ? modelName : this.#DEFAULT_MODEL_NAME;
        this.#createClient(basePath, apiKey);
    }

    async chat(contextMessages = [], user) {
        let requestModelName = this.#currentModelName;
        for (let requestTry = 0; requestTry < this.#RESERVE_MODEL_NAMES.length; requestTry++) {
            try {
                const completion = await this.#createChatCompletion(contextMessages, requestModelName, user);
                return completion.data.choices[0].message;
            } catch (e) {
                if (e.response?.status !== this.#RESPONSE_STATUSES.TO_MANY_REQUESTS || requestTry >= this.#RESERVE_MODEL_NAMES.length) {
                    throw e;
                }
                requestModelName = this.#RESERVE_MODEL_NAMES[requestTry];
            }
        }
        throw new Error('Too many requests to all available OpenAI models.', { type: 'ToManyRequests' });
    }

    formatTextForContext(content, role = 'user') {
        return {
            content,
            role
        };
    }

    async #createChatCompletion(contextMessages = [], modelName, user) {
        return await this.#openaiClient.createChatCompletion({
            model: modelName,
            messages: contextMessages,
            user
        });
    }

    #createClient(basePath, apiKey) {
        if (typeof basePath === 'string' && basePath?.length > 0) {
            this.#openaiClient = new OpenAIApi(new Configuration({ basePath, apiKey }));
            return;
        }
        this.#openaiClient = new OpenAIApi(new Configuration({ apiKey }));
    }
}
