// TODO: TS
export default class BaseCompletionLLM {
    async createChatCompletion(contextMessages = [], user) {
        throw new Error('AI assistant not configured.');
    }
}
