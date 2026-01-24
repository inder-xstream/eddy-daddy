import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '18 U.S.C. 2257 Record-Keeping Compliance - XStream',
};

export default function Compliance2257Page() {
  return (
    <div className="bg-white dark:bg-dark-900 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          18 U.S.C. 2257 Compliance Statement
        </h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          <p className="mb-4">
            XStream operates in strict compliance with 18 U.S.C. § 2257 and 28 C.F.R. 75. All models, actors, actresses, and other persons affecting the content of the visual depictions on this website were over the age of eighteen years at the time the visual depictions were created.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Records Custodian</h2>
          <p className="mb-4">
            The records required pursuant to 18 U.S.C. § 2257 and 28 C.F.R. 75 for all content produced by XStream are kept by the custodian of records at the following address:
          </p>
          
          <div className="bg-gray-100 dark:bg-dark-800 p-4 rounded-lg mb-6">
            <p className="font-mono text-sm">
              <strong>XStream Custodian of Records</strong><br />
              123 Test Street, Suite 100<br />
              New York, NY 10001<br />
              USA<br />
              compliance@xstream.example.com
            </p>
          </div>

           <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Content Exemptions</h2>
          <p className="mb-4">
           Certain content found on this website may be exempt from the record-keeping requirements of 18 U.S.C. § 2257 because it:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Consists purely of simulated sexual conduct;</li>
            <li>Was created before July 3, 1995;</li>
            <li>Was not produced by the operators of this website (Secondary Producer exemption).</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">User Generated Content</h2>
          <p className="mb-4">
            Any User Generated Content (UGC) is subject to strict review. Users uploading content must certify that they are the original producer of the content and that all performers were 18 years of age or older at the time of production. We reserve the right to request proof of age and identity for any performer in any video.
          </p>
        </div>
      </div>
    </div>
  );
}
