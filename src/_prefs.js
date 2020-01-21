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
export const autoplayinterval = store("autoplayinterval");
export const favorite = store("favorite");
export const over18 = store("over18");
export const multireddit = store("multireddit");
export const prefetch = store("prefetch");
export const hires = store("hires");
