import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMCA / Copyright - XStream',
};

export default function DMCAPage() {
  return (
    <div className="bg-white dark:bg-dark-900 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          DMCA Notice & Takedown Procedure
        </h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
           <p className="mb-4">
            XStream respects the intellectual property rights of others. We comply with the Digital Millennium Copyright Act (DMCA).
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Reporting Copyright Infringement</h2>
          <p className="mb-4">
            If you believe your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible on this site, please notify our copyright agent.
          </p>

           <div className="bg-gray-100 dark:bg-dark-800 p-4 rounded-lg mb-6">
            <p className="font-mono text-sm">
              <strong>DMCA Designated Agent</strong><br />
              legal@xstream.example.com
            </p>
          </div>

          <p className="mb-4">
            To be effective, the notification must include:
          </p>
           <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>A physical or electronic signature of the copyright owner;</li>
            <li>Identification of the copyrighted work claimed to have been infringed;</li>
            <li>Identification of the material that is claimed to be infringing and where it is located on the Service;</li>
            <li>Contact information (address, telephone number, email);</li>
            <li>A statement of good faith belief that the use is not authorized;</li>
            <li>A statement that the information is accurate and made under penalty of perjury.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
