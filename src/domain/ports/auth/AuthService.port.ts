export interface AuthService {
  createUser(email: string, password: string): Promise<string>;
  authenticate(email: string, password: string): Promise<string>;
}
