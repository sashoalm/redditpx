import { writable } from "svelte/store";

const store = (key, initialValue) => {
  const { subscribe, set } = writable(initialValue);

  return {
    subscribe,
    set,
    useLocalStorage: defaultValue => {
      if (!process.browser) return;

      const json = localStorage.getItem(key);

      if (json) {
        set(JSON.parse(json));
      } else {
        set(defaultValue);
      }

      subscribe(current => {
        localStorage.setItem(key, JSON.stringify(current));
      });
    }
  };
};

export const autoplay = store("autoplay");
export const selected = store("selected");
export const over18 = store("over18");
