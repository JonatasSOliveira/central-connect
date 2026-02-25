import { UserParams } from "./Params";

export class User implements UserParams {
  public readonly id: string;
  public readonly email: string;
  public readonly displayName: string;
  

  constructor(params: UserParams) {
    this.id = params.id;
    this.email = params.email;
    this.displayName = params.displayName;
  }
}