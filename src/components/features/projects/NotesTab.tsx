import { useState } from 'react'
import { Plus, Pin, MoreHorizontal, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProjectNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/useProjects'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface NotesTabProps {
  projectId: string
}

export function NotesTab({ projectId }: NotesTabProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<any>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  const { data: notes, isLoading } = useProjectNotes(projectId)
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  const handleCreateNote = () => {
    if (!noteContent.trim()) return

    createNote.mutate(
      {
        projectId,
        data: {
          title: noteTitle || undefined,
          content: noteContent,
        },
      },
      {
        onSuccess: () => {
          setCreateDialogOpen(false)
          setNoteTitle('')
          setNoteContent('')
        },
      }
    )
  }

  const handleUpdateNote = () => {
    if (!editingNote || !noteContent.trim()) return

    updateNote.mutate(
      {
        noteId: editingNote.id,
        projectId,
        data: {
          title: noteTitle || undefined,
          content: noteContent,
        },
      },
      {
        onSuccess: () => {
          setEditingNote(null)
          setNoteTitle('')
          setNoteContent('')
        },
      }
    )
  }

  const handleTogglePin = (noteId: string, isPinned: boolean) => {
    updateNote.mutate({
      noteId,
      projectId,
      data: { is_pinned: !isPinned },
    })
  }

  const handleDeleteNote = (noteId: string) => {
    deleteNote.mutate({ noteId, projectId })
  }

  const openEditDialog = (note: any) => {
    setEditingNote(note)
    setNoteTitle(note.title || '')
    setNoteContent(note.content)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Project Notes</h2>
          <p className="text-sm text-muted-foreground">
            Internal notes for your team (not visible to clients)
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription>
                Create an internal note for your team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="Note title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your note..."
                  rows={6}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNote} disabled={!noteContent.trim() || createNote.isPending}>
                Save Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-5 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-full mt-2" />
                <div className="h-4 bg-muted rounded w-3/4 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notes && notes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <Card
              key={note.id}
              className={cn(note.is_pinned && 'border-primary')}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  {note.is_pinned && (
                    <Pin className="h-4 w-4 text-primary fill-primary" />
                  )}
                  {note.title && (
                    <CardTitle className="text-base">{note.title}</CardTitle>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTogglePin(note.id, note.is_pinned)}>
                      <Pin className="mr-2 h-4 w-4" />
                      {note.is_pinned ? 'Unpin' : 'Pin'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(note)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap line-clamp-6">{note.content}</p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={note.user?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {note.user?.name ? getInitials(note.user.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {note.user?.name} · {formatRelativeTime(note.updated_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-medium">No notes yet</h3>
            <p className="mt-2 text-muted-foreground">
              Add notes to keep your team informed about this project.
            </p>
            <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Note
            </Button>
          </div>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title (optional)</Label>
              <Input
                id="edit-title"
                placeholder="Note title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                placeholder="Write your note..."
                rows={6}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateNote} disabled={!noteContent.trim() || updateNote.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
