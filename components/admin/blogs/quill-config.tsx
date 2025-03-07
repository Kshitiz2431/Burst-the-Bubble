// components/admin/blogs/quill-config.tsx

import ReactDOM from 'react-dom/client';
import { ImageEditor } from "./new-image-editor";
import { toast } from "sonner";

export const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["blockquote", "code-block"],
      ["link", "image"],
      [{ script: "sub" }, { script: "super" }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["clean"],
    ],
    handlers: {
      image: function() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          const quill = (this as any).quill;
          const range = quill.getSelection(true);

          // Create and show modal with ImageEditor
          const editorContainer = document.createElement('div');
          editorContainer.style.position = 'fixed';
          editorContainer.style.top = '0';
          editorContainer.style.left = '0';
          editorContainer.style.width = '100%';
          editorContainer.style.height = '100%';
          editorContainer.style.zIndex = '9999';
          document.body.appendChild(editorContainer);

          const root = ReactDOM.createRoot(editorContainer);
          
          root.render(
            <ImageEditor
              image={file}
              aspect={16/9}
              onSave={async (croppedImage) => {
                try {
                  // Get upload URL
                  const response = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      filename: croppedImage.name,
                      contentType: croppedImage.type,
                      type: "content",
                    }),
                  });

                  if (!response.ok) throw new Error("Failed to get upload URL");
                  const { signedUrl, key } = await response.json();

                  // Upload to S3
                  await fetch(signedUrl, {
                    method: "PUT",
                    body: croppedImage,
                    headers: { "Content-Type": croppedImage.type },
                  });

                  // Get URL
                  const imageUrlResponse = await fetch(`/api/image/${encodeURIComponent(key)}`);
                  const { url: displayUrl } = await imageUrlResponse.json();

                  // Basic Quill insertion
                  quill.insertEmbed(range.index, 'image', displayUrl);
                  quill.setSelection(range.index + 1);

                  // Add data-key using basic DOM
                  const imageElements = quill.root.getElementsByTagName('img') as HTMLCollectionOf<HTMLImageElement>;
                  for (let i = 0; i < imageElements.length; i++) {
                    if (imageElements[i].src === displayUrl) {
                      imageElements[i].setAttribute('data-key', key);
                      break;
                    }
                  }

                } catch (error) {
                  console.error('Error:', error);
                  toast.error("Failed to upload image");
                } finally {
                  root.unmount();
                  document.body.removeChild(editorContainer);
                }
              }}
              onCancel={() => {
                root.unmount();
                document.body.removeChild(editorContainer);
              }}
            />
          );
        };
      }
    }
  }
};

export const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "align",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "blockquote",
  "code-block",
];

// Helper function to get image URL
export const getImageUrl = async (key: string): Promise<string> => {
  try {
    const response = await fetch(`/api/image/${encodeURIComponent(key)}`);
    if (!response.ok) throw new Error('Failed to get image URL');
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
};

export const processContentBeforeSave = (content: string): string => {
  const div = document.createElement('div');
  div.innerHTML = content;

  const images = div.getElementsByTagName('img');
  Array.from(images).forEach((img: HTMLImageElement) => {
    const key = img.getAttribute('data-key');
    if (key) {
      img.removeAttribute('src');  // Remove the signed URL
      img.setAttribute('data-key', key);  // Keep the key
    }
  });

  return div.innerHTML;
};

export const processContentAfterLoad = async (content: string): Promise<string> => {
  const div = document.createElement('div');
  div.innerHTML = content;

  const images = Array.from(div.getElementsByTagName('img'));
  await Promise.all(images.map(async (img: HTMLImageElement) => {
    const key = img.getAttribute('data-key');
    if (key) {
      try {
        const signedUrl = await getImageUrl(key);
        img.setAttribute('src', signedUrl);
      } catch (error) {
        console.error('Error loading image:', error);
        img.setAttribute('src', '/placeholder-image.jpg');
      }
    }
  }));

  return div.innerHTML;
};