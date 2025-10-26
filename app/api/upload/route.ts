import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/imageUpload/cloudinaryImageUpload';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        try {
            const url = await uploadToCloudinary(file);
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
