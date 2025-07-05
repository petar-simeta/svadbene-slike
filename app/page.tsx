"use client";

import { useState, Suspense } from "react";
import ImageGallery from "@/components/image-gallery";
import CategoryFilter from "@/components/category-filter";
import SearchBar from "@/components/search-bar";
import TagToggle from "@/components/tag-toggle";

export default function Home() {
  const [showTags, setShowTags] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Naše slike sa svadbe</h1>
          <TagToggle showTags={showTags} onToggle={setShowTags} />
        </div>

        <div className="mb-8 space-y-4">
          <CategoryFilter />
          <SearchBar />
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          }
        >
          <ImageGallery showTags={showTags} />
        </Suspense>
      </div>
    </main>
  );
}
