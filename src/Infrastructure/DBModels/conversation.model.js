import { Schema, model, Types } from 'mongoose';

const schema = new Schema({
    messages: [{ type: Object, required: true }],
    userId: { type: Types.ObjectId, ref: 'User' },
    title: { type: String, default: Date.now.toString() },
    date: { type: Date, default: Date.now },
    cost: { type: Number, default: 0 }
});

export const ConversationModel = model('Conversation', schema);
