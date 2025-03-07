// components/admin/blogs/ImageEditor.tsx
import { useState } from 'react';

type ImageWidth = 'small' | 'medium' | 'large';

interface ImageEditorProps {
  image: File;
  onSave: (editedImage: File, width: ImageWidth) => void;
  onCancel: () => void;
}

export function ImageEditor({ image, onSave, onCancel }: ImageEditorProps) {
  const [selectedWidth, setSelectedWidth] = useState<ImageWidth>('medium');
  const [previewUrl] = useState<string>(() => URL.createObjectURL(image));

  const widthOptions = {
    small: '50%',
    medium: '75%',
    large: '100%'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Adjust Image Width</h3>
          <p className="text-sm text-gray-500">Choose how wide the image should appear</p>
        </div>

        {/* Image Preview Container */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div style={{ width: widthOptions[selectedWidth] }} className="mx-auto transition-all duration-200">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Width Options */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setSelectedWidth('small')}
            className={`p-3 rounded-lg border ${
              selectedWidth === 'small'
                ? 'bg-[#B33771] text-white border-[#B33771]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            } transition-colors`}
          >
            Small
          </button>
          <button
            type="button"
            onClick={() => setSelectedWidth('medium')}
            className={`p-3 rounded-lg border ${
              selectedWidth === 'medium'
                ? 'bg-[#B33771] text-white border-[#B33771]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            } transition-colors`}
          >
            Medium
          </button>
          <button
            type="button"
            onClick={() => setSelectedWidth('large')}
            className={`p-3 rounded-lg border ${
              selectedWidth === 'large'
                ? 'bg-[#B33771] text-white border-[#B33771]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            } transition-colors`}
          >
            Large
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(image, selectedWidth)}
            className="px-4 py-2 bg-[#B33771] text-white rounded-lg hover:bg-[#92295c] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}