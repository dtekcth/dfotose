import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user: {
      cid: string;
      dfotoMember: boolean;
      created_at: Date;
      updated_at: Date;
      fullname?: string;
      role?: string;
    };
  }
}
