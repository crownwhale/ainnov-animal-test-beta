declare module "@supabase/auth-js" {
  export interface User {
    id: string;
    [key: string]: unknown;
  }

  export interface Session {
    access_token?: string;
    refresh_token?: string;
    user?: User | null;
    [key: string]: unknown;
  }

  export interface GoTrueClientOptions {
    [key: string]: unknown;
  }

  export class AuthClient {
    constructor(options?: GoTrueClientOptions);
    getSession(): Promise<{
      data: { session: Session | null };
      error: unknown;
    }>;
    signInAnonymously(
      credentials?: { options?: Record<string, unknown> } | undefined,
    ): Promise<{
      data: { user: User | null; session: Session | null };
      error: unknown;
    }>;
  }
}
