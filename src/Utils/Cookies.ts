import Cookies from "js-cookie";

export const saveRememberMeCookies = (username: string, password: string) => {
  Cookies.set("rememberMe", "true", { expires: 7 });
  Cookies.set("username", username, { expires: 7 });
  Cookies.set("password", password, { expires: 7 });
};

export const clearRememberMeCookies = () => {
  Cookies.remove("rememberMe");
  Cookies.remove("username");
  Cookies.remove("password");
};
