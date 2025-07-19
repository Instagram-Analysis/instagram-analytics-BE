import { Request, Response } from 'express';
import * as svc from '../services/instagram.service';

export async function getFollowers(req: Request, res: Response) {
  try {
    const data = await svc.fetchFollowers();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
}

export async function getFollowing(req: Request, res: Response) {
  try {
    const data = await svc.fetchFollowing();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
}

export async function getNonFollowers(req: Request, res: Response) {
  try {
    const data = await svc.fetchNonFollowers();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch non-followers' });
  }
}

export async function getTopLikers(req: Request, res: Response) {
  try {
    const data = await svc.fetchTopLikers();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch top likers' });
  }
}
