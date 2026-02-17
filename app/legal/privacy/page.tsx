export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose dark:prose-invert max-w-none">
        <h2>1. Introduction</h2>
        <p>
          Welcome to eddythedaddy ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy outlines our practices regarding the collection, use, and disclosure of your information.
        </p>

        <h2>2. Data Collection</h2>
        <p>
          We collect information that you provide directly to us, such as when you create an account, update your profile, upload content, or communicate with us. This may include:
        </p>
        <ul>
          <li><strong>Account Information:</strong> Username, email address, password.</li>
          <li><strong>Profile Information:</strong> Profile picture, bio, and other public details.</li>
          <li><strong>Content:</strong> Videos, comments, and other materials you upload.</li>
          <li><strong>Usage Data:</strong> Information about how you interact with our services, including IP address, browser type, and device information.</li>
        </ul>

        <h2>3. Use of Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services.</li>
          <li>Process transactions and manage your account.</li>
          <li>Moderate content and ensure compliance with our Terms of Service.</li>
          <li>Send you technical notices, updates, security alerts, and support messages.</li>
          <li>Personalize your experience and deliver relevant content.</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>
          We do not sell your personal information. We may share your information with:
        </p>
        <ul>
          <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform (e.g., hosting, payment processing, content delivery).</li>
          <li><strong>Legal Requirements:</strong> If required by law, subpoena, or other legal process.</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, sale, or asset transfer.</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          Depending on your location, you may have the right to access, correct, delete, or restrict the processing of your personal data. You can manage most of your information directly through your account settings.
        </p>

        <h2>7. Children's Privacy</h2>
        <p>
          Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected such information, we will take steps to delete it.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at privacy@eddythedaddy.com.
        </p>
      </div>
    </div>
  );
}
