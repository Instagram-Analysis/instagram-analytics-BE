// backend/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import {
  IgApiClient,
  IgLoginTwoFactorRequiredError,
} from "instagram-private-api";

async function getInstagramClient(username: string): Promise<IgApiClient> {
  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  return ig;
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username & password required" });
  }

  const ig = await getInstagramClient(username);
  try {
    await ig.account.login(username, password);

    // store for subsequent calls
    req.session!.igUsername = username;
    req.session!.igPassword = password;
    return res.json({ ok: true });
  } catch (err: any) {
    if (err instanceof IgLoginTwoFactorRequiredError) {
      // Cast to any so TS won't complain about missing properties
      const info: any = err.response.body.two_factor_info;
      req.session!.twoFactorIdentifier = info.two_factor_identifier;
      return res.status(401).json({
        twoFactorRequired: true,
        twoFactorMethod: info.two_factor_method,
        twoFactorIdentifier: info.two_factor_identifier,
      });
    }
    console.error("Login failed:", err);
    return res.status(401).json({ error: "Invalid Instagram credentials" });
  }
}

export async function twoFactor(req: Request, res: Response) {
  const {
    twoFactorIdentifier,
    igUsername: username,
    igPassword: password,
  } = req.session!;
  const { twoFactorCode } = req.body;

  if (!username || !password || !twoFactorIdentifier) {
    return res
      .status(400)
      .json({ error: "Missing credentials or 2FA identifier in session" });
  }

  const ig = await getInstagramClient(username);
  try {
    await ig.account.twoFactorLogin({
      username,
      verificationCode: twoFactorCode,
      twoFactorIdentifier,
      trustThisDevice: "1",
    });

    delete req.session!.twoFactorIdentifier;
    req.session!.igUsername = username;
    req.session!.igPassword = password;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("2FA login failed:", err);
    return res.status(401).json({ error: "Invalid two-factor code" });
  }
}

export function logout(req: Request, res: Response) {
  req.session!.destroy((err) => {
    if (err) console.error("Logout error:", err);
    res.json({ ok: true });
  });
}
