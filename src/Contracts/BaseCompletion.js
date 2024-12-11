// TODO: TS
export default class BaseCompletion {
    static ROLES = {
        ASSISTANT: 'assistant',
        SYSTEM: 'system',
        USER: 'user'
    };

    constructor(content, role = 'user') {
        this.content = content;
        this.role = role;
    }
}
