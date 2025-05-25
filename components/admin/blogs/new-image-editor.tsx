// components/admin/blogs/new-image-editor.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import { Button } from '@/components/ui/button';
import 'react-image-crop/dist/ReactCrop.css';

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number | null,
): Crop {
  if (aspect === null) {
    // For free-form crop (no aspect ratio)
    return {
      unit: '%',
      x: 10,
      y: 10,
      width: 80,
      height: 80,
    } as Crop;
  }
  
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

interface ImageEditorProps {
  image: File | string;
  onSave: (croppedImage: File | string) => void;
  onCancel: () => void;
  aspect?: number | null;
}

export function ImageEditor({ image, onSave, onCancel, aspect = 16 / 9 }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(aspect);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSrc, setImgSrc] = useState<string>(typeof image === 'string' ? image : '');
  const [isLoading, setIsLoading] = useState(false);
  const [initialCropSet, setInitialCropSet] = useState(false);

  // Define aspect ratio options
  const aspectRatioOptions = [
    { label: 'Free', value: null as null },
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
    { label: '1:1', value: 1 },
    { label: '3:4', value: 3 / 4 },
    { label: '9:16', value: 9 / 16 },
  ];

  useEffect(() => {
    // If image is a File object, create a URL for it
    if (image instanceof File) {
      const objectUrl = URL.createObjectURL(image);
      setImgSrc(objectUrl);
      
      // Clean up the URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (!initialCropSet && imgRef.current) {
      const { width, height } = imgRef.current;
      const imageAspect = width / height;
      
      // Auto-detect best aspect ratio based on image dimensions
      let bestAspect = aspect;
      
      // If image is very wide or very tall, suggest free form
      if (imageAspect > 2.5 || imageAspect < 0.4) {
        bestAspect = null;
        setSelectedAspectRatio(null);
      }
      
      setCrop(centerAspectCrop(width, height, bestAspect));
      setInitialCropSet(true);
    }
  }

  async function cropImage() {
    setIsLoading(true);
    const image = imgRef.current;
    const crop = completedCrop;

    if (!image || !crop) {
      console.error('image or crop missing');
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('No 2d context');
      return;
    }

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    );

    try {
      const base64 = canvas.toDataURL('image/jpeg');
      onSave(base64);
    } catch (e) {
      console.error('Error converting canvas to base64', e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Crop Image</h2>
          <p className="text-sm text-gray-500">Adjust the crop area to your liking</p>
        </div>

        <div className="aspect-ratio-options flex flex-wrap gap-2 mb-4">
          {aspectRatioOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                setSelectedAspectRatio(option.value);
                if (imgRef.current) {
                  const { width, height } = imgRef.current;
                  setCrop(centerAspectCrop(width, height, option.value));
                }
              }}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedAspectRatio === option.value
                  ? 'bg-[#B33771] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="image-container max-h-[70vh] overflow-auto bg-gray-100 p-4 rounded-md mb-4">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              {...(selectedAspectRatio !== null ? { aspect: selectedAspectRatio } : {})}
              className="max-w-full"
              ruleOfThirds
              minWidth={20}
              minHeight={20}
              keepSelection={true}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                className="max-w-full max-h-[65vh]"
                crossOrigin="anonymous"
              />
            </ReactCrop>
          )}
        </div>

        {/* Add custom styles to enhance crop handles */}
        <style jsx global>{`
          .ReactCrop__drag-handle {
            width: 24px;
            height: 24px;
            background-color: rgba(255, 255, 255, 0.95);
            border: 3px solid #B33771;
            border-radius: 50%;
            opacity: 1;
            z-index: 100;
            /* Offset to make handles easier to grab */
            margin-top: -12px;
            margin-left: -12px;
            /* Improved touch target */
            position: absolute;
            touch-action: none;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
          }
          
          .ReactCrop__drag-handle:hover {
            cursor: grab;
            background-color: #B33771;
            border-color: white;
            transform: scale(1.1);
            box-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
          }
          
          /* Enhanced cursor styles for different handles */
          .ReactCrop__drag-handle.ord-n {
            cursor: n-resize;
          }
          .ReactCrop__drag-handle.ord-e {
            cursor: e-resize;
          }
          .ReactCrop__drag-handle.ord-s {
            cursor: s-resize;
          }
          .ReactCrop__drag-handle.ord-w {
            cursor: w-resize;
          }
          .ReactCrop__drag-handle.ord-ne {
            cursor: ne-resize;
          }
          .ReactCrop__drag-handle.ord-nw {
            cursor: nw-resize;
          }
          .ReactCrop__drag-handle.ord-se {
            cursor: se-resize;
          }
          .ReactCrop__drag-handle.ord-sw {
            cursor: sw-resize;
          }
          
          /* Ensure all handles are visible and properly positioned */
          .ReactCrop__drag-handle.ord-n,
          .ReactCrop__drag-handle.ord-e,
          .ReactCrop__drag-handle.ord-s,
          .ReactCrop__drag-handle.ord-w,
          .ReactCrop__drag-handle.ord-ne,
          .ReactCrop__drag-handle.ord-nw,
          .ReactCrop__drag-handle.ord-se,
          .ReactCrop__drag-handle.ord-sw {
            display: block !important;
          }
          
          /* Allow the crop box to extend outside and readjust */
          .ReactCrop {
            position: relative;
            cursor: move;
            overflow: visible;
            touch-action: none;
            user-select: none;
            max-width: 100%;
          }
          
          /* Make crop area draggable */
          .ReactCrop__crop-selection {
            cursor: move;
            border: 3px solid rgba(255, 255, 255, 1);
            box-shadow: 0 0 0 9999em rgba(0, 0, 0, 0.7);
            touch-action: none;
          }
          
          /* Improve visibility of rule of thirds lines */
          .ReactCrop__rule-of-thirds-vt::before,
          .ReactCrop__rule-of-thirds-vt::after,
          .ReactCrop__rule-of-thirds-hz::before,
          .ReactCrop__rule-of-thirds-hz::after {
            background-color: rgba(255, 255, 255, 0.7);
            width: 2px;
          }
          
          /* Improve container for better touch handling */
          .image-container {
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
          }
        `}</style>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={cropImage}
            disabled={isLoading || !completedCrop}
            className="bg-[#B33771] hover:bg-[#92295c] text-white"
          >
            {isLoading ? "Processing..." : "Save Cropped Image"}
          </Button>
        </div>
      </div>
    </div>
  );
}