import React from "react";

interface TermsOfServicePageProps {
  onBack: () => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <button
            onClick={onBack}
            className="mb-6 flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last Updated: January 30, 2026</p>

          <div className="prose dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome to Genesis Real Estate Platform ("Genesis," "we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our AI-powered real estate platform, including our website, mobile applications, and related services (collectively, the "Platform").
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                By accessing or using Genesis, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Eligibility</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You must be at least 18 years old and legally capable of entering into binding contracts to use Genesis. By using the Platform, you represent and warrant that you meet these eligibility requirements.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                If you are using the Platform on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Account Registration and Security</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To access certain features of the Platform, you must create an account. You may register using:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Email and password</li>
                <li>Google OAuth authentication</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.2 Account Security</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access or security breach</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.3 Accurate Information</h3>
              <p className="text-gray-700 dark:text-gray-300">
                You agree to provide accurate, current, and complete information during registration and to update it as necessary to maintain its accuracy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. User Roles and Responsibilities</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Genesis supports multiple user roles, each with specific rights and responsibilities:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.1 Agents</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>List and manage properties on behalf of clients</li>
                <li>Interact with potential buyers, tenants, and sellers</li>
                <li>Must hold valid professional licenses where required by law</li>
                <li>Provide accurate property information and disclosures</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.2 Property Owners/Landlords</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>List properties for sale or rent</li>
                <li>Manage tenant relationships and maintenance requests</li>
                <li>Provide accurate property documentation</li>
                <li>Comply with local housing and rental laws</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.3 Tenants</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Search for rental properties</li>
                <li>Submit maintenance requests</li>
                <li>Communicate with landlords and property managers</li>
                <li>Comply with lease agreements and rental obligations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.4 Surveyors</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Offer professional surveying and valuation services</li>
                <li>Must hold valid professional certifications</li>
                <li>Provide accurate and unbiased assessments</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Platform Services</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.1 Property Listings</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Users may list properties for sale or rent</li>
                <li>All listings must be accurate, complete, and not misleading</li>
                <li>We reserve the right to remove listings that violate these Terms</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.2 AI Chat and Search</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Our AI assistant (powered by Google Gemini) helps users find properties and answer questions</li>
                <li>AI-generated responses are for informational purposes only and do not constitute professional advice</li>
                <li>Users should verify all information independently</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.3 Document Verification</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>We offer AI-powered document verification services</li>
                <li>Verification results are not legal determinations of authenticity</li>
                <li>Users should conduct independent due diligence</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.4 Communication Tools</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>The Platform facilitates communication between users</li>
                <li>We are not responsible for the content of user communications</li>
                <li>Users must communicate professionally and respectfully</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Subscription Plans and Payments</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.1 Subscription Plans</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Genesis offers various subscription plans with different features and pricing. Current plans include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Free Plan: Basic access with limited features</li>
                <li>Basic Plan: Enhanced features for individuals</li>
                <li>Professional Plan: Advanced features for real estate professionals</li>
                <li>Premium features (e.g., Tenant AI Management): Additional paid features</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.2 Payment Terms</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Subscription fees are billed monthly or annually as selected</li>
                <li>All fees are in Kenya Shillings (KSh) unless otherwise stated</li>
                <li>Payment must be received to activate premium features</li>
                <li>Fees are non-refundable except as required by law</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.3 Auto-Renewal</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Subscriptions automatically renew unless canceled before the renewal date. You may cancel at any time through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Prohibited Conduct</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Provide false, inaccurate, or misleading information</li>
                <li>Impersonate any person or entity</li>
                <li>Post fraudulent, deceptive, or illegal property listings</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Interfere with or disrupt the Platform's operation</li>
                <li>Upload viruses, malware, or other harmful code</li>
                <li>Collect or harvest user information without consent</li>
                <li>Use the Platform for commercial purposes outside its intended use</li>
                <li>Circumvent any access restrictions or security measures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Intellectual Property</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8.1 Our Rights</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The Platform, including its design, code, logos, and content (excluding user-generated content), is owned by Genesis and protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8.2 Your Content</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You retain ownership of content you submit to the Platform (listings, messages, documents). By submitting content, you grant Genesis a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute your content for the purpose of operating and promoting the Platform.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8.3 Feedback</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Any feedback, suggestions, or ideas you provide to us become our property, and we may use them without restriction or compensation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Disclaimers and Limitations of Liability</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9.1 Platform "As Is"</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9.2 No Professional Advice</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Information provided through the Platform, including AI-generated responses, does not constitute legal, financial, or professional advice. Users should consult qualified professionals for specific advice.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9.3 Third-Party Content</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We are not responsible for the accuracy, legality, or quality of user-generated content, property listings, or third-party services integrated with the Platform.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9.4 Limitation of Liability</h3>
              <p className="text-gray-700 dark:text-gray-300">
                To the maximum extent permitted by law, Genesis shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising from your use of the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Indemnification</h2>
              <p className="text-gray-700 dark:text-gray-300">
                You agree to indemnify, defend, and hold harmless Genesis, its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mt-4 space-y-2">
                <li>Your use of the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your content or property listings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Termination</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11.1 By You</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You may terminate your account at any time through your account settings or by contacting us at admin@mygenesisfortune.com.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11.2 By Us</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may suspend or terminate your account at any time, with or without notice, if you violate these Terms or for any other reason, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Fraudulent activity or misrepresentation</li>
                <li>Violation of laws or regulations</li>
                <li>Abuse or harassment of other users</li>
                <li>Non-payment of fees</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11.3 Effect of Termination</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Upon termination, your right to access the Platform will cease immediately. We may delete your account and content, subject to our data retention policies and legal obligations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Dispute Resolution</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12.1 Governing Law</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                These Terms are governed by the laws of the Republic of Kenya, without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12.2 Dispute Resolution Process</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                In the event of any dispute, you agree to first attempt to resolve it informally by contacting us at admin@mygenesisfortune.com or calling +254759375210. If the dispute cannot be resolved within 30 days, either party may pursue formal legal action.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12.3 Jurisdiction</h3>
              <p className="text-gray-700 dark:text-gray-300">
                You agree to submit to the exclusive jurisdiction of the courts located in Nairobi, Kenya for the resolution of any disputes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">13. Changes to These Terms</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on the Platform and updating the "Last Updated" date. Your continued use of the Platform after changes are posted constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">14. General Provisions</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14.1 Entire Agreement</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Genesis regarding the Platform.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14.2 Severability</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14.3 Waiver</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14.4 Assignment</h3>
              <p className="text-gray-700 dark:text-gray-300">
                You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms at any time without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">15. Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have questions or concerns about these Terms, please contact us:
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> admin@mygenesisfortune.com</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Phone:</strong> +254759375210</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Platform:</strong> Genesis Real Estate Platform</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>GitHub:</strong> https://github.com/mikecurious/Genesis</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">16. Acknowledgment</h2>
              <p className="text-gray-700 dark:text-gray-300">
                By using Genesis Real Estate Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
