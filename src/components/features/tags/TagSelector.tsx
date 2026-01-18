import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { useTags, useCreateTag } from '@/hooks/useTags'
import { getTagColorClasses, cn } from '@/lib/utils'
import { TAG_COLORS } from '@/lib/constants'
import type { Tag, TagColor } from '@/types/database.types'

interface TagSelectorProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  disabled = false,
  placeholder = 'Add tags',
  className,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState<TagColor>('gray')
  const [isCreating, setIsCreating] = useState(false)

  const { data: availableTags = [] } = useTags()
  const createTag = useCreateTag()

  const handleToggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id)
    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t.id !== tag.id))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter((t) => t.id !== tagId))
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const newTag = await createTag.mutateAsync({
        name: newTagName.trim(),
        color: newTagColor,
      })
      onTagsChange([...selectedTags, newTag])
      setNewTagName('')
      setNewTagColor('gray')
      setIsCreating(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const unselectedTags = availableTags.filter(
    (tag) => !selectedTags.some((t) => t.id === tag.id)
  )

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {/* Selected tags */}
      {selectedTags.map((tag) => {
        const colors = getTagColorClasses(tag.color)
        return (
          <Badge
            key={tag.id}
            variant="outline"
            className={cn(colors.bg, colors.text, colors.border, 'gap-1')}
          >
            {tag.name}
            {!disabled && (
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-70"
                onClick={() => handleRemoveTag(tag.id)}
              />
            )}
          </Badge>
        )
      })}

      {/* Add tag popover */}
      {!disabled && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs border-dashed"
            >
              <Plus className="h-3 w-3 mr-1" />
              {placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            {isCreating ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="h-8"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-1">
                    {TAG_COLORS.map((color) => {
                      const colors = getTagColorClasses(color.value)
                      return (
                        <button
                          key={color.value}
                          onClick={() => setNewTagColor(color.value as TagColor)}
                          className={cn(
                            'w-6 h-6 rounded-full border-2',
                            colors.bg,
                            newTagColor === color.value
                              ? 'border-gray-800'
                              : 'border-transparent'
                          )}
                          title={color.label}
                        />
                      )
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setIsCreating(false)
                      setNewTagName('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || createTag.isPending}
                  >
                    Create
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {unselectedTags.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {unselectedTags.map((tag) => {
                      const colors = getTagColorClasses(tag.color)
                      return (
                        <button
                          key={tag.id}
                          onClick={() => handleToggleTag(tag)}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted text-left"
                        >
                          <Badge
                            variant="outline"
                            className={cn(colors.bg, colors.text, colors.border)}
                          >
                            {tag.name}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No more tags available
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create new tag
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

// Simple inline tag display component
interface TagBadgeProps {
  tag: Tag
  onRemove?: () => void
  className?: string
}

export function TagBadge({ tag, onRemove, className }: TagBadgeProps) {
  const colors = getTagColorClasses(tag.color)

  return (
    <Badge
      variant="outline"
      className={cn(colors.bg, colors.text, colors.border, 'gap-1', className)}
    >
      {tag.name}
      {onRemove && (
        <X
          className="h-3 w-3 cursor-pointer hover:opacity-70"
          onClick={onRemove}
        />
      )}
    </Badge>
  )
}
