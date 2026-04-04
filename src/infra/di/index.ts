export { authContainer } from "./auth/container";
export { churchContainer } from "./church/container";
export { memberContainer } from "./member/container";
export { ministryContainer } from "./ministry/container";
export { roleContainer } from "./role/container";
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

  get role() {
    return require("./role/container").roleContainer;
  }

  get service() {
    return require("./service/container").serviceContainer;
  }
}

export const container = new ContainerProxy();
