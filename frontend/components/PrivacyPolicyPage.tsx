import React from "react";

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
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

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last Updated: January 30, 2026</p>

          <div className="prose dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome to Genesis Real Estate Platform ("Genesis," "we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered real estate platform.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                By accessing or using Genesis, you agree to the terms of this Privacy Policy. If you do not agree with our practices, please do not use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, password, and role (Agent, Owner, Tenant, Surveyor, Admin)</li>
                <li><strong>Profile Information:</strong> Profile pictures, business details, professional credentials</li>
                <li><strong>Property Information:</strong> Property listings, descriptions, images, locations, pricing, and related documents</li>
                <li><strong>Documents:</strong> Title deeds, sale agreements, KRA PIN documents, valuation reports, and other property-related documents</li>
                <li><strong>Communication Data:</strong> Messages, chat history, maintenance requests, and support inquiries</li>
                <li><strong>Payment Information:</strong> Billing details, subscription information, and transaction history</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform, and interaction patterns</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Location Data:</strong> General location information for property searches and recommendations</li>
                <li><strong>Cookies and Similar Technologies:</strong> Session data, preferences, and authentication tokens</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.3 Third-Party Information</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Google OAuth:</strong> When you sign in with Google, we receive your name, email address, and Google ID</li>
                <li><strong>Social Media:</strong> Information from social media platforms if you choose to connect them</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Platform Services:</strong> Provide and maintain our real estate platform, including property listings, AI chat, and property search</li>
                <li><strong>AI Features:</strong> Power our AI assistant using Google Gemini to answer property-related questions and provide recommendations</li>
                <li><strong>User Authentication:</strong> Verify your identity and manage your account</li>
                <li><strong>Communication:</strong> Send notifications, maintenance updates, rent reminders, and service-related communications</li>
                <li><strong>Property Matching:</strong> Match tenants with properties and connect buyers/sellers with agents</li>
                <li><strong>Document Verification:</strong> Verify property documents and ensure authenticity</li>
                <li><strong>Analytics:</strong> Analyze usage patterns to improve our platform and user experience</li>
                <li><strong>Customer Support:</strong> Respond to your inquiries and provide technical assistance</li>
                <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our Terms of Service</li>
                <li><strong>Security:</strong> Detect and prevent fraud, unauthorized access, and other security threats</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. How We Share Your Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>

              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>With Other Users:</strong> Property listings, agent information, and contact details are visible to other platform users as necessary for the service</li>
                <li><strong>Service Providers:</strong> Third-party services including Google (for OAuth and AI), MongoDB (database), email services, and hosting providers</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition of all or part of our business</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government authority</li>
                <li><strong>Protection of Rights:</strong> To protect our rights, property, safety, or that of our users or the public</li>
                <li><strong>With Your Consent:</strong> When you explicitly consent to sharing your information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Third-Party Services</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our platform integrates with the following third-party services:
              </p>

              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Google Services:</strong> Google OAuth for authentication and Google Gemini AI for chat functionality</li>
                <li><strong>MongoDB Atlas:</strong> Cloud database for storing application data</li>
                <li><strong>Email Services:</strong> Gmail for transactional emails and notifications</li>
                <li><strong>Hosting Services:</strong> Cloud hosting providers (Render, Vercel, etc.)</li>
              </ul>

              <p className="text-gray-700 dark:text-gray-300 mt-4">
                These third-party services have their own privacy policies, and we encourage you to review them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Data Security</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>

              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Encryption of data in transit using HTTPS/TLS</li>
                <li>Secure password hashing and storage</li>
                <li>JWT-based authentication with secure token management</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and role-based permissions</li>
                <li>Secure document storage and verification systems</li>
              </ul>

              <p className="text-gray-700 dark:text-gray-300 mt-4">
                However, no method of transmission or storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Data Retention</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will remove your personal information within 90 days, except where we are required to retain it for legal or regulatory purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Your Rights and Choices</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You have the following rights regarding your personal information:
              </p>

              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
              </ul>

              <p className="text-gray-700 dark:text-gray-300 mt-4">
                To exercise these rights, please contact us at admin@mygenesisfortune.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Our platform is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will delete it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Your information may be transferred to and processed in countries other than Kenya, including the United States and European Union, where our service providers are located. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Cookies and Tracking</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use cookies and similar technologies to:
              </p>

              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Maintain your session and keep you logged in</li>
                <li>Remember your preferences (theme, language, etc.)</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide personalized content and recommendations</li>
              </ul>

              <p className="text-gray-700 dark:text-gray-300 mt-4">
                You can control cookies through your browser settings, but disabling cookies may affect platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on our platform and updating the "Last Updated" date. Your continued use of Genesis after changes are posted constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">13. Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> admin@mygenesisfortune.com</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Phone:</strong> +254759375210</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Platform:</strong> Genesis Real Estate Platform</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>GitHub:</strong> https://github.com/mikecurious/Genesis</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">14. Data Protection Officer</h2>
              <p className="text-gray-700 dark:text-gray-300">
                For data protection inquiries specific to Kenya's Data Protection Act, 2019, you may contact our data protection officer at admin@mygenesisfortune.com or call +254759375210.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">15. Consent</h2>
              <p className="text-gray-700 dark:text-gray-300">
                By using Genesis Real Estate Platform, you consent to the collection, use, and sharing of your information as described in this Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
