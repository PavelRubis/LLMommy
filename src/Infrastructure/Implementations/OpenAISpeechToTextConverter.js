import { createReadStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Configuration, OpenAIApi } from 'openai';
import OggConverter from '../Utils/OggConverter.js';
import SpeechToTextConverterBase from '../../Contracts/SpeechToTextConverterBase.js';

export default class OpenAISpeechToTextConverter extends SpeechToTextConverterBase {
    #openaiClient;
    #oggConverter;

    constructor(apiKey) {
        super();
        this.#oggConverter = new OggConverter();
        this.#openaiClient = new OpenAIApi(
            new Configuration({
                apiKey
            })
        );
    }

    async getTranscription(fileUrl) {
        try {
            const tempFileName = uuidv4();
            const oggPath = await this.#oggConverter.download(fileUrl, tempFileName);
            const mp3Path = await this.#oggConverter.toMp3(oggPath, tempFileName);
            const response = await this.#openaiClient.createTranscription(createReadStream(mp3Path), 'whisper-1');
            return response.data.text;
        } finally {
            this.#oggConverter.cleanTrash();
        }
    }
}
