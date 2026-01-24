import { prisma } from '@/lib/prisma';
import { VideoCard } from '@/components/video/video-card';
import { notFound } from 'next/navigation';
import { AdBanner } from '@/components/ads/ad-banner';

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) {
    return {
      title: 'Tag Not Found',
    };
  }

  return {
    title: `${tag.name} Videos - XStream`,
    description: `Watch popular ${tag.name} videos on XStream.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  // Fetch Tag and its videos
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      videos: {
        include: {
          video: {
            include: {
              user: {
                 select: {
                    username: true,
                    avatarUrl: true
                 }
              }
            }
          }
        },
        orderBy: {
            video: {
                viewsCount: 'desc'
            }
        },
        take: 32 // Limit to 32 videos for now
      }
    }
  });

  if (!tag) {
    notFound();
  }

  // Extract videos from the relation
  const videos = tag.videos.map(vt => vt.video).filter(v => v.status === 'PUBLISHED');

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      <div className="border-b border-gray-200 dark:border-dark-800 bg-gray-50 dark:bg-dark-950">
        <div className="max-w-[1800px] mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                #{tag.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
                {videos.length} videos found
            </p>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 py-6">
          {/* Ad Slot */}
          <div className="mb-8 flex justify-center">
               <AdBanner slotId="tag-page-header" format="leaderboard" />
          </div>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
          ) : (
            <div className="py-20 text-center">
                <p className="text-gray-500 text-lg">No videos found for this tag yet.</p>
            </div>
          )}
      </div>
    </div>
  );
}
