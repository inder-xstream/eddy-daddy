import { getAdminVideos } from '@/server/actions/video';
import { VideoList } from '@/components/admin/video-list';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helper';

export default async function AdminVideosPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch initial data
  const { videos, total, pages } = await getAdminVideos(1, 100); // Fetch first 100 for now

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Videos</h1>
          <div className="text-gray-500">Total: {total}</div>
        </div>
        
        <VideoList 
          initialVideos={videos as any[]} // Type assertion/mapping might be needed if Prisma types mismatch slightly 
          currentPage={1}
          totalPages={pages}
        />
      </div>
    </div>
  );
}
