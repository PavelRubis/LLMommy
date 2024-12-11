export default class BaseMessageContext {
    constructor(ctx, userId, contextMessages) {
        this.ctx = ctx;
        this.userId = userId;
        this.contextMessages = contextMessages;
    }
}
