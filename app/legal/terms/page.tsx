export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose dark:prose-invert max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using eddythedaddy ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, including the mandatory arbitration provision and class action waiver, you may not access or use the Service.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old (or the age of majority in your jurisdiction) to use the Service. By using the Service, you represent and warrant that you meet these eligibility requirements.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          To access certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.
        </p>

        <h2>4. Content Guidelines</h2>
        <p>
          You retain ownership of the content you upload ("User Content"). However, by uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, distribute, and display your content in connection with the Service.
        </p>
        <p>You agree not to upload content that:</p>
        <ul>
          <li>Violates any third-party intellectual property rights.</li>
          <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, or obscene.</li>
          <li>Contains malware, viruses, or other harmful code.</li>
          <li>Depicts non-consensual sexual acts or child sexual abuse material (CSAM).</li>
        </ul>
        <p>
          We reserve the right to remove any content that violates these Terms or for any other reason at our sole discretion.
        </p>

        <h2>5. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any illegal purpose.</li>
          <li>Attempt to gain unauthorized access to the Service or its systems.</li>
          <li>Interfere with or disrupt the integrity or performance of the Service.</li>
          <li>Use automated means (bots, scrapers) to access the Service without permission.</li>
        </ul>

        <h2>6. Termination</h2>
        <p>
          We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          In no event shall eddythedaddy, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
        </p>

        <h2>8. Disclaimer</h2>
        <p>
          The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
        </p>

        <h2>9. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
        </p>

        <h2>10. Changes</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at support@eddythedaddy.com.
        </p>
      </div>
    </div>
  );
}
