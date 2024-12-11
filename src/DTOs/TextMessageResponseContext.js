export default class TextMessageResponseContext {
    constructor(ctx, lastUserMessageText, completionResponse, newContextMessages) {
        this.ctx = ctx;
        this.lastUserMessageText = lastUserMessageText;
        this.completionResponse = completionResponse;
        this.newContextMessages = newContextMessages;
    }
}
