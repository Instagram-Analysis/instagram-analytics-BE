// stub implementations for now—later wire these up to the Graph API
import { Follower, Liker } from '../../types/instagram';

export async function fetchFollowers(): Promise<Follower[]> {
  return [
    { id: '1', username: 'alice', avatarUrl: 'https://via.placeholder.com/32' },
    { id: '2', username: 'bob',   avatarUrl: 'https://via.placeholder.com/32' }
  ];
}

export async function fetchFollowing(): Promise<Follower[]> {
  return [
    { id: '3', username: 'carol', avatarUrl: 'https://via.placeholder.com/32' },
    { id: '4', username: 'dave',  avatarUrl: 'https://via.placeholder.com/32' }
  ];
}

export async function fetchNonFollowers(): Promise<Follower[]> {
  // e.g. difference between following & followers
  return [
    { id: '3', username: 'carol', avatarUrl: 'https://via.placeholder.com/32' }
  ];
}

export async function fetchTopLikers(): Promise<Liker[]> {
  return [
    { id: '10', username: 'erin',  avatarUrl: 'https://via.placeholder.com/32', likes: 42 },
    { id: '11', username: 'frank', avatarUrl: 'https://via.placeholder.com/32', likes: 37 }
  ];
}
