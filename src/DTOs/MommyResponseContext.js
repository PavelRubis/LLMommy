export default class MommyResponseContext {
    constructor(lastUserMessageText, assistantResponse, newContextMessages) {
        this.lastUserMessageText = lastUserMessageText;
        this.assistantResponse = assistantResponse;
        this.newContextMessages = newContextMessages;
    }
}
