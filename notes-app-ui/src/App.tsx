import { useState, useRef, useEffect } from "react";

import "./App.css";

interface Note {
  id: number;
  date: String;
  title: string;
  content: string;
}

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notes");
        const notes: Note[] = await response.json();
        setNotes(notes);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        isHTMLElement(event.target) &&
        !containerRef.current.contains(event.target)
      ) {
        handleCancel();
      }
    };

    const isHTMLElement = (
      target: EventTarget | null
    ): target is HTMLElement => {
      return target instanceof HTMLElement;
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const newNote = await response.json();

      setNotes([newNote, ...notes]);
      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedNote(null);
  };

  const handleDeleteNote = async (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation();
    try {
      await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
    }

    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
  };

  const handleUpdateNote = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedNote) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/notes/${selectedNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );
      const updatedNote = await response.json();
      const updatedNotes = notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      );

      setNotes(updatedNotes);
      setTitle("");
      setContent("");
      setSelectedNote(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container" ref={containerRef}>
      <form
        className="note-form"
        onSubmit={(event) => {
          selectedNote ? handleUpdateNote(event) : handleAddNote(event);
        }}
      >
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          required
        />
        <textarea
          value={content}
          rows={10}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          placeholder="Content"
          required
        ></textarea>
        {selectedNote ? (
          <>
            <button type="submit">Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <button type="submit">Add Note</button>
        )}
      </form>
      <div className="notes-list">
        {notes.map((note) => (
          <div
            key={note.title + note.id}
            className="note-item"
            onClick={() => {
              handleNoteClick(note);
            }}
          >
            <div className="notes-header">
              <p>{note.date}</p>
              <button
                onClick={(event) => {
                  handleDeleteNote(event, note.id);
                }}
              >
                x
              </button>
            </div>
            <div>
              <h2>{note.title}</h2>
              <p>{note.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
