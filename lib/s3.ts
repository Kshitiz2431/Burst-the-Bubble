// lib/s3.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";


const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function deleteFileFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
}

export async function getSignedUrl(
  key: string, 
  operation: 'get' | 'put',
  additionalParams: Record<string, any> = {}
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ...additionalParams,
  });

  try {
    const signedUrl = await awsGetSignedUrl(s3Client, command, {
      expiresIn: 36, // URL expires in 1 hour
    });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}














// Custom error class for S3 uploads
export class S3UploadError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = "S3UploadError";
  }
}

// Validation utilities
export const validateImage = (file: File) => {
  // Check file type
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    throw new S3UploadError(
      "Invalid file type. Please upload a PNG or JPG image",
      "INVALID_FILE_TYPE"
    );
  }

  // Check file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new S3UploadError(
      "File too large. Maximum size is 5MB",
      "FILE_TOO_LARGE"
    );
  }

  return true;
};

async function uploadToS3(file: File, type: "cover" | "content") {
  try {
    validateImage(file);

    // Get signed URL from our API
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }

    const { signedUrl, publicUrl } = await response.json();

    // Upload to S3 using signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file");
    }

    return publicUrl;
  } catch (error) {
    if (error instanceof S3UploadError) {
      throw error;
    }
    console.error("Upload error:", error);
    throw new S3UploadError("Failed to upload image", "UNKNOWN_ERROR", error);
  }
}

export const uploadBlogCoverImageToS3 = (file: File) =>
  uploadToS3(file, "cover");

export const uploadQuillImageToS3 = (file: File) => uploadToS3(file, "content");
