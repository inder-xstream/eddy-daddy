import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - XStream',
};

export default function TermsPage() {
  return (
    <div className="bg-white dark:bg-dark-900 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Terms of Service
        </h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          <p className="mb-4">
            <strong>Last Updated: January 24, 2026</strong>
          </p>
          
          <p className="mb-4">
            By accessing XStream, you certify that you are at least 18 years of age (or the age of majority in your jurisdiction, whichever is greater) and that accessing sexually explicit material is legal in your community.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using our website, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. User Conduct</h2>
          <p className="mb-4">
            You agree not to use the service for any illegal purpose or in any way that interrupts, damages, or impairs the service. You specifically agree not to upload content that depicts non-consensual sexual acts, minors, violence, or "revenge porn".
          </p>

           <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Content Ownership</h2>
          <p className="mb-4">
            Users retain ownership of the content they upload but grant XStream a worldwide, non-exclusive, royalty-free license to host, display, and distribute said content.
          </p>
        </div>
      </div>
    </div>
  );
}
