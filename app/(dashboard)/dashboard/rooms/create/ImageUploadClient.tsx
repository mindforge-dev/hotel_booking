'use client';

import { useState, useRef, useLayoutEffect } from 'react';

interface SubImage {
    file: File;
    preview: string;
}

export default function ImageUploadClient() {
    const [mainPreview, setMainPreview] = useState<string | null>(null);
    const [subImages, setSubImages] = useState<SubImage[]>([]);
    const mainInputRef = useRef<HTMLInputElement | null>(null);
    const subInputRef = useRef<HTMLInputElement | null>(null);

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMainPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const remainingSlots = 5 - subImages.length;
        const filesToAdd = files.slice(0, remainingSlots);

        const newSubs: SubImage[] = [];
        let pending = filesToAdd.length;

        if (pending === 0) return;

        filesToAdd.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newSubs.push({ file, preview: reader.result as string });
                pending--;
                if (pending === 0) {
                    setSubImages((prev) => [...prev, ...newSubs]);
                }
            };
            reader.readAsDataURL(file);
        });

        // Reset input so the same file can be re-selected
        e.target.value = '';
    };

    const removeMainImage = () => {
        setMainPreview(null);
        if (mainInputRef.current) {
            mainInputRef.current.value = '';
        }
    };

    const removeSubImage = (index: number) => {
        setSubImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Sync File objects into the hidden input so they're included in FormData
    useLayoutEffect(() => {
        if (!subInputRef.current) return;
        try {
            const dt = new DataTransfer();
            subImages.forEach((sub) => dt.items.add(sub.file));
            subInputRef.current.files = dt.files;
        } catch {
            // DataTransfer not supported — files won't be sent
        }
    }, [subImages]);

    return (
        <div className="space-y-6">
            {/* Main Image Upload */}
            <div>
                <label className="block text-sm font-medium mb-1">
                    Main Room Image
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                    This will be the primary image for the room
                </p>

                {!mainPreview ? (
                    <label htmlFor="mainImageInput" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-accent transition-colors">
                        <div className="flex flex-col items-center justify-center py-6">
                            <svg className="w-10 h-10 mb-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mb-2 text-sm">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX. 5MB)</p>
                        </div>
                    </label>
                ) : (
                    <div className="relative">
                        <img
                            src={mainPreview}
                            alt="Main preview"
                            className="w-full h-48 object-cover rounded-md"
                        />
                        <button
                            type="button"
                            onClick={() => mainInputRef.current?.click()}
                            className="absolute left-2 bottom-2 bg-background text-sm text-muted-foreground px-2 py-1 rounded-md shadow"
                        >
                            Change
                        </button>
                        <button
                            type="button"
                            onClick={removeMainImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <input
                    id="mainImageInput"
                    ref={mainInputRef}
                    type="file"
                    name="mainImage"
                    className="hidden"
                    accept="image/*"
                    onChange={handleMainImageChange}
                />
            </div>

            {/* Sub Images Upload */}
            <div>
                <label className="block text-sm font-medium mb-1">
                    Additional Images
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                    Add up to 5 additional images ({subImages.length}/5)
                </p>

                {subImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        {subImages.map((sub, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={sub.preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeSubImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {subImages.length < 5 && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-accent transition-colors">
                        <div className="flex flex-col items-center justify-center">
                            <svg className="w-8 h-8 mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">
                                <span className="font-semibold">Add more images</span>
                            </p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleSubImagesChange}
                        />
                    </label>
                )}

                {/* Hidden input synced with File objects for form submission */}
                <input
                    ref={subInputRef}
                    type="file"
                    name="subImages"
                    className="hidden"
                    multiple
                    accept="image/*"
                />
            </div>
        </div>
    );
}
