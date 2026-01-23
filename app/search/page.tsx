import { searchVideos, getPopularSearches } from '@/server/actions/search';
import { VideoCard } from '@/components/video/video-card';
import Link from 'next/link';
import { SearchBar } from '@/components/search/search-bar';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: 'relevance' | 'recent' | 'popular';
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  
  return {
    title: query ? `Search: ${query} - XStream` : 'Search - XStream',
    description: 'Search for videos on XStream',
  };
}

async function SearchResults({ query, sortBy }: { query: string; sortBy: 'relevance' | 'recent' | 'popular' }) {
  const { results, count, error } = await searchVideos(query, {
    sortBy,
    limit: 24,
  });

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No results found
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Try adjusting your search terms or browse our{' '}
          <Link href="/" className="text-blue-600 hover:underline">
            trending videos
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {results.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const sortBy = params.sort || 'relevance';

  // Get popular searches if no query
  const popularSearches = !query ? await getPopularSearches(10) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar initialQuery={query} />
        </div>

        {/* No Query State */}
        {!query && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Popular Searches
            </h2>
            {popularSearches.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search) => (
                  <Link
                    key={search}
                    href={`/search?q=${encodeURIComponent(search)}`}
                    className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    #{search}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Start searching to discover amazing videos!
              </p>
            )}
          </div>
        )}

        {/* Search Results */}
        {query && (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Search Results
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Searching for &quot;{query}&quot;
                </p>
              </div>

              {/* Sort Options - Client Component */}
              <form method="get" className="flex items-center gap-2">
                <input type="hidden" name="q" value={query} />
                <label htmlFor="sort" className="text-sm text-gray-600 dark:text-gray-400">
                  Sort by:
                </label>
                <select
                  id="sort"
                  name="sort"
                  defaultValue={sortBy}
                  onChange={(e) => e.currentTarget.form?.submit()}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="recent">Recent</option>
                  <option value="popular">Popular</option>
                </select>
              </form>
            </div>

            {/* Results Grid */}
            <Suspense fallback={
              <div className="flex justify-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              </div>
            }>
              <SearchResults query={query} sortBy={sortBy} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
