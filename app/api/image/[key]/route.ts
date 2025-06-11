// app/api/image/[key]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { getSignedUrl } from "@/lib/s3";


const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const key = decodeURIComponent(params.key);

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL valid for 1 hour
    });

    return NextResponse.json({ url: signedUrl });

  } catch (error) {
    console.error("Image fetch error:", error);
    return NextResponse.json(
      { error: "Failed to generate image URL" },
      { status: 500 }
    );
  }
}

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { key: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return new NextResponse(
//         JSON.stringify({ message: "Unauthorized" }), 
//         { status: 401 }
//       );
//     }

//     if (!params.key) {
//       return new NextResponse(
//         JSON.stringify({ message: "Image key is required" }), 
//         { status: 400 }
//       );
//     }

//     // Get a fresh signed URL for the image
//     const signedUrl = await getSignedUrl(params.key, 'get');

//     return NextResponse.json({ url: signedUrl });

//   } catch (error) {
//     console.error("Error getting image URL:", error);
//     return new NextResponse(
//       JSON.stringify({ message: "Internal Server Error" }), 
//       { status: 500 }
//     );
//   }
// }