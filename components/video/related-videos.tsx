import { prisma } from '@/lib/prisma';
import { VideoCard } from '@/components/video/video-card';

interface RelatedVideosProps {
  videoId: string;
}

export async function RelatedVideos({ videoId }: RelatedVideosProps) {
  // 1. Get current video's category IDs
  const currentVideo = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      tags: true, 
      userId: true,
      videoCategories: {
        select: { categoryId: true }
      }
    }
  });

  const categoryIds = currentVideo?.videoCategories.map(vc => vc.categoryId) || [];
  const tags = currentVideo?.tags || [];
  const authorId = currentVideo?.userId;

  // 2. Fetch related
  // Priority: 
  // 1. Same Author + Same Tags/Category
  // 2. Same Tags
  // 3. Same Category
  // We can simulate this with a single query sorting by multiple criteria or score, 
  // but for simplicity in Prisma, we'll fetch broad matches and sort by views/recency.
  const relatedVideos = await prisma.video.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: videoId }, // Exclude current
      OR: [
        { videoCategories: { some: { categoryId: { in: categoryIds } } } },
        { tags: { hasSome: tags } },
        { userId: authorId }
      ]
    },
    orderBy: [
       // Simple mix ranking: Newest first within related cluster
       { viewsCount: 'desc' },
       { createdAt: 'desc' }
    ],
    take: 12,
    include: {
      user: {
        select: { username: true, avatarUrl: true } 
      }
    }
  });

  if (relatedVideos.length === 0) return null;

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">
        Related Videos
      </h3>
      
      {/* 
        Layout Grid: 
        Mobile: 1 column (list below player) or 2 columns
        Desktop: 1 column (vertical sidebar) 
        This is typically handled by the parent grid in page.tsx. 
        Here we define the internal structure. 
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4">
        {relatedVideos.map((video) => (
          <VideoCard 
            key={video.id} 
            video={{
                ...video,
                thumbnailUrl: video.thumbnailUrl || null,
                duration: video.duration || null,
                // Pass minimal required fields. VideoCard interface implementation expects bunyVideoId, title, etc. which are in 'video'
            }} 
          />
        ))}
      </div>
    </div>
  );
}