import { prisma } from '@/lib/prisma';
import { VideoCard } from '@/components/video/video-card';
import { notFound } from 'next/navigation';
import { AdBanner } from '@/components/ads/ad-banner';
import { auth } from '@/lib/auth-helper';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  return {
    title: `${username}'s Channel - XStream`,
    description: `Watch videos uploaded by ${username} on XStream.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await auth();

  // Fetch User and their videos
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          subscribers: true,
          videos: true,
        },
      },
      videos: {
        where: {
          status: 'PUBLISHED',
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isOwner = session?.user?.username === user.username;

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Channel Header */}
      <div className="bg-gray-100 dark:bg-dark-950 border-b border-gray-200 dark:border-dark-800">
        <div className="max-w-[1800px] mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
               {user.avatarUrl ? (
                 <img src={user.avatarUrl} alt={user.username} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-dark-900 shadow-md" />
               ) : (
                 <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-xred-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-dark-900 shadow-md">
                   {user.username[0].toUpperCase()}
                 </div>
               )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.username}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>{user._count.subscribers} Subscribers</span>
                    <span>•</span>
                    <span>{user._count.videos} Videos</span>
                </div>
                
                {isOwner ? (
                    <button className="px-6 py-2 bg-gray-200 dark:bg-dark-800 text-gray-800 dark:text-gray-200 font-medium rounded-full hover:bg-gray-300 dark:hover:bg-dark-700 transition-colors">
                        Edit Profile
                    </button>
                ) : (
                    <button className="px-8 py-2 bg-xred-600 text-white font-medium rounded-full hover:bg-xred-700 transition-colors shadow-sm">
                        Subscribe
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-800 bg-white dark:bg-dark-950 sticky top-[64px] z-10">
        <div className="max-w-[1800px] mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto no-scrollbar">
            <button className="py-4 text-sm font-medium border-b-2 border-xred-600 text-xred-600 transition-colors">
              Videos <span className="ml-1 text-xs bg-gray-100 dark:bg-dark-800 px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-300">{user._count.videos}</span>
            </button>
            <button className="py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              About
            </button>
            <button className="py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              Playlists
            </button>
             <button className="py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              Photos
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 py-8">
          <div className="mb-8">
              
              {user.videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {user.videos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-gray-50 dark:bg-dark-800/50 rounded-lg border border-dashed border-gray-300 dark:border-dark-700">
                    <p className="text-gray-500 text-lg">This user hasn't uploaded any videos yet.</p>
                </div>
              )}
          </div>
          
          {/* Ad Slot */}
          <div className="my-8 flex justify-center">
             <AdBanner slotId="channel-footer" format="leaderboard" />
          </div>
      </div>
    </div>
  );
}
