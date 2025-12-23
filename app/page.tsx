"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Trash2, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

export default function NoteTakingApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem("notes")) {
      localStorage.setItem("notes", JSON.stringify(notes))
    }
  }, [notes])

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setEditTitle(newNote.title)
    setEditContent(newNote.content)
    setIsEditing(true)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
      setIsEditing(false)
    }
  }

  const startEditing = (note: Note) => {
    setSelectedNote(note)
    setEditTitle(note.title)
    setEditContent(note.content)
    setIsEditing(true)
  }

  const saveNote = () => {
    if (selectedNote) {
      setNotes(
        notes.map((note) =>
          note.id === selectedNote.id
            ? { ...note, title: editTitle, content: editContent, updatedAt: Date.now() }
            : note,
        ),
      )
      setSelectedNote({ ...selectedNote, title: editTitle, content: editContent, updatedAt: Date.now() })
      setIsEditing(false)
    }
  }

  const cancelEdit = () => {
    if (selectedNote) {
      setEditTitle(selectedNote.title)
      setEditContent(selectedNote.content)
    }
    setIsEditing(false)
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Notes</h1>
          <p className="text-muted-foreground">Create and organize your thoughts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Notes List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={createNewNote} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto">
              {filteredNotes.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    {searchQuery ? "No notes found" : "No notes yet. Create one to get started!"}
                  </CardContent>
                </Card>
              ) : (
                filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary",
                      selectedNote?.id === note.id && "border-primary bg-accent",
                    )}
                    onClick={() => {
                      setSelectedNote(note)
                      setEditTitle(note.title)
                      setEditContent(note.content)
                      setIsEditing(false)
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base font-semibold truncate">{note.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNote(note.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{note.content || "No content"}</p>
                      <p className="text-xs text-muted-foreground mt-2">{formatDate(note.updatedAt)}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Main Content - Note Editor */}
          <div className="lg:col-span-2">
            {selectedNote ? (
              <Card className="h-[calc(100vh-180px)]">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between gap-4">
                    {isEditing ? (
                      <>
                        <Input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-2xl font-bold border-0 focus-visible:ring-0 px-0"
                          placeholder="Note title..."
                        />
                        <div className="flex gap-2 shrink-0">
                          <Button onClick={saveNote} size="sm">
                            <Check className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={cancelEdit} variant="outline" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <CardTitle className="text-2xl">{selectedNote.title}</CardTitle>
                        <Button onClick={() => startEditing(selectedNote)} size="sm">
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Last updated: {formatDate(selectedNote.updatedAt)}
                  </p>
                </CardHeader>
                <CardContent className="pt-6 h-[calc(100%-120px)]">
                  {isEditing ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Start typing your note..."
                      className="h-full resize-none border-0 focus-visible:ring-0 px-0 text-base"
                    />
                  ) : (
                    <div className="h-full overflow-y-auto">
                      <p className="text-foreground whitespace-pre-wrap">
                        {selectedNote.content || "No content yet. Click Edit to add content."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[calc(100vh-180px)] flex items-center justify-center">
                <CardContent className="text-center">
                  <div className="text-muted-foreground space-y-2">
                    <p className="text-lg font-medium">No note selected</p>
                    <p className="text-sm">Select a note from the list or create a new one</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
