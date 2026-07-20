import { NextResponse } from 'next/server';
import { uploadToCloudinary, ResizeOptions } from '@/lib/imageUpload/cloudinaryImageUpload';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const widthStr = formData.get('width') as string | null;
        const heightStr = formData.get('height') as string | null;
        const fitStr = formData.get('fit') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const resizeOptions: ResizeOptions = {};
        if (widthStr) {
            const width = parseInt(widthStr, 10);
            if (!isNaN(width)) resizeOptions.width = width;
        }
        if (heightStr) {
            const height = parseInt(heightStr, 10);
            if (!isNaN(height)) resizeOptions.height = height;
        }
        if (fitStr) {
            resizeOptions.fit = fitStr as any;
        }

        try {
            const url = await uploadToCloudinary(file, resizeOptions);
            return NextResponse.json({ url }, { status: 200 });
        } catch (err) {
            console.error('Cloudinary upload failed', err);
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
        }
    } catch (err) {
        console.error('Invalid form data', err);
        return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
}

