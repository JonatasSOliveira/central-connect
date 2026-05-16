export { authContainer } from "./auth/container";
export { churchContainer } from "./church/container";
export { memberContainer } from "./member/container";
export { ministryContainer } from "./ministry/container";
export { notificationContainer } from "./notification/container";
export { roleContainer } from "./role/container";
export { scaleContainer } from "./scale/container";
export { selfSignupContainer } from "./self-signup/container";
export { serviceContainer } from "./service/container";

class ContainerProxy {
  get auth() {
    return require("./auth/container").authContainer;
  }

  get church() {
    return require("./church/container").churchContainer;
  }

  get member() {
    return require("./member/container").memberContainer;
  }

  get ministry() {
    return require("./ministry/container").ministryContainer;
  }

  get notification() {
    return require("./notification/container").notificationContainer;
  }

  get role() {
    return require("./role/container").roleContainer;
  }

  get scale() {
    return require("./scale/container").scaleContainer;
  }

  get service() {
    return require("./service/container").serviceContainer;
  }

  get selfSignup() {
    return require("./self-signup/container").selfSignupContainer;
  }
}

export const container = new ContainerProxy();
