import { ShieldCheckIcon, FileTextIcon } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <>
      <div className="bg-gradient-to-r from-[#e27396] to-[#d45c82] text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <ShieldCheckIcon className="w-8 h-8" />
            <FileTextIcon className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">Terms and Conditions</h1>
          <p className="text-center text-white/80 max-w-2xl mx-auto">
            Please read these Terms and Conditions carefully before using our website and services.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="prose max-w-none">
          <div className="text-gray-600 mb-8 pb-4 border-b border-gray-200">
            <p className="font-medium">Effective Date: July 22, 2025</p>
          </div>

          <div className="space-y-8 text-gray-700">
            <section>
              <p>
                Welcome to <strong>Burst the Bubble</strong> (<a href="https://burstthebubble.in" className="text-[#e27396] hover:underline">https://burstthebubble.in</a>).
                By accessing or using our website, resources, or services, you agree to comply with and be bound by the following terms and conditions.
                If you do not agree with any part of these terms, please do not use our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Overview of Services</h2>
              <p>
                Burst the Bubble provides educational content, newsletters, e-books, and other relationship-related resources designed to support healthy romantic, platonic, and familial connections.
                We do not offer medical or licensed psychological counseling.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">2. User Eligibility</h2>
              <p>
                You must be at least 14 years old to access our website. By using this site, you represent that you meet this requirement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Content Usage</h2>
              <p>All content on this website—including articles, one-liners, love letters, downloadable materials, visuals, and branding—is the intellectual property of Burst the Bubble and protected by copyright laws.</p>
              <ul className="list-disc list-inside mt-2">
                <li>✅ You may share links to our content with proper credit</li>
                <li>✅ You may use downloadable free resources for personal, non-commercial use</li>
                <li>❌ You may not copy, reproduce, or distribute content for commercial use without written permission</li>
                <li>❌ You may not modify, translate, or create derivative works without our consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Premium Content and Purchases</h2>
              <p>
                Certain resources and features (such as exclusive newsletters, e-books, and custom love notes) are available through paid subscriptions or one-time purchases.
              </p>
              <p className="mt-2">
                By purchasing, you agree to:
              </p>
              <ul className="list-disc list-inside mt-2">
                <li>Provide accurate billing and contact information</li>
                <li>Use secure payment methods through our designated payment partners</li>
                <li>Not share or resell premium content</li>
              </ul>
              <p className="mt-2">All sales are final unless otherwise stated in a refund policy specific to a product.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Newsletters and Emails</h2>
              <p>
                When you subscribe to our newsletter, you agree to receive periodic emails from us, including updates, exclusive tips, and promotions.
                You may unsubscribe at any time using the “unsubscribe” link in our emails or by contacting us directly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Refund Policy</h2>
              <p>
                All sales made on Burst the Bubble—including subscriptions, e-books, custom content, and downloadable products—are final and non-refundable.
                Due to the nature of digital goods and immediate access upon purchase, we do not offer refunds, returns, or exchanges.
              </p>
              <p className="mt-2">
                If you experience a technical issue with accessing your product, please contact us and we will assist you promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Third-Party Links</h2>
              <p>
                Our website may include links to third-party websites or services. Burst the Bubble is not responsible for the privacy practices, content, or terms of these third-party sites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Disclaimer</h2>
              <p>
                Our content is for informational and educational purposes only. It is not a substitute for professional counseling, therapy, or legal advice.
                If you're facing serious emotional or mental health challenges, please seek help from a licensed professional.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Limitation of Liability</h2>
              <p>
                Burst the Bubble is not liable for any direct, indirect, incidental, or consequential damages arising out of your use of the site or its resources.
                Use of the site is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Account Security</h2>
              <p>
                If you create an account for premium access or purchases, you are responsible for maintaining the confidentiality of your login credentials and all activity under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">11. Changes to These Terms</h2>
              <p>
                We may revise these Terms and Conditions from time to time. The latest version will always be available on this page,
                and continued use of the site constitutes your acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">12. Governing Law</h2>
              <p>
                These terms are governed by and interpreted in accordance with the laws of India.
                Any disputes shall be resolved under the jurisdiction of the courts located in [Insert your city/state].
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">13. Contact Us</h2>
              <p>
                For any questions or concerns regarding these Terms, please contact:
              </p>
              <p className="mt-2">
                <a href="mailto:infoburstthebubble@gmail.com" className="text-[#e27396] hover:underline">infoburstthebubble@gmail.com</a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              © 2025 Burst the Bubble. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
