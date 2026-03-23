export { authContainer } from "./auth/container";
export { churchContainer } from "./church/container";
export { inviteContainer } from "./invite/container";
export { memberContainer } from "./member/container";
export { roleContainer } from "./role/container";

class ContainerProxy {
  get auth() {
    return require("./auth/container").authContainer;
  }

  get church() {
    return require("./church/container").churchContainer;
  }

  get role() {
    return require("./role/container").roleContainer;
  }

  get member() {
    return require("./member/container").memberContainer;
  }

  get invite() {
    return require("./invite/container").inviteContainer;
  }
}

export const container = new ContainerProxy();
