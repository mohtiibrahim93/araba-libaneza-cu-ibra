const KEY = "admin_pwd_v1";

export const getStoredAdminPassword = (): string => {
  try {
    return sessionStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
};

export const setStoredAdminPassword = (pwd: string) => {
  try {
    if (pwd) sessionStorage.setItem(KEY, pwd);
    else sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};

export const clearStoredAdminPassword = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};