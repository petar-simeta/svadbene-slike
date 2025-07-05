import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: "Cloudinary not configured properly" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/image?max_results=500&tags=true&context=true&metadata=true`

    const auth = Buffer.from(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`).toString(
      "base64",
    )

    const response = await fetch(cloudinaryUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Cloudinary API error: ${response.status}`)
    }

    const result = await response.json()
    let images = result.resources || []

    // Sort images by number in filename (001_something, 002_something, etc.)
    images.sort((a: any, b: any) => {
      const getNumberFromFilename = (publicId: string) => {
        // Extract number from filename like "001_something" or "002_something"
        const match = publicId.match(/^(\d+)/)
        return match ? Number.parseInt(match[1], 10) : 999999 // Put images without numbers at the end
      }

      const numA = getNumberFromFilename(a.public_id)
      const numB = getNumberFromFilename(b.public_id)

      return numA - numB
    })

    // Filter images based on category (ONLY context.custom.category, NOT tags)
    if (category && category !== "all") {
      images = images.filter((img: any) => {
        return img.context?.custom?.category === category
      })
    }

    // Filter by search term (tags only)
    if (search) {
      images = images.filter((img: any) => {
        return img.tags && img.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
      })
    }

    return NextResponse.json({ resources: images })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
