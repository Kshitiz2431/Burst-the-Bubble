// components/admin/blogs/quill-config.tsx

import ReactDOM from 'react-dom/client';
import { ImageEditor } from "./new-image-editor";
import { toast  } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import Quill from 'quill';
// import { da } from 'date-fns/locale';


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

          // const quill = (this as any).quill;
          const quill = (this as unknown as { quill: Quill }).quill;

          const range = quill.getSelection(true);

          try {
            
            // Create and show modal with ImageEditor
            const editorContainer = document.createElement('div');
            editorContainer.style.position = 'fixed';
            editorContainer.style.top = '0';
            editorContainer.style.left = '0';
            editorContainer.style.width = '100%';
            editorContainer.style.zIndex = '9999';
            editorContainer.style.height = '100%';
            document.body.appendChild(editorContainer);
            
            const root = ReactDOM.createRoot(editorContainer);
            
            
            root.render(
              <ImageEditor
                image={file}
                aspect={16/9}
                onSave={async (croppedImage) => {
                  try {
                    // Ensure croppedImage is a File object
                    if (!(croppedImage instanceof File)) {
                      throw new Error("Expected a File object from the image editor");
                    }
                    
                    // Show upload toast
                    const toastId=toast.loading('Uploading image...');
                    
                    // Upload the image using our helper
                    const { apiUrl, key } = await uploadImage(croppedImage);
                    console.log(apiUrl);
                    
                    // Get the signed URL for display
                    const signedUrlResponse = await getImageUrl(encodeURIComponent(key));
                    
                    // Insert the image into the editor
                    quill.insertEmbed(range.index, 'image', signedUrlResponse);
                    quill.setSelection({index:range.index+1,length:0});
                    
                    // Add data-key using basic DOM
                    const imageElements = quill.root.getElementsByTagName('img') as HTMLCollectionOf<HTMLImageElement>;
                    for (let i = 0; i < imageElements.length; i++) {
                      if (imageElements[i].src === signedUrlResponse) {
                        imageElements[i].setAttribute('data-key', key);
                        imageElements[i].setAttribute('crossorigin', 'anonymous');
                        break;
                      }
                    }
                    toast.success('Image uploaded successfully!',{id:toastId});
                  } catch (error) {
                    console.error('Error:', error);
                    toast.error(error instanceof Error ? error.message : "Failed to upload image");
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
          } catch (error) {
            console.error('Error initializing image editor:', error);
            toast.error('Failed to initialize image editor');
          }
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
  if (!key) {
    throw new Error('Image key is required');
  }
  
  try {
    // Key should already be encoded by the caller

    const url=`https://burstbubble-blogs.s3.ap-south-1.amazonaws.com/${key}`;
    return url;
    
    // if (!response.ok) {
    //   const errorData = await response.text();
    //   throw new Error(`Failed to get image URL (${response.status}): ${errorData}`);
    // }
    
    // const data = await response.json();
    // console.log(data.url);
    
    // if (!data.url) {
    //   throw new Error('Invalid response from image API: missing URL');
    // }
    
    // return data.url;
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
};

export const processContentBeforeSave = (content: string): string => {
  if (!content) return '';
  
  const div = document.createElement('div');
  div.innerHTML = content;

  const images = div.getElementsByTagName('img');
  Array.from(images).forEach((img: HTMLImageElement) => {
    // Prioritize data-key if it exists
    const key = img.getAttribute('data-key');
    if (key) {
      // Create a clean image element with only the necessary attributes
      const newImg = document.createElement('img');
      newImg.setAttribute('data-key', key);
      
      // Keep alt and title attributes if present
      if (img.hasAttribute('alt')) {
        newImg.setAttribute('alt', img.getAttribute('alt') || '');
      }
      
      if (img.hasAttribute('title')) {
        newImg.setAttribute('title', img.getAttribute('title') || '');
      }
      
      // Replace the old image with the clean one
      img.parentNode?.replaceChild(newImg, img);
    } else {
      // If there's no data-key, try to extract one from the src
      const src = img.getAttribute('src');
      if (src && src.includes('/api/image/')) {
        try {
          // Extract the key from the API URL
          const key = src.replace('/api/image/', '');
          const decodedKey = decodeURIComponent(key);
          
          // Create a clean image with data-key
          const newImg = document.createElement('img');
          newImg.setAttribute('data-key', decodedKey);
          
          // Keep alt and title attributes
          if (img.hasAttribute('alt')) {
            newImg.setAttribute('alt', img.getAttribute('alt') || '');
          }
          
          if (img.hasAttribute('title')) {
            newImg.setAttribute('title', img.getAttribute('title') || '');
          }
          
          // Replace the old image
          img.parentNode?.replaceChild(newImg, img);
        } catch (error) {
          console.error('Error processing image for save:', error);
        }
      }
    }
  });

  return div.innerHTML;
};

export const processContentAfterLoad = async (content: string): Promise<string> => {
  if (!content) return '';

  const div = document.createElement('div');
  div.innerHTML = content;

  const images = Array.from(div.getElementsByTagName('img'));
  await Promise.all(images.map(async (img: HTMLImageElement) => {
    const key = img.getAttribute('data-key');
    if (key) {
      try {
        // Make sure to encode the key properly
        const encodedKey = encodeURIComponent(key);
        const signedUrl = await getImageUrl(encodedKey);
        img.setAttribute('src', signedUrl);
        
        // Add crossorigin attribute for CORS support
        img.setAttribute('crossorigin', 'anonymous');
      } catch (error) {
        console.error('Error loading image:', error);
        // Set a placeholder image
        img.setAttribute('src', '/placeholder-image.jpg');
      }
    }
  }));

  return div.innerHTML;
};

// Helper function to upload an image and get API URL
export const uploadImage = async (file: File): Promise<{ apiUrl: string, key: string }> => {
  if (!file) {
    throw new Error('File is required');
  }
  
  try {
    // Generate a unique filename
    const fileName = `${uuidv4()}-${file.name.replace(/\s+/g, '-').toLowerCase()}`;
    
    // Get presigned URL for upload
    const response = await fetch("/api/upload/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: fileName,
        contentType: file.type
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to get upload URL (${response.status}): ${errorData}`);
    }
    
    const { signedUrl, key } = await response.json();
    
    // Upload to S3
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }
    
    // Return the API URL for the image
    const apiUrl = `/api/image/${encodeURIComponent(key)}`;
    return { apiUrl, key };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};