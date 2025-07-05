"use client"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

const categories = [
  { id: "all", label: "Sve slike" },
  { id: "petar", label: "Petar spremanje" },
  { id: "marija", label: "Marija spremanje" },
  { id: "crkva", label: "Crkva" },
  { id: "photosession", label: "Photosession" },
  { id: "grupna", label: "Grupne slike" },
  { id: "party", label: "Party" },
]

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || "all"

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId === "all") {
      params.delete("category")
    } else {
      params.set("category", categoryId)
    }

    // Clear search when changing category
    params.delete("search")

    const newUrl = params.toString() ? `/?${params.toString()}` : "/"
    router.push(newUrl)
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={currentCategory === category.id ? "default" : "outline"}
          onClick={() => handleCategoryChange(category.id)}
          className="text-sm"
        >
          {category.label}
        </Button>
      ))}
    </div>
  )
}
