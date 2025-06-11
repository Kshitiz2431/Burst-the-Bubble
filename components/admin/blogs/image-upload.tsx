// "use client";

// import { useState, useEffect } from "react";
// import { toast } from "sonner";
// import { Upload } from "lucide-react";

// interface ImageUploadProps {
//   type: "featured" | "content";
//   value: File | string | null;
//   displayUrl?: string | null;
//   onChange: (file: File | null) => void;
// }

// export function ImageUpload({ type, value, displayUrl, onChange }: ImageUploadProps) {
//   const [preview, setPreview] = useState<string | null>(null);

//   useEffect(() => {
//     // If value is a File, create an object URL for preview
//     if (value instanceof File) {
//       const url = URL.createObjectURL(value);
//       setPreview(url);
//       return () => URL.revokeObjectURL(url);
//     } 
//     // If we have a display URL, use that
//     else if (displayUrl) {
//       setPreview(displayUrl);
//     }
//     // If value is null, clear the preview
//     else {
//       setPreview(null);
//     }
//   }, [value, displayUrl]);

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith("image/")) {
//       toast.error("Please upload an image file");
//       return;
//     }

//     // Validate file size (e.g., 5MB limit)
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Image must be smaller than 5MB");
//       return;
//     }

//     onChange(file);
//   };

//   return (
//     <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
//       {preview ? (
//         <div className="relative">
//           <img
//             src={preview}
//             alt="Preview"
//             className="w-full h-48 object-cover rounded-lg"
//           />
//           <button
//             type="button"
//             onClick={() => onChange(null)}
//             className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
//           >
//             ×
//           </button>
//         </div>
//       ) : (
//         <label className="flex flex-col items-center justify-center cursor-pointer py-8">
//           <Upload className="w-8 h-8 text-gray-400" />
//           <span className="mt-2 text-sm text-gray-500">Upload image</span>
//           <input
//             type="file"
//             className="hidden"
//             accept="image/*"
//             onChange={handleImageUpload}
//           />
//         </label>
//       )}
//     </div>
//   );
// }




// components/admin/blogs/image-upload.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { ImageEditor } from "./new-image-editor";

interface ImageUploadProps {
  type: "featured" | "content";
  value: File | string | null;
  displayUrl?: string | null;
  onChange: (file: File | null) => void;
}

export function ImageUpload({ type, value, displayUrl, onChange }: ImageUploadProps) {
  console.log(type);
  const [preview, setPreview] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // If value is a File, create an object URL for preview
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } 
    // If we have a display URL, use that
    else if (displayUrl) {
      setPreview(displayUrl);
    }
    // If value is null, clear the preview
    else {
      setPreview(null);
    }
  }, [value, displayUrl]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    // Show the image editor
    setSelectedFile(file);
    setShowEditor(true);
  };

  const handleEditorSave = (editedImage: File) => {
    onChange(editedImage);
    setShowEditor(false);
    setSelectedFile(null);
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
    setSelectedFile(null);
  };

  return (
    <>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer py-8">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">Upload image</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageSelect}
            />
          </label>
        )}
      </div>

      {showEditor && selectedFile && (
        <ImageEditor
          image={selectedFile}
          aspect={16/9}  // For featured images
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}
    </>
  );
}