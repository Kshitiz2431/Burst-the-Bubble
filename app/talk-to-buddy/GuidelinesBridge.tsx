import { Button } from "@/components/ui/button";

interface GuidelinesBridgeProps {
  buddyName: string;
  onAccept: () => void;
  onGoBack: () => void;
}

export default function GuidelinesBridge({ buddyName, onAccept, onGoBack }: GuidelinesBridgeProps) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#e27396] mb-2">Before You Schedule</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Please review these important guidelines for your upcoming session with {buddyName}.
        </p>
      </div>
      
      <div className="space-y-6 mb-8">
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center mb-2">
            <span className="text-[#e27396] mr-2">•</span> Respect & Kindness Are Key
          </h3>
          <p className="text-gray-600 text-sm">
            Every conversation should be built on mutual respect. Our Buddies are here to help, and a positive attitude ensures a meaningful session. Any form of rudeness, aggression, or inappropriate language will not be tolerated.
          </p>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center mb-2">
            <span className="text-[#e27396] mr-2">•</span> Confidentiality & Trust
          </h3>
          <p className="text-gray-600 text-sm">
            Your privacy is our priority. All discussions remain confidential, except in cases where there is a risk of harm to yourself or others. We encourage honesty and openness, knowing your conversations are safe with us.
          </p>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center mb-2">
            <span className="text-[#e27396] mr-2">•</span> This Is NOT Therapy
          </h3>
          <p className="text-gray-600 text-sm">
            While Buddies offer support and guidance, they are not certified therapists or counselors. If you need medical or psychological assistance, we encourage you to seek help from a licensed professional.
          </p>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center mb-2">
            <span className="text-[#e27396] mr-2">•</span> No Crisis or Emergency Support
          </h3>
          <p className="text-gray-600 text-sm">
            If you are in immediate distress or facing an emergency, please reach out to professional crisis helplines. Our Buddies provide emotional support, but they are not equipped to handle crisis situations.
          </p>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center mb-2">
            <span className="text-[#e27396] mr-2">•</span> A Safe Space for Everyone
          </h3>
          <p className="text-gray-600 text-sm">
            We welcome people from all backgrounds. Discrimination, harassment, or any form of hate speech will result in immediate termination of the session without a refund.
          </p>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center mb-2">
            <span className="text-[#e27396] mr-2">•</span> Be Present & Engaged
          </h3>
          <p className="text-gray-600 text-sm">
            To make the most of your session, find a quiet, distraction-free space. Give yourself the opportunity to fully engage in the conversation and take away something valuable.
          </p>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center mb-2">
            <span className="text-[#e27396] mr-2">•</span> Booking & Cancellations
          </h3>
          <p className="text-gray-600 text-sm">
            Sessions must be booked in advance. If you need to cancel or reschedule, please do so at least 24 hours in advance. Last-minute cancellations are not eligible for a refund.
          </p>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center mb-2">
            <span className="text-[#e27396] mr-2">•</span> Feedback Matters
          </h3>
          <p className="text-gray-600 text-sm">
            We value your experience! If you have any feedback about your session, let us know. It helps us improve and ensure that you get the best support possible.
          </p>
        </div>
      </div>
      
      <div className="flex flex-col space-y-4">
        <Button 
          onClick={onAccept}
          className="w-full bg-[#e27396] hover:bg-[#d45c82] text-white py-3 text-md font-medium rounded-xl"
        >
          I Understand & Agree
        </Button>
        
        <Button 
          onClick={onGoBack}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 text-md font-medium rounded-xl"
          variant="outline"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
} 