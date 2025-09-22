import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

// Force Node.js runtime (AWS SDK not supported on edge)
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { name, type } = await req.json();
    const region = process.env.AWS_REGION as string;
    const bucket = process.env.S3_BUCKET as string;

    if (!region || !bucket) {
      return new Response(
        JSON.stringify({ error: 'S3 not configured. Set AWS_REGION and S3_BUCKET.' }),
        { status: 500 }
      );
    }

    if (!type || !type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Only image uploads are allowed.' }), { status: 400 });
    }

    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    const ext = name?.split('.').pop()?.toLowerCase() || 'bin';
    const key = `uploads/${new Date().toISOString().slice(0,10)}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: type });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return new Response(JSON.stringify({ key, uploadUrl }), { status: 200 });
  } catch (e: any) {
    console.error('sign upload error', e);
    return new Response(JSON.stringify({ error: 'Failed to sign upload' }), { status: 500 });
  }
}
