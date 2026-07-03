import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialise le client S3 pour Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENTRYPOINT || '',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();
    
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename et contentType sont requis' }, { status: 400 });
    }

    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'bibleplan';
    // Génère une clé unique pour le fichier audio dans R2
    const fileKey = `audios/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    // Génère l'URL présignée d'upload (valable 15 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    // L'URL publique d'accès
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileKey}`;

    return NextResponse.json({ uploadUrl, publicUrl, fileKey });
  } catch (error: any) {
    console.error("Erreur lors de la génération de l'URL de dépôt R2 :", error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
