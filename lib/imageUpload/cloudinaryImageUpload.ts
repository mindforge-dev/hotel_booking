import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface ResizeOptions {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export async function uploadToCloudinary(file: any, resizeOptions?: ResizeOptions): Promise<string> {
    try {
        // Helper function to create upload promise
        const uploadToCloudinaryHelper = (buffer: Buffer): Promise<string> => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'hotel-rooms',
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            resolve(result!.secure_url);
                        }
                    }
                );
                uploadStream.end(buffer);
            });
        };

        let buffer: Buffer;

        if (!file) {
            throw new Error('No file provided');
        }

        // Handle different types of input
        if (file instanceof Buffer) {
            buffer = file;
        } else if (file instanceof Uint8Array) {
            buffer = Buffer.from(file);
        } else if (typeof file.arrayBuffer === 'function') {
            // Handles both Blob and File objects
            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else if (file.buffer && file.buffer instanceof Buffer) {
            // Handle formData file object
            buffer = file.buffer;
        } else {
            console.error('Unhandled file type:', typeof file, file);
            throw new Error('Unsupported file format');
        }

        // Resize image if resize options are provided
        if (resizeOptions && (resizeOptions.width || resizeOptions.height)) {
            try {
                let sharpInstance = sharp(buffer);
                sharpInstance = sharpInstance.resize({
                    width: resizeOptions.width,
                    height: resizeOptions.height,
                    fit: resizeOptions.fit || 'cover',
                    position: 'center',
                    withoutEnlargement: true
                });
                buffer = await sharpInstance.toBuffer();
            } catch (err) {
                console.error('Sharp image resizing failed, uploading original image instead:', err);
            }
        }

        return await uploadToCloudinaryHelper(buffer);
    } catch (error) {
        console.error('Error in uploadToCloudinary:', error);
        throw error;
    }
}