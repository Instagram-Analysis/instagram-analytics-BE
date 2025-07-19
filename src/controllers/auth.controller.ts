// backend/src/controllers/auth.controller.ts

import { Request, Response } from "express";
import {
  IgApiClient,
  IgLoginTwoFactorRequiredError,
} from "instagram-private-api";

/**
 * Initialize a new Instagram client with device state.
 */
async function getInstagramClient(username: string): Promise<IgApiClient> {
  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  return ig;
}

/**
 * POST /api/auth/login
 *  - Attempts a normal login (with pre/post flows)
 *  - If 2FA is required, responds { twoFactorRequired, twoFactorMethod, twoFactorIdentifier }
 *  - If checkpoint (challenge) is required, responds { challengeRequired, challengeUrl }
 */
export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username & password required" });
  }

  const ig = await getInstagramClient(username);

  try {
    // Mimic official app behavior
    await ig.simulate.preLoginFlow();
    await ig.account.login(username, password);
    await ig.simulate.postLoginFlow();

    // Success! Store credentials in session
    req.session!.igUsername = username;
    req.session!.igPassword = password;
    return res.json({ ok: true });
  } catch (err: any) {
    const body = err.response?.body || {};

    // --- 2FA required? ---
    if (err instanceof IgLoginTwoFactorRequiredError || body.two_factor_info) {
      const info = (body.two_factor_info || {}) as any;
      req.session!.twoFactorIdentifier = info.two_factor_identifier;
      return res.status(401).json({
        twoFactorRequired: true,
        twoFactorMethod: info.two_factor_method,
        twoFactorIdentifier: info.two_factor_identifier,
      });
    }

    // --- Checkpoint/Challenge required? ---
    if (body.challenge && body.challenge.url) {
      let url = body.challenge.url as string;
      // If it’s not already absolute, prefix it
      if (!/^https?:\/\//i.test(url)) {
        url = `https://www.instagram.com${url}`;
      }
      return res.status(401).json({
        challengeRequired: true,
        challengeUrl: url,
      });
    }

    // Fallback
    console.error("Instagram login error:", err.message, body);
    return res.status(401).json({ error: "Invalid Instagram credentials" });
  }
}

/**
 * POST /api/auth/two-factor
 * Completes the 2FA step when Instagram has sent a code.
 */
export async function twoFactor(req: Request, res: Response) {
  const {
    twoFactorIdentifier,
    igUsername: username,
    igPassword: password,
  } = req.session!;
  const { twoFactorCode } = req.body;

  if (!username || !password || !twoFactorIdentifier || !twoFactorCode) {
    return res.status(400).json({ error: "Missing 2FA information" });
  }

  const ig = await getInstagramClient(username);

  try {
    await ig.account.twoFactorLogin({
      username,
      verificationCode: twoFactorCode,
      twoFactorIdentifier,
      trustThisDevice: "1",
    });
    await ig.simulate.postLoginFlow();

    // Clear 2FA state, mark as authenticated
    delete req.session!.twoFactorIdentifier;
    req.session!.igUsername = username;
    req.session!.igPassword = password;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("2FA login failed:", err.message, err.response?.body || "");
    return res.status(401).json({ error: "Invalid two-factor code" });
  }
}

/**
 * POST /api/auth/logout
 * Destroys the session.
 */
export function logout(req: Request, res: Response) {
  req.session!.destroy((err) => {
    if (err) console.error("Logout error:", err);
    res.json({ ok: true });
  });
}
