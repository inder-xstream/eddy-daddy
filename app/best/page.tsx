import { prisma } from '@/lib/prisma';
import { VideoCard } from '@/components/video/video-card';
import Link from 'next/link';
import { AdBanner } from '@/components/ads/ad-banner';

interface BestVideosPageProps {
  searchParams: Promise<{
    sort?: string;
  }>;
}

export const metadata = {
  title: 'Best Videos - XStream',
  description: 'Watch the most popular videos on XStream.',
};

export default async function BestVideosPage({ searchParams }: BestVideosPageProps) {
  const { sort } = await searchParams;
  const currentSort = sort === 'rated' ? 'rated' : 'views';

  let orderBy: any = {};
  if (currentSort === 'rated') {
    orderBy = { likesCount: 'desc' };
  } else {
    orderBy = { viewsCount: 'desc' };
  }

  const videos = await prisma.video.findMany({
    where: {
      status: 'PUBLISHED',
    },
    orderBy,
    take: 60,
    include: {
      user: {
        select: {
          username: true,
          avatarUrl: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      <div className="border-b border-gray-200 dark:border-dark-800 bg-gray-50 dark:bg-dark-950">
        <div className="max-w-[1800px] mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                    Best Videos
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-dark-800 px-2 py-1 rounded-full">
                        Top 60
                    </span>
                </h1>

                <div className="flex bg-gray-200 dark:bg-dark-800 p-1 rounded-lg self-start">
                    <Link
                        href="/best?sort=views"
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                            currentSort === 'views' 
                            ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        Most Viewed
                    </Link>
                    <Link
                        href="/best?sort=rated"
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                            currentSort === 'rated' 
                            ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        Top Rated
                    </Link>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 py-6">
          <div className="mb-6 flex justify-center">
               <AdBanner slotId="best-videos-top" format="leaderboard" />
          </div>

        {videos.length === 0 ? (
          <div className="text-center py-20">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-800 mb-4">
               <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
               </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No videos found
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
