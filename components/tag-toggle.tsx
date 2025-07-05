"use client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface TagToggleProps {
  showTags: boolean
  onToggle: (show: boolean) => void
}

export default function TagToggle({ showTags, onToggle }: TagToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="show-tags" className="text-sm font-medium">
        Tags
      </Label>
      <Switch id="show-tags" checked={showTags} onCheckedChange={onToggle} />
    </div>
  )
}
