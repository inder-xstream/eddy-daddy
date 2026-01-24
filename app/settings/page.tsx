import { auth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/user/profile-form';

export const metadata = {
  title: 'Settings - XStream',
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/?auth=signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      authProvider: true, 
      role: true,
    }
  });

  if (!user) {
      redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Account Settings
        </h1>
        
        <div className="bg-white dark:bg-dark-800 shadow rounded-lg p-6 border border-gray-200 dark:border-dark-700">
            <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
