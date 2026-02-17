export default function ContentRemovalPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Content Removal Policy</h1>
      <p className="mb-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose dark:prose-invert max-w-none">
        <h2>1. Policy Overview</h2>
        <p>
          eddythedaddy is committed to maintaining a safe and respectful community. While we value freedom of expression, we do not tolerate content that violates our community guidelines, intellectual property rights, or applicable laws. This policy outlines the grounds upon which content may be removed from our platform.
        </p>

        <h2>2. Non-Consensual Content</h2>
        <p>
          We have a zero-tolerance policy for non-consensual sexual content (NCSC), also known as "revenge porn." If you appear in content on eddythedaddy that was uploaded without your consent, or if you consented to the creation but not the distribution of the content, you may request its removal.
        </p>
        <p>
          We will prioritize these requests and aim to process them within 24 hours. To file a report, please use the "Report" button on the video page or contact our safety team directly at <a href="mailto:safety@eddythedaddy.com">safety@eddythedaddy.com</a>.
        </p>

        <h2>3. Prohibited Content</h2>
        <p>
          We will remove any content that falls into the following categories:
        </p>
        <ul>
          <li><strong>Child Sexual Abuse Material (CSAM):</strong> We will immediately report any instances of CSAM to the National Center for Missing & Exploited Children (NCMEC) and relevant law enforcement agencies.</li>
          <li><strong>Illegal Acts:</strong> Content depicting real-world violence, sexual assault, bestiality, or other illegal acts.</li>
          <li><strong>Harassment & Hate Speech:</strong> Content that promotes violence, discrimination, or hatred against individuals or groups based on race, ethnicity, religion, gender, or sexual orientation.</li>
          <li><strong>Impersonation:</strong> Profiles or content intended to deceive others or impersonate another individual or brand.</li>
        </ul>

        <h2>4. Counter-Notification</h2>
        <p>
          If your content was removed and you believe this was in error, you may appeal the decision by contacting <a href="mailto:appeals@eddythedaddy.com">appeals@eddythedaddy.com</a>. Please include your username, the video title/URL (if available), and a detailed explanation of why you believe the content complies with our policies.
        </p>

        <h2>5. Account Termination</h2>
        <p>
          Users who repeatedly violate this policy or upload prohibited content will have their accounts permanently terminated and may be banned from creating new accounts.
        </p>
      </div>
    </div>
  );
}
