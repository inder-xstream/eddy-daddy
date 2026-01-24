import Link from 'next/link';
import { auth } from '@/lib/auth-helper';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const cards = [
    {
      title: 'Upload Video',
      description: 'Upload new videos to the platform directly.',
      href: '/admin/upload',
      color: 'bg-blue-500',
    },
    {
      title: 'Manage Videos',
      description: 'Review, approve, or delete videos.',
      href: '/admin/videos',
      color: 'bg-green-500',
    },
    {
      title: 'Categories',
      description: 'Manage standard video categories.',
      href: '/admin/categories',
      color: 'bg-purple-500',
    },
    {
      title: 'Tags',
      description: 'Manage seeding video tags.',
      href: '/admin/tags',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link 
              key={card.href} 
              href={card.href}
              className="block group"
            >
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800 transition-transform transform group-hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-lg ${card.color} mb-4 flex items-center justify-center text-white text-xl font-bold opacity-90`}>
                  {card.title[0]}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{card.title}</h2>
                <p className="text-gray-500 dark:text-gray-400">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
