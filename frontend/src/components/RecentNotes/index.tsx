import React, {useEffect, useState} from 'react';
import './styles.css';

interface Note {
  id: number;
  title: string;
  category: string;
  categoryColor: string;
}

const RecentNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    }
    fetchNotes();
  }, []);


  return (
    <div className="notes-container">
      <h2>
        <span className="icon">📝</span>
        Recent Notes
      </h2>
      
      <div className="notes-list">
        {notes.slice(0, 5).map((note: Note) => (
          <div key={note.id} className="note-item">
            <div className="note-title">{note.title}</div>
            <div 
              className="note-category"
              style={{ backgroundColor: note.categoryColor }}
            >
              {note.category}
            </div>
          </div>
        ))}
      </div>
      
      <div className="notes-footer">
        (Last 5 notes)
      </div>
    </div>
  );
};

export default RecentNotes; 