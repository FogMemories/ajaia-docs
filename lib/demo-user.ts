export const DEFAULT_USER_ID = "6813471a-33b6-40ff-8ba6-f246f504edb4";
const STORAGE_KEY = "ajaia-demo-user-id";

export function getDemoUserId() {
  if (typeof window === "undefined") {
    return DEFAULT_USER_ID;
  }

  return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_USER_ID;
}

export function setDemoUserId(userId: string) {
  window.localStorage.setItem(STORAGE_KEY, userId);
}
