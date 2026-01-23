import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export async function CategoriesSidebar() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { sortOrder: 'asc' },
      { viewsCount: 'desc' },
    ],
    take: 20,
  });

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <div className="p-4 sticky top-0">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Categories
        </h2>

        <nav className="space-y-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
            >
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {category.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {category.videoCount}
              </span>
            </Link>
          ))}
        </nav>

        {/* Additional Links */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/models"
            className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            All Models
          </Link>
        </div>
      </div>
    </aside>
  );
}
