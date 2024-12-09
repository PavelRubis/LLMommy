import MommyMessageContextBase from './MommyMessageContextBase.js';

export default class MommyPurrMessageContext extends MommyMessageContextBase {
    constructor(userId, contextMessages, purrFileUrl) {
        super(userId, contextMessages);
        this.purrFileUrl = purrFileUrl;
    }
}
