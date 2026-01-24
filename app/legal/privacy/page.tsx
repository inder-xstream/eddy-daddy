import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - XStream',
};

export default function PrivacyPage() {
  return (
    <div className="bg-white dark:bg-dark-900 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Privacy Policy
        </h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
           <p className="mb-4">
            We value your privacy. This policy details what information we collect and how we use it.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Data Collection</h2>
          <p className="mb-4">
            We collect information you provide directly (username, email) and automatically (IP address, browser type, cookies) to improve our service and for security purposes.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Third-Party Advertising</h2>
          <p className="mb-4">
            We allow third-party companies to serve ads and/or collect certain anonymous information when you visit our web site. These companies may use non-personally identifiable information during your visits to this and other Web sites in order to provide advertisements about goods and services likely to be of greater interest to you.
          </p>
        </div>
      </div>
    </div>
  );
}
