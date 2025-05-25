import { LockIcon, ShieldIcon } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="bg-gradient-to-r from-[#e27396] to-[#d45c82] text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <ShieldIcon className="w-8 h-8" />
            <LockIcon className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">Privacy Policy</h1>
          <p className="text-center text-white/80 max-w-2xl mx-auto">
            We value your privacy and are committed to protecting your personal information.
            This policy outlines how we collect, use, and safeguard your data.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="prose max-w-none">
          <div className="text-gray-600 mb-8 pb-4 border-b border-gray-200">
            <p className="font-medium">Effective Date: April 2025</p>
          </div>
          
          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Information Collection</h2>
              <p>
                We collect personal and non-personal information, including names, emails, and browsing behavior.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Use of Information</h2>
              <p>
                Your information is used to provide services, process transactions, and improve user experience.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Information Sharing</h2>
              <p>
                We do not sell, rent, or trade your personal information.
              </p>
              <p className="mt-2">
                Third-party service providers may access data for payment processing and analytics.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Cookies and Tracking</h2>
              <p>
                Cookies and tracking technologies are used to enhance website functionality.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Security</h2>
              <p>
                We implement security measures, but online data transmission is not 100% secure.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Rights</h2>
              <p>
                Users have rights to access, update, and delete their personal data.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Third-Party Links</h2>
              <p>
                Our website may contain third-party links, and we are not responsible for their privacy policies.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Policy Updates</h2>
              <p>
                We may update this Privacy Policy, and changes will be posted on this page.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Information</h2>
              <p>
                For questions about our Privacy Policy, please contact us at:
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