export default class BaseLLMommy {
    static EVENTS = {
        NEW_TEXT_MESSAGE: 'new-text-message',
        NEW_VOICE_MESSAGE: 'new-voice-message',
        MOMMY_TEXT_MESSAGE_RESPONSE: 'mommy-text-message-response',
        MOMMY_VOICE_MESSAGE_RESPONSE: 'mommy-voice-message-response'
    };

    async onTextMessage(textMessageContext) {
        throw new Error('LLMommy not configured.');
    }

    async onVoiceMessage(voiceMessageContext) {
        throw new Error('LLMommy not configured.');
    }
}
