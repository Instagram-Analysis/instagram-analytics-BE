// backend/src/types/express-session.d.ts

/**
 * 1) Import the module so we can augment it
 */
import session from "express-session";

/**
 * 2) Augment the express-session SessionData
 */
declare module "express-session" {
  interface SessionData {
    /** Instagram username stored in session */
    igUsername?: string;
    /** Instagram password (or token) stored in session */
    igPassword?: string;

    twoFactorIdentifier?: string;

    challengeUrl?: string;
  }
}

/**
 * 3) Also tell Express.Request that it has a `session` of that type
 */
declare global {
  namespace Express {
    interface Request {
      session: session.Session & Partial<session.SessionData>;
    }
  }
}
