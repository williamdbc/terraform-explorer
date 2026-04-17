const TOKEN_KEY = "access_token";

export class SessionService {
  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static handleExpiredSession(): void {
    this.clearToken();
  }

  static logout(reload = true): void {
    this.clearToken();
    if (reload) {
      window.location.reload();
    }
  }
}