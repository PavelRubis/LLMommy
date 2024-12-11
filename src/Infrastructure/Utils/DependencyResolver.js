import { Configuration } from './Configuration.js';
import OpenAISpeechToTextConverter from '../Implementations/OpenAISpeechToTextConverter.js';
import OpenAICompletionLLM from '../Implementations/OpenAICompletionLLM.js';

const AI_ASSISTANT_TYPES = {
    OPEN_AI: 'open-ai',
    OLLAMA: 'ollama'
};
const SPEECH_TO_TEXT_CONVERTERS_TYPES = {
    OPEN_AI: 'open-ai',
    WHISPER1: 'whisper-1'
};

export default class DependencyResolver {
    static resolveCompletionLLM() {
        switch (Configuration.get('AI_ASSISTANT_TYPE')) {
            case AI_ASSISTANT_TYPES.OPEN_AI: {
                const basePath = Configuration.get('AI_ASSISTANT_OPEN_AI_URI');
                const apiKey = Configuration.get('AI_ASSISTANT_OPEN_AI_KEY');
                const modelName = Configuration.get('AI_ASSISTANT_OPEN_AI_MODEL');
                if (typeof apiKey !== 'string' || !apiKey.length) {
                    throw new Error('Open AI API key not provided.');
                }
                return new OpenAICompletionLLM(basePath, apiKey, modelName);
            }
            default:
                throw new Error('AI assistant not configured.');
        }
    }

    static resolveSpeechToTextConverter() {
        switch (Configuration.get('SPEECH_TO_TEXT_CONVERTER_TYPE')) {
            case SPEECH_TO_TEXT_CONVERTERS_TYPES.OPEN_AI: {
                const apiKey = Configuration.get('AI_ASSISTANT_OPEN_AI_KEY');
                if (typeof apiKey !== 'string' || !apiKey.length) {
                    throw new Error('Open AI API key not provided.');
                }
                return new OpenAISpeechToTextConverter(apiKey);
            }
            default:
                throw new Error('Speech to text converter not configured.');
        }
    }
}
