"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudinaryImage } from "@/components/cloudinary-image";

interface GalleryImage {
  public_id: string;
  secure_url: string;
  context?: {
    category?: string;
    alt?: string;
    custom?: {
      category?: string;
    };
  };
  tags?: string[];
  width: number;
  height: number;
}

interface ImageGalleryProps {
  showTags: boolean;
}

export default function ImageGallery({ showTags }: ImageGalleryProps) {
  const searchParams = useSearchParams();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalImages, setTotalImages] = useState(0);

  // Preloading cache
  const preloadedImages = useRef<Map<string, HTMLImageElement>>(new Map());
  const preloadQueue = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let filtered = images;

    // Filter by category (only context.custom.category)
    if (category && category !== "all") {
      filtered = filtered.filter((img) => {
        return img.context?.custom?.category === category;
      });
    }

    // Filter by search term (tags only)
    if (search) {
      filtered = filtered.filter(
        (img) =>
          img.tags &&
          img.tags.some((tag) =>
            tag.toLowerCase().includes(search.toLowerCase())
          )
      );
    }

    setFilteredImages(filtered);
  }, [searchParams, images]);

  // Generate optimized Cloudinary URL
  const getOptimizedImageUrl = useCallback((publicId: string, width = 1200) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_${width},q_auto,f_auto/${publicId}`;
  }, []);

  // Get first 3 characters of image name after removing number prefix
  const getImageShortName = useCallback((publicId: string) => {
    // Remove number prefix (like "001_") and get first 3 chars
    const nameWithoutNumber = publicId;
    return "slika_" + nameWithoutNumber.substring(0, 3).toUpperCase();
  }, []);

  // Preload images around current index
  const preloadImages = useCallback(
    (centerIndex: number) => {
      const preloadRange = 2; // Preload 2 images before and after

      for (
        let i = centerIndex - preloadRange;
        i <= centerIndex + preloadRange;
        i++
      ) {
        const index = (i + filteredImages.length) % filteredImages.length;
        if (index >= 0 && index < filteredImages.length) {
          const image = filteredImages[index];
          const imageUrl = getOptimizedImageUrl(image.public_id);

          // Skip if already preloaded or in queue
          if (
            preloadedImages.current.has(imageUrl) ||
            preloadQueue.current.has(imageUrl)
          ) {
            continue;
          }

          preloadQueue.current.add(imageUrl);

          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            preloadedImages.current.set(imageUrl, img);
            preloadQueue.current.delete(imageUrl);
          };
          img.onerror = () => {
            preloadQueue.current.delete(imageUrl);
          };
          img.src = imageUrl;
        }
      }

      // Clean up old preloaded images (keep only recent ones)
      if (preloadedImages.current.size > 10) {
        const entries = Array.from(preloadedImages.current.entries());
        const toDelete = entries.slice(0, entries.length - 10);
        toDelete.forEach(([url]) => {
          preloadedImages.current.delete(url);
        });
      }
    },
    [filteredImages, getOptimizedImageUrl]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!selectedImage || imageLoading) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigateImage("prev");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        navigateImage("next");
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }
    };

    if (selectedImage) {
      document.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedImage, currentIndex, filteredImages, imageLoading]);

  const fetchImages = async () => {
    try {
      setError(null);
      const response = await fetch("/api/images");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      const imageData = data.resources || [];

      setImages(imageData);
      setFilteredImages(imageData);
      setTotalImages(data.total || imageData.length);
    } catch (error) {
      console.error("Error fetching images:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch images"
      );
    } finally {
      setLoading(false);
    }
  };

  const openModal = (image: GalleryImage) => {
    const index = filteredImages.findIndex(
      (img) => img.public_id === image.public_id
    );
    setSelectedImage(image);
    setCurrentIndex(index);
    setImageLoading(true);

    // Start preloading surrounding images
    preloadImages(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setImageLoading(false);
  };

  const navigateImage = (direction: "prev" | "next") => {
    setImageLoading(true);
    const newIndex =
      direction === "prev"
        ? (currentIndex - 1 + filteredImages.length) % filteredImages.length
        : (currentIndex + 1) % filteredImages.length;

    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);

    // Preload images around new position
    preloadImages(newIndex);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const downloadImage = async (image: GalleryImage) => {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const downloadUrl = `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment/${image.public_id}.jpg`;

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${image.public_id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Učitavaju se sve slike...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Možda potraje par sekundica, ali samo što nije.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg mb-4">Upsić, error neki...</p>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchImages} className="mt-4">
          Pokušaj ponovno
        </Button>
      </div>
    );
  }

  if (filteredImages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          Hmm, nema slika s takvim filterom.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Probaj neku drugu kategoriju ili tag.
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Ukupno slika učitano: {totalImages}</p>
          <p>Trenutni filteri:</p>
          <p>Kategorija: {searchParams.get("category") || "all"}</p>
          <p>Search: {searchParams.get("search") || "none"}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-center">
        <p className="text-sm text-muted-foreground">
          Prikazuje se {filteredImages.length} od {totalImages} slika
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredImages.map((image) => (
          <div
            key={image.public_id}
            className="cursor-pointer overflow-hidden rounded-lg bg-muted"
            onClick={() => openModal(image)}
          >
            <div className="relative aspect-square">
              <CloudinaryImage
                src={image.public_id}
                alt={image.context?.alt || "Gallery image"}
                width={400}
                height={400}
                crop="fill"
                className="object-cover w-full h-full"
              />
            </div>
            {showTags && (
              <div className="p-2">
                <div className="flex flex-wrap gap-2">
                  {image.tags && image.tags.length > 0 ? (
                    image.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs px-0 py-0"
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No tags
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={closeModal}>
        <DialogContent className="max-w-none w-screen h-screen p-0 m-0 border-0">
          {selectedImage && (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              {/* Loading overlay */}
              {imageLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <p className="text-white text-sm">
                      Učitavanje slike... Samo sekundica...
                    </p>
                  </div>
                </div>
              )}

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white"
                onClick={closeModal}
                disabled={imageLoading}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Download button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-16 z-50 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => downloadImage(selectedImage)}
                disabled={imageLoading}
              >
                <Download className="h-6 w-6" />
              </Button>

              {/* Navigation buttons */}
              {filteredImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => navigateImage("prev")}
                    disabled={imageLoading}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => navigateImage("next")}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Main image */}
              <div className="w-full h-full flex items-center justify-center p-8">
                <img
                  src={
                    getOptimizedImageUrl(selectedImage.public_id, 1200) ||
                    "/placeholder.svg"
                  }
                  alt={selectedImage.context?.alt || "Gallery image"}
                  className="max-w-[90vw] max-h-[90vh] object-contain"
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                />
              </div>

              {/* Image info overlay - ALWAYS VISIBLE */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                {/* Tags section - only if showTags is true */}
                {showTags && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedImage.tags && selectedImage.tags.length > 0 ? (
                      selectedImage.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-white/20 text-white border-white/30"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-white/70 text-sm">Nema tagova</span>
                    )}
                  </div>
                )}

                {/* Image info - ALWAYS VISIBLE */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-white/70 text-sm">
                      {currentIndex + 1} od {filteredImages.length}
                    </p>
                    <p className="text-white/70 text-sm">
                      <span className="text-white/50">Ime/broj slike:</span>{" "}
                      {getImageShortName(selectedImage.public_id)}
                    </p>
                  </div>
                  <p className="text-white/50 text-xs text-right">
                    Koristi ← → strelice za navigaciju <br /> ESC za izlazak
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
