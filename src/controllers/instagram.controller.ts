// backend/src/controllers/instagram.controller.ts
import { Request, Response } from "express";
import * as svc from "../services/instagram.service";

function credsFromSession(req: Request) {
  return {
    username: req.session!.igUsername as string,
    password: req.session!.igPassword as string,
  };
}

export async function getFollowers(req: Request, res: Response) {
  try {
    const { username, password } = credsFromSession(req);
    const data = await svc.fetchFollowers(username, password);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
}

export async function getFollowing(req: Request, res: Response) {
  try {
    const { username, password } = credsFromSession(req);
    const data = await svc.fetchFollowing(username, password);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch following" });
  }
}

export async function getNonFollowers(req: Request, res: Response) {
  try {
    const { username, password } = credsFromSession(req);
    const data = await svc.fetchNonFollowers(username, password);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch non-followers" });
  }
}

export async function getTopLikers(req: Request, res: Response) {
  try {
    const { username, password } = credsFromSession(req);
    const data = await svc.fetchTopLikers(username, password);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch top likers" });
  }
}
