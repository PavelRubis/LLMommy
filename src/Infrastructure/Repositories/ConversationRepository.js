import { ConversationModel } from '../DBModels/conversation.model.js';

export default class ConversationRepository {
    async saveConversation(messages, userId, title) {
        await new ConversationModel({
            messages,
            userId,
            title
        }).save();
    }

    async getConversationsForUser(userId) {
        return await ConversationModel.find({ userId });
    }

    async getConversation(conversationld) {
        return await ConversationModel.findById(conversationld);
    }
}
