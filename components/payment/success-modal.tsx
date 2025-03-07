import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download } from "lucide-react";
import { useState } from "react";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: 'library' | 'template';
  itemTitle: string;
}

export function PaymentSuccessModal({
  isOpen,
  onClose,
  itemId,
  itemType,
  itemTitle,
}: PaymentSuccessModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadError('');
      
      const endpoint = itemType === 'library' 
        ? `/api/library/${itemId}/download`
        : `/api/templates/${itemId}/download`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to generate download URL');
      
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError('Failed to download. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md !p-0 gap-0 bg-white overflow-hidden !rounded-3xl border-none">
        {/* Success Icon Container */}
        <div className="bg-[#92295c]/5 w-full pt-10 pb-8 px-6">
          <div className="bg-white rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-[#92295c]" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <h3 className="text-2xl font-semibold text-gray-900 text-center mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600 text-center mb-8">
            Thank you for purchasing <span className="font-medium text-gray-900">{itemTitle}</span>
          </p>

          {downloadError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">
              {downloadError}
            </div>
          )}

          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full bg-[#92295c] hover:bg-[#82194c] text-white h-12 rounded-xl
                     flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {isDownloading ? 'Processing...' : 'Download Now'}
          </Button>
          
          {/* Reminder Text */}
          <p className="text-gray-500 text-sm text-center mt-6">
            {itemType === 'library' ? 
              'Download link will expire in 24 hours' :
              'Click download to get your template'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}