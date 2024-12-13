## LLMommy - simple and quite extensible Telegram bot to chat with [Hugging Face](https://huggingface.co/) and OpenAI LLMs via any [OpenAI API endpoint](https://ollama.com/blog/openai-compatibility).

- [Quick setup](https://github.com/PavelRubis/LLMommy/tree/main?tab=readme-ov-file#quick-setup-for-chatting-with-hugging-face-self-hosted-models) for chatting with **Hugging Face** self-hosted models 
- [Quick setup](https://github.com/PavelRubis/LLMommy/tree/main?tab=readme-ov-file#quick-setup-for-chatting-with-official-openai-api-models) for chatting with **official OpenAI API** models
- [Features](https://github.com/PavelRubis/LLMommy/tree/main?tab=readme-ov-file#features)
- [Commands](https://github.com/PavelRubis/LLMommy/tree/main?tab=readme-ov-file#commands)
---

## Features:
- [x] Chatting with **out of the box self-hosted Hugging Face models**, provided by [vllm](https://github.com/vllm-project/vllm/tree/main)
- [x] Out of the box self-hosted store for chats history -> ability to see previous chats and read it's messages
- [x] Voice messagging with LLM in case of official OpenAI API setup
- [x] Configurable LLM's context window size (size of LLM's memory in bytes)
- [x] Configurable GPU usage percentage
- [x] Configurable chat length (count of messages in chat)
- [ ] Ability to continue previous chats
- [ ] Voice messagging with LLM in case of **_any OpenAI-like API_** setup
- [ ] Response without ratelimit in case of official OpenAI API setup.
- [ ] Localization (en,ru)
---

## Commands
- `/new` -- starts a new chat
- `/history` -- loads all saved previous chats
---

## Quick setup for chatting with **Hugging Face** self-hosted models

### Prerequisites

**All OSs**:
- [Telegram bot Token](https://core.telegram.org/bots#6-botfather)
- [Hugging Face Access Token](https://huggingface.co/settings/tokens)
- **NVIDIA GPU**

**Linux**:
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)

### Installation 
1. Clone Repository
    ``` bash
    git clone https://github.com/PavelRubis/LLMommy
    ```

2. Go to repository directory
    ``` bash
    cd ./LLMommy
    ```

3. Open `local-endpoint.env` file with your favourite editor

4. Paste your Telegram bot token in `TELEGRAM_TOKEN` variable value

5. Paste allowed user's usernames in `TELEGRAM_ALLOWED_USERS_USERNAMES` variable value

6. Paste your Hugging Face Access token in `HUGGING_FACE_HUB_TOKEN` variable value

7. Enter model-name in `AI_ASSISTANT_OPEN_AI_MODEL` value.
   For example: `AI_ASSISTANT_OPEN_AI_MODEL="MTSAIR/Cotype-Nano"`

8. (Optional) allign `GPU_USAGE` and `CONTEXT_WINDOW_LENGTH` variables to fit your needs and GPU VRAM.

9. Save and rename file: `local-endpoint.env` -> `.env`

10. Run docker compose command to start:
``` bash
docker compose -f "docker-compose-local.yml" up -d --build
```
---

## Quick setup for chatting with **official OpenAI API** models

### Prerequisites
- [Telegram bot Token](https://core.telegram.org/bots#6-botfather)
- [OpenAI API key](https://platform.openai.com/)

### Installation 
1. Clone Repository
    ``` bash
    git clone https://github.com/PavelRubis/LLMommy
    ```
2. Go to repository directory
    ``` bash
    cd ./LLMommy
    ```
3. Open `remote-endpoint.env` file 

4. Paste your Telegram bot token in `TELEGRAM_TOKEN` variable value
  
5. Paste allowed user's usernames in `TELEGRAM_ALLOWED_USERS_USERNAMES` variable value

6. Paste your OpenAI API key in `AI_ASSISTANT_OPEN_AI_KEY` variable value

7. Enter OpenAI model-name in `AI_ASSISTANT_OPEN_AI_MODEL` variable value.

8. Save and rename file:  `remote-endpoint.env` -> `.env`

9. Run docker compose command to start:
``` bash
docker compose -f "docker-compose-remote.yml" up -d --build
```
