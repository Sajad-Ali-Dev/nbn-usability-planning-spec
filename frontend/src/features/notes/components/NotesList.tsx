'use client'

import { useState } from 'react'
import { where } from 'firebase/firestore'
import { useCollection } from '@/hooks/useFirestore'
import { useAuth } from '@/hooks/useAuth'
import { getNotesCollection } from '@/lib/firebase/firestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'

export function NotesList() {
  const { user, loading } = useAuth()

  // Wait for auth: querying before the uid is known is denied by the security rules.
  if (!user) return loading ? <LoadingSpinner /> : null

  // key remounts the subscription if the signed-in user changes
  return <UserNotes key={user.uid} uid={user.uid} />
}

function UserNotes({ uid }: { uid: string }) {
  // useCollection resubscribes when the ref changes — keep one stable ref per mount
  const [notesRef] = useState(() => getNotesCollection())
  const { data: notes, loading, error } = useCollection(notesRef, where('uid', '==', uid))

  if (loading) return <LoadingSpinner />
  if (error) return <EmptyState title="Couldn't load notes" description={error.message} />
  if (notes.length === 0) return <EmptyState title="No notes yet" />

  return (
    <ul className="space-y-2">
      {notes.map((note) => (
        <li key={note.id} className="rounded-lg border p-4">
          <h3 className="font-medium">{note.title}</h3>
          <p className="text-sm text-zinc-500">{note.body}</p>
        </li>
      ))}
    </ul>
  )
}
