import { ConversationModel } from '../DBModels/conversation.model.js';

export default class ConversationRepository {
    async saveConversation(messages, userId, title) {
        await new ConversationModel({
            messages,
            userId,
            title
        }).save();
    }

    async getConversations(userId) {
        return await ConversationModel.find({ userId });
    }
}
