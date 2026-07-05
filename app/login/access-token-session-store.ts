type AccessTokenSessionRecord = {
  accessToken: string;
};

export interface AccessTokenSessionStore {
  create(accessToken: string): Promise<string>;
  get(sessionId: string): Promise<AccessTokenSessionRecord | null>;
  set(sessionId: string, accessToken: string): Promise<void>;
  delete(sessionId: string): Promise<void>;
}

class InMemoryAccessTokenSessionStore implements AccessTokenSessionStore {
  private readonly sessions = new Map<string, AccessTokenSessionRecord>();

  async create(accessToken: string) {
    const sessionId = crypto.randomUUID();

    this.sessions.set(sessionId, {
      accessToken,
    });

    return sessionId;
  }

  async get(sessionId: string) {
    return this.sessions.get(sessionId) ?? null;
  }

  async set(sessionId: string, accessToken: string) {
    this.sessions.set(sessionId, {
      accessToken,
    });
  }

  async delete(sessionId: string) {
    this.sessions.delete(sessionId);
  }
}

export const accessTokenSessionStore: AccessTokenSessionStore =
  new InMemoryAccessTokenSessionStore();
