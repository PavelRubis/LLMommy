// TODO: TS
export default class SpeechToTextConverterBase {
    async getTranscription(fileUrl) {
        throw new Error('Speech to text converter not configured.');
    }
}
