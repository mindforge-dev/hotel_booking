'use client';

import { useState, useRef } from 'react';

export default function ImageUploadClient() {
    const [mainPreview, setMainPreview] = useState<string | null>(null);
    const [subPreviews, setSubPreviews] = useState<string[]>([]);

    const mainInputRef = useRef<HTMLInputElement | null>(null);

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
        const remainingSlots = 5 - subPreviews.length;
        const filesToAdd = files.slice(0, remainingSlots);

        filesToAdd.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSubPreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeMainImage = () => {
        setMainPreview(null);
        // Clear the actual file input so the file isn't submitted
        if (mainInputRef.current) {
            mainInputRef.current.value = '';
        } else {
            const input = document.querySelector('input[name="mainImage"]') as HTMLInputElement;
            if (input) input.value = '';
        }
    };

    const removeSubImage = (index: number) => {
        setSubPreviews(subPreviews.filter((_, i) => i !== index));
        const input = document.querySelector('input[name="subImages"]') as HTMLInputElement;
        if (input) input.value = '';
    };

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
                        {/* Input is now rendered outside the conditional to ensure it's always present in the DOM */}
                    </label>
                ) : (
                    <div className="relative">
                        <img
                            src={mainPreview}
                            alt="Main preview"
                            className="w-full h-48 object-cover rounded-md"
                        />
                        {/* small edit button to change main image if preview is showing */}
                        <button
                            type="button"
                            onClick={() => mainInputRef.current?.click()}
                            className="absolute left-2 bottom-2 bg-white text-sm text-muted-foreground px-2 py-1 rounded-md shadow"
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
                {/* Always-mounted hidden input so the File is present when the form is submitted */}
                <input
                    id="mainImageInput"
                    ref={mainInputRef}
                    type="file"
                    name="mainImage"
                    className="hidden"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    required
                />
            </div>

            {/* Sub Images Upload */}
            <div>
                <label className="block text-sm font-medium mb-1">
                    Additional Images
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                    Add up to 5 additional images ({subPreviews.length}/5)
                </p>

                {subPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        {subPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={preview}
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

                {subPreviews.length < 5 && (
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
                            name="subImages"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleSubImagesChange}
                        />
                    </label>
                )}
            </div>
        </div>
    );
}