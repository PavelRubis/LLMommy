import BaseMessageContext from './BaseMessageContext.js';

export default class VoiceMessageContext extends BaseMessageContext {
    constructor(ctx, userId, contextMessages, fileUrl) {
        super(ctx, userId, contextMessages);
        this.fileUrl = fileUrl;
    }
}
