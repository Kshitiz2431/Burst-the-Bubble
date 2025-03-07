import { TestS3Upload } from "@/components/test-s3-upload";

export default function TestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Test S3 Upload</h1>
      <TestS3Upload />
    </div>
  );
}
