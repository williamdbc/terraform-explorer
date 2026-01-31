// src/services/SessionService.ts

const TOKEN_KEY = "access_token";

export class SessionService {
  /**
   * Salva o token de acesso no localStorage
   */
  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Retorna o token atual ou null se não existir
   */
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Remove o token (logout)
   */
  static clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Verifica se o usuário está "logado" (tem token salvo)
   * Nota: não valida se o token é válido, só presença
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Logout completo: limpa token e (opcional) recarrega página
   */
  static logout(reload = true): void {
    this.clearToken();
    if (reload) {
      window.location.reload();
    }
  }

  // Futuro: se quiser salvar mais coisas (ex: user info)
  // static setUser(user: UserInfo) { localStorage.setItem("user", JSON.stringify(user)); }
  // static getUser(): UserInfo | null { ... }
}