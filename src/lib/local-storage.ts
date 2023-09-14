import { browser } from "$app/environment";

class LocalStorage {
    static setItem(key: string, value: string) {
        if (browser && localStorage) {
            localStorage.setItem(key, value);
        }
    }

    static getItem(key: string) {
        if (browser && localStorage) {
            return localStorage.getItem(key);
        }

        return null;
    }
}

export default LocalStorage;