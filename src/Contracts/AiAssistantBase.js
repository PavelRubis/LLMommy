// TODO: TS
export default class AiAssistantBase {
    static ROLES = {
        ASSISTANT: 'assistant',
        SYSTEM: 'system',
        USER: 'user'
    };

    async chat(contextMessages = [], user) {
        throw new Error('AI assistant not configured.');
    }

    formatMessageForContext(content, role = 'user') {
        throw new Error('AI assistant not configured.');
    }
}
