import { Request, Response } from "express";
import {
  IgApiClient,
  IgLoginTwoFactorRequiredError,
} from "instagram-private-api";

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID!;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI!; // e.g. http://localhost:4000/api/auth/callback
const INSTAGRAM_SCOPES = ["user_profile", "user_media"].join(",");

/**
 * Redirects the user to Instagram's OAuth authorization page.
 */
export function oauthRedirect(req: Request, res: Response) {
  console.log("APP ID:", process.env.INSTAGRAM_APP_ID);
  console.log("REDIRECT URI:", process.env.INSTAGRAM_REDIRECT_URI);
  const authUrl =
    `https://api.instagram.com/oauth/authorize` +
    `?client_id=${INSTAGRAM_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(INSTAGRAM_REDIRECT_URI)}` +
    `&scope=${INSTAGRAM_SCOPES}` +
    `&response_type=code`;
  return res.redirect(authUrl);
}

/**
 * Handles the OAuth callback from Instagram:
 * 1) Receives `code` query param
 * 2) (TODO) Exchange it for an access token
 * 3) Store token in session/db
 * 4) Redirect to frontend dashboard
 */
export async function oauthCallback(req: Request, res: Response) {
  const { code, error } = req.query;
  if (error || !code) {
    return res.status(400).send("Authentication failed");
  }

  // TODO: exchange `code` for a Graph API token, e.g.:
  // const tokenRes = await fetch(`https://api.instagram.com/oauth/access_token`, { ... })
  // const { access_token } = await tokenRes.json();
  // req.session!.accessToken = access_token;

  return res.redirect("http://localhost:3000/followers");
}

/**
 * Initialize a new Instagram client with device state.
 */
async function getInstagramClient(username: string): Promise<IgApiClient> {
  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  return ig;
}

/**
 * Legacy: login via instagram-private-api (will be removed)
 */
export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username & password required" });
  }

  const ig = await getInstagramClient(username);

  try {
    await ig.simulate.preLoginFlow();
    await ig.account.login(username, password);
    await ig.simulate.postLoginFlow();

    req.session!.igUsername = username;
    req.session!.igPassword = password;
    return res.json({ ok: true });
  } catch (err: any) {
    const body = err.response?.body || {};

    if (err instanceof IgLoginTwoFactorRequiredError || body.two_factor_info) {
      const info = (body.two_factor_info || {}) as any;
      req.session!.twoFactorIdentifier = info.two_factor_identifier;
      return res.status(401).json({
        twoFactorRequired: true,
        twoFactorMethod: info.two_factor_method,
        twoFactorIdentifier: info.two_factor_identifier,
      });
    }

    if (body.challenge && body.challenge.url) {
      let url = body.challenge.url as string;
      if (!/^https?:\/\//i.test(url)) {
        url = `https://www.instagram.com${url}`;
      }
      return res.status(401).json({
        challengeRequired: true,
        challengeUrl: url,
      });
    }

    console.error("Instagram login error:", err.message, body);
    return res.status(401).json({ error: "Invalid Instagram credentials" });
  }
}

/**
 * Legacy: complete two-factor login
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
 * Logs the user out by destroying their session.
 */
export function logout(req: Request, res: Response) {
  req.session!.destroy((err) => {
    if (err) console.error("Logout error:", err);
    res.json({ ok: true });
  });
}
