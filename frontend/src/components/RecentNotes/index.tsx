import React, {useEffect, useState} from 'react';
import WidgetWrapper from '../WidgetWrapper';
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
        
        // Add category and color data to each note
        const notesWithCategories = data.map((note: any) => {
          const categories = ['Work', 'Personal', 'Ideas', 'Meeting', 'Project'];
          const colors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336'];
          
          const randomCategoryIndex = Math.floor(Math.random() * categories.length);
          
          return {
            ...note,
            category: categories[randomCategoryIndex],
            categoryColor: colors[randomCategoryIndex]
          };
        });
        
        setNotes(notesWithCategories);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    }
    fetchNotes();
  }, []);


  return (
    <WidgetWrapper title="Recent Notes" icon="📝">
      <div className="notes-list">
        {notes.slice(0, 5).map((note: Note) => (
          <div key={note.id} className="note-item">
            <div className="note-title">{note.title}</div>
            <div 
              className="note-category"
              style={{ backgroundColor: note.categoryColor, color: '#fff' }}
            >
              {note.category}
            </div>
          </div>
        ))}
      </div>
      
      <div className="notes-footer">
        (Showing recent notes)
      </div>
    </WidgetWrapper>
  );
};

export default RecentNotes; 