// backend/src/services/instagram.service.ts

import { IgApiClient } from "instagram-private-api";
import { Follower, Liker } from "../types/instagram";

/**
 * Log in with the given credentials and return an authenticated client.
 */
async function getAuthenticatedClient(
  username: string,
  password: string
): Promise<IgApiClient> {
  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  await ig.account.login(username, password);
  return ig;
}

/**
 * Exhaustively pages through any feed by repeatedly calling `.items()`.
 */
async function fetchAllFromFeed<T>(feed: {
  items(): Promise<T[]>;
}): Promise<T[]> {
  const all: T[] = [];
  while (true) {
    const page = await feed.items();
    if (page.length === 0) break;
    all.push(...page);
  }
  return all;
}

/**
 * Fetch all users who follow the logged-in account.
 */
export async function fetchFollowers(
  username: string,
  password: string
): Promise<Follower[]> {
  const ig = await getAuthenticatedClient(username, password);
  const mePk = ig.state.cookieUserId!;
  const feed = ig.feed.accountFollowers(mePk);
  const users: any[] = await fetchAllFromFeed(feed);

  return users.map((u) => ({
    id: u.pk.toString(),
    username: u.username,
    avatarUrl: u.profile_pic_url,
  }));
}

/**
 * Fetch all users whom the logged-in account is following.
 */
export async function fetchFollowing(
  username: string,
  password: string
): Promise<Follower[]> {
  const ig = await getAuthenticatedClient(username, password);
  const mePk = ig.state.cookieUserId!;
  const feed = ig.feed.accountFollowing(mePk);
  const users: any[] = await fetchAllFromFeed(feed);

  return users.map((u) => ({
    id: u.pk.toString(),
    username: u.username,
    avatarUrl: u.profile_pic_url,
  }));
}

/**
 * Compute “people I follow who don’t follow me back.”
 */
export async function fetchNonFollowers(
  username: string,
  password: string
): Promise<Follower[]> {
  const [followers, following] = await Promise.all([
    fetchFollowers(username, password),
    fetchFollowing(username, password),
  ]);
  const followerIds = new Set(followers.map((u) => u.id));
  return following.filter((u) => !followerIds.has(u.id));
}

/**
 * Aggregate who liked your media the most.
 */
export async function fetchTopLikers(
  username: string,
  password: string
): Promise<Liker[]> {
  const ig = await getAuthenticatedClient(username, password);
  const mePk = ig.state.cookieUserId!;

  // 1) Page through all of your media
  const mediaFeed = ig.feed.user(mePk);
  const mediaItems: any[] = await fetchAllFromFeed(mediaFeed);

  // 2) For each media, fetch its likers
  const counts: Record<
    string,
    { username: string; avatarUrl: string; likes: number }
  > = {};

  for (const media of mediaItems) {
    // ig.media.likers may return either an array or an object with `.users`
    const likersResponse: any = await ig.media.likers(media.id);
    const likers: any[] = Array.isArray(likersResponse)
      ? likersResponse
      : likersResponse.users || [];

    for (const liker of likers) {
      const id = liker.pk.toString();
      if (!counts[id]) {
        counts[id] = {
          username: liker.username,
          avatarUrl: liker.profile_pic_url,
          likes: 0,
        };
      }
      counts[id].likes += 1;
    }
  }

  // 3) Convert to a sorted array by like count descending
  return Object.entries(counts)
    .map(([id, u]) => ({
      id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      likes: u.likes,
    }))
    .sort((a, b) => b.likes - a.likes);
}
