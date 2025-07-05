import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: "Cloudinary not configured properly" }, { status: 500 })
    }

    const imageId = params.id
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/image/${imageId}?tags=true&context=true&metadata=true`

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
      return NextResponse.json({ error: `Cloudinary API error: ${response.status}`, details: errorText })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in debug image API:", error)
    return NextResponse.json({ error: "Internal server error" })
  }
}
