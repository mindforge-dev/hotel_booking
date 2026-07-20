"use client";

import React from "react";

export default function Loading() {
  return (
    <>
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-muted rounded-full animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
      </div>

      <div className="container mx-auto py-10 px-4 max-w-5xl">
        {/* Header Skeleton */}
        <div className="mb-6 space-y-2">
          <div className="h-5 w-24 bg-muted rounded-md animate-pulse" />
          <div className="h-8 w-1/3 bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-1/4 bg-muted rounded-md animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-8 space-y-6">
            <div className="h-64 md:h-80 w-full bg-muted rounded-xl animate-pulse" />
            <div className="space-y-3">
              <div className="h-6 w-1/4 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded-md animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-6 w-1/4 bg-muted rounded-md animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 w-full bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Card Skeleton */}
          <div className="lg:col-span-4">
            <div className="border rounded-xl p-6 shadow-md bg-card space-y-6">
              <div className="space-y-2">
                <div className="h-8 w-1/3 bg-muted rounded-md animate-pulse" />
                <div className="h-4 w-2/3 bg-muted rounded-md animate-pulse" />
              </div>
              <hr />
              <div className="space-y-4">
                <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
                <div className="h-4 w-full bg-muted rounded-md animate-pulse" />
              </div>
              <div className="h-12 w-full bg-muted rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
