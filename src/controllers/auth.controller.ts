// backend/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { IgApiClient } from "instagram-private-api";

async function verifyCredentials(username: string, password: string) {
  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  await ig.account.login(username, password);
  return true;
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username & password required" });
  }

  try {
    await verifyCredentials(username, password);
    // store for subsequent calls
    req.session!.igUsername = username;
    req.session!.igPassword = password;
    res.json({ ok: true });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(401).json({ error: "Invalid Instagram credentials" });
  }
}

export function logout(req: Request, res: Response) {
  req.session!.destroy((err) => {
    if (err) console.error("Logout error:", err);
    res.json({ ok: true });
  });
}
