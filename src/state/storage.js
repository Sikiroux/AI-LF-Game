export const storage = {
  async get(key) {
    return { value: window.localStorage.getItem(key) };
  },
  async set(key, value) {
    window.localStorage.setItem(key, value);
  },
  async delete(key) {
    window.localStorage.removeItem(key);
  },
};
