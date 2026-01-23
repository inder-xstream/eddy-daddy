import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              XStream
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-8">
              <Link
                href="/browse"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
              >
                Browse
              </Link>
              <Link
                href="/trending"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
              >
                Trending
              </Link>
              <Link
                href="/subscriptions"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
              >
                Subscriptions
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Button */}
            <Link
              href="/search"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Search</span>
            </Link>
            
            
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
