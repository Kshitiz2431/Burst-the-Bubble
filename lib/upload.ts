// lib/upload.ts
interface UploadResponse {
    key: string;
    url: string;
  }
  
  export async function uploadFileToS3(
    file: File,
    type: 'pdf' | 'cover' | 'template'
  ): Promise<UploadResponse> {
    try {
      // Get signed URL
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          type,
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }
  
      const { signedUrl, key } = await response.json();
  
      // Upload to S3
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
  
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }
  
      return {
        key,
        url: `/api/library/files/${encodeURIComponent(key)}`,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }