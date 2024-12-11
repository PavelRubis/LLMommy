import MessageContextBase from './BaseMessageContext.js';

export default class TextMessageContext extends MessageContextBase {
    constructor(ctx, userId, contextMessages, messageText) {
        super(ctx, userId, contextMessages);
        this.messageText = messageText;
    }
}
