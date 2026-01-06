import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotesThread, sendNoteMessage, type NoteMessage } from "@/api/notes";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import NotesComposer from "./NotesComposer";
import { getErrorMessage } from "@/utils/errors";

const NotesTab = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data: messages = [], isLoading, error } = useQuery<NoteMessage[]>({
    queryKey: ["notes", applicationId],
    queryFn: ({ signal }) => fetchNotesThread(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId)
  });

  const mutation = useMutation({
    mutationFn: (text: string) => sendNoteMessage(applicationId ?? "", text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", applicationId] })
  });

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    await mutation.mutateAsync(text);
  };

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view notes.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading notes…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load notes.")}</div>;

  return (
    <div className="drawer-tab drawer-tab__notes">
      <div className="notes-thread" ref={containerRef}>
        {messages.length ? (
          messages.map((message) => (
            <div key={message.id} className="note-message">
              <div className="note-message__avatar">{message.author.slice(0, 2).toUpperCase()}</div>
              <div className="note-message__body">
                <div className="note-message__author">{message.author}</div>
                <div className="note-message__text">{message.body}</div>
                <div className="note-message__timestamp">{message.createdAt}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="drawer-placeholder">No notes yet.</div>
        )}
      </div>
      <NotesComposer onSend={handleSend} />
    </div>
  );
};

export default NotesTab;
