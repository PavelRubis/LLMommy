export default class AsyncEventEmitter {
    #events;

    constructor() {
        this.#events = new Map();
    }

    emit(event, ...args) {
        if (this.#events.has(event)) {
            const listeners = this.#events.get(event).slice();
            return Promise.all(listeners.map(listener => listener(...args)));
        }
        return Promise.resolve();
    }

    on(event, listener) {
        if (!this.#events.has(event)) {
            this.#events.set(event, []);
        }
        this.#events.get(event).push(listener);
    }

    off(event, listener) {
        if (this.#events.has(event)) {
            const listeners = this.#events.get(event);
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
            if (listeners.length === 0) {
                this.#events.delete(event);
            }
        }
    }
}
