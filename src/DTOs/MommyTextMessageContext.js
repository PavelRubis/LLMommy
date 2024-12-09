import MommyMessageContextBase from './MommyMessageContextBase.js';

export default class MommyTextMessageContext extends MommyMessageContextBase {
    constructor(userId, contextMessages, messageText) {
        super(userId, contextMessages);
        this.messageText = messageText;
    }
}
