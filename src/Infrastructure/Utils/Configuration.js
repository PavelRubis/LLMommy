import config from 'config';

class Config {
    has(key) {
        return process.env[key] || config.has(key);
    }

    get(key) {
        if (typeof process.env[key] === 'string' && process.env[key] !== null) {
            return process.env[key];
        }
        if (config.has(key)) {
            return config.get(key);
        }
        return undefined;
    }
}

export const Configuration = new Config();
