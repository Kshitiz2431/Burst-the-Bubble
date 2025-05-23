// components/templates/image-preview-modal.tsx
import * as React from "react";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Custom DialogContent without the default close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = "CustomDialogContent";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  title,
}: ImagePreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CustomDialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 rounded-xl overflow-hidden border-0 shadow-xl">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white -z-10" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#e27396]/5 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-pink-100/10 blur-3xl -z-10" />
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Image Viewer */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50/50 backdrop-blur-sm flex items-center justify-center relative">
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="h-8 w-8 p-0 rounded-full bg-white/80 backdrop-blur-sm border-gray-200 hover:border-[#e27396]/20"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2}
              className="h-8 w-8 p-0 rounded-full bg-white/80 backdrop-blur-sm border-gray-200 hover:border-[#e27396]/20"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
              <div className="w-16 h-16 rounded-full bg-[#e27396]/10 flex items-center justify-center animate-pulse">
                <div className="w-10 h-10 rounded-full bg-[#e27396]/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-[#e27396]/30"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Image container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: loading ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-xl overflow-hidden shadow-lg max-w-full max-h-full bg-white/50 backdrop-blur-sm"
          >
            <div className="overflow-hidden p-1">
              <img 
                src={imageUrl} 
                alt={title}
                className="max-w-full max-h-full object-contain transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoomLevel})` }}
                onLoad={handleImageLoad}
              />
            </div>
            
            {/* Zoom indicator */}
            {zoomLevel !== 1 && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                {Math.round(zoomLevel * 100)}%
              </div>
            )}
          </motion.div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}