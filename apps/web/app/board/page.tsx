import type { Metadata } from 'next';
import { getActivityPosts } from '@/lib/queries/activity-posts';
import { BoardClient } from './board-client';

export const metadata: Metadata = {
  title: 'Activity Board | Cairn Connect',
  description: 'Find adventure partners, share permits, and join outdoor activities.',
};

export default async function ActivityBoardPage() {
  const posts = await getActivityPosts();

  return <BoardClient posts={posts} />;
}
