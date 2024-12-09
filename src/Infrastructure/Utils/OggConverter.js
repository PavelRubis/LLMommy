import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import axios from 'axios';
import { Logger } from '../Utils/Logger.js';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class OggConverter {
    #trashPathes;

    constructor() {
        ffmpeg.setFfmpegPath(installer.path);
        this.#trashPathes = [];
    }

    async download(url, filename) {
        try {
            const oggPath = resolve(__dirname, './voices', `${filename}.ogg`);
            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream'
            });
            return new Promise(resolve => {
                const stream = createWriteStream(oggPath);
                response.data.pipe(stream);
                stream.on('finish', () => {
                    this.#trashPathes.push(oggPath);
                    resolve(oggPath);
                });
            });
        } catch (e) {
            Logger.error(e, 'Error while creating ogg file');
        }
    }

    toMp3(oggFilePath, mp3FileName) {
        const outputPath = resolve(dirname(oggFilePath), `${mp3FileName}.mp3`);

        return new Promise((resolve, reject) => {
            ffmpeg(oggFilePath)
                .inputOptions('-t 30')
                .output(outputPath)
                .on('end', () => {
                    this.#trashPathes.push(outputPath);
                    resolve(outputPath);
                })
                .on('error', err => reject(err.message))
                .run();
        });
    }

    async cleanTrash() {
        for (let index = 0; index < this.#trashPathes.length; index++) {
            const path = this.#trashPathes[index];
            try {
                await unlink(path);
            } catch (e) {
                Logger.error(e, `Error while unlinking file`);
            }
        }
    }
}
