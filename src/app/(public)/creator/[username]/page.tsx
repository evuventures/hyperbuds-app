import { redirect } from 'next/navigation';

interface CreatorPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { username } = await params;
  redirect(`/profile/${encodeURIComponent(username)}`);
}
