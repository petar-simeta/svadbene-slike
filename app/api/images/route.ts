import { type NextRequest, NextResponse } from "next/server";

async function fetchAllCloudinaryImages(
  cloudName: string,
  apiKey: string,
  apiSecret: string
) {
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  let allImages: any[] = [];
  let nextCursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    // Build URL with pagination
    let url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=500&tags=true&context=true&metadata=true`;

    if (nextCursor) {
      url += `&next_cursor=${nextCursor}`;
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Cloudinary API error: ${response.status}`);
      }

      const result = await response.json();
      const images = result.resources || [];

      // Add images to our collection
      allImages = [...allImages, ...images];

      // Check if there are more images
      nextCursor = result.next_cursor;
      hasMore = !!nextCursor;

      console.log(
        `Fetched ${images.length} images, total so far: ${allImages.length}`
      );
    } catch (error) {
      console.error("Error fetching batch:", error);
      throw error;
    }
  }

  console.log(`Total images fetched: ${allImages.length}`);
  return allImages;
}

export async function GET(request: NextRequest) {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Cloudinary not configured properly" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Fetch ALL images using pagination
    let images = await fetchAllCloudinaryImages(
      process.env.CLOUDINARY_CLOUD_NAME,
      process.env.CLOUDINARY_API_KEY,
      process.env.CLOUDINARY_API_SECRET
    );

    // Sort images by number in filename (001_something, 002_something, etc.)
    images.sort((a: any, b: any) => {
      const getNumberFromFilename = (publicId: string) => {
        // Extract number from filename like "001_something" or "002_something"
        const match = publicId.match(/^(\d+)/);
        return match ? Number.parseInt(match[1], 10) : 999999; // Put images without numbers at the end
      };

      const numA = getNumberFromFilename(a.public_id);
      const numB = getNumberFromFilename(b.public_id);

      return numA - numB;
    });

    // Filter images based on category (ONLY context.custom.category, NOT tags)
    if (category && category !== "all") {
      images = images.filter((img: any) => {
        return img.context?.custom?.category === category;
      });
    }

    // Filter by search term (tags only)
    if (search) {
      images = images.filter((img: any) => {
        return (
          img.tags &&
          img.tags.some((tag: string) =>
            tag.toLowerCase().includes(search.toLowerCase())
          )
        );
      });
    }

    return NextResponse.json({
      resources: images,
      total: images.length,
    });
  } catch (error) {
    console.error("Error in images API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
