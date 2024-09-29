import { browser } from "$app/environment";

const V = "1";

class LocalStorage {
    static setItem(key: string, value: string) {
        if (browser && localStorage) {
            localStorage.setItem(`v${V}-${key}`, value);
        }
    }

    static getItem(key: string) {
        if (browser && localStorage) {
            return localStorage.getItem(`v${V}-${key}`);
        }

        return null;
    }
}

export default LocalStorage;