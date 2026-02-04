import { NextRequest, NextResponse } from 'next/server';

const NOCODB_STORAGE_URL = 'https://a2db.a2cloud.link/api/v2/storage/upload';
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN;

interface NocoDBUploadResponse {
  url: string;
  path: string;
  title: string;
  mimetype: string;
  size: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/html',
      'application/rtf',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed. Use PDF, DOC, DOCX, TXT, HTML, or RTF.' },
        { status: 400 }
      );
    }

    if (!NOCODB_API_TOKEN) {
      console.error('NOCODB_API_TOKEN not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create FormData for NocoDB
    const nocoFormData = new FormData();
    nocoFormData.append('file', file);

    const response = await fetch(NOCODB_STORAGE_URL, {
      method: 'POST',
      headers: {
        'xc-token': NOCODB_API_TOKEN,
      },
      body: nocoFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NocoDB upload error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    const uploadResult: NocoDBUploadResponse[] = await response.json();

    if (!uploadResult || uploadResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult[0].url,
      filename: uploadResult[0].title,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
