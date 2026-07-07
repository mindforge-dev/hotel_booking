"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface LightboxGalleryProps {
    images: string[];
    className?: string;
}

export default function LightboxGallery({ images, className }: LightboxGalleryProps) {
    const [openIndex, setOpenIndex] = useState<number>(-1);

    const slides = images.map((src) => ({ src }));

    return (
        <div className={className}>
            <div className="mb-3">
                {images[0] ? (
                    <div className="relative w-full h-64 md:h-80 cursor-zoom-in">
                        <img
                            src={images[0]}
                            alt="Main"
                            className="w-full h-full object-cover rounded-lg"
                            onClick={() => setOpenIndex(0)}
                        />
                    </div>
                ) : (
                    <div className="w-full h-64 md:h-80 bg-muted rounded-lg" />
                )}
            </div>

            {images.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                    {images.slice(1).map((src, i) => (
                        <div key={i} className="relative aspect-square cursor-zoom-in">
                            <img
                                src={src}
                                alt={`Image ${i + 1}`}
                                className="w-full h-full object-cover rounded-md"
                                onClick={() => setOpenIndex(i + 1)}
                            />
                        </div>
                    ))}
                </div>
            )}

            <Lightbox open={openIndex >= 0} slides={slides} index={openIndex >= 0 ? openIndex : 0} close={() => setOpenIndex(-1)} />
        </div>
    );
}
