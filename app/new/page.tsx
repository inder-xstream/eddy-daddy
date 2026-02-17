import { prisma } from '@/lib/prisma';
import { VideoCard } from '@/components/video/video-card';
import Link from 'next/link';
import { AdUnit } from '@/components/ads/ad-unit';
import { adConfig } from '@/lib/ads';

export const metadata = {
  title: 'New Videos - eddythedaddy',
  description: 'Watch the latest uploaded videos on eddythedaddy.',
};

export default async function NewVideosPage() {
  const videos = await prisma.video.findMany({
    where: {
      status: 'PUBLISHED',
    },
    orderBy: {
      createdAt: 'desc',
    },
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                New Videos
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-dark-800 px-2 py-1 rounded-full">
                    {videos.length}+
                </span>
            </h1>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 py-6">
          <div className="mb-6 flex justify-center">
             <AdUnit 
               zoneId={adConfig.exoclick.footerZoneId} 
               width={728} 
               height={90} 
               className="shadow-sm"
               fallbackText="728x90 Top Banner"
             />
          </div>

        {videos.length === 0 ? (
          <div className="text-center py-20">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-800 mb-4">
               <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
               </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No new videos
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
