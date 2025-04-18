import React from 'react';
import './styles.css';

interface Note {
  id: number;
  title: string;
  category: string;
  categoryColor: string;
}

const RecentNotes: React.FC = () => {
  const notes: Note[] = [
    {
      id: 1,
      title: 'Design inspiration for new pendants',
      category: 'Product Design',
      categoryColor: '#e3f2fd'
    },
    {
      id: 2,
      title: 'Marketing slogans for Spring Sale',
      category: 'Marketing Ideas',
      categoryColor: '#e8f5e9'
    },
    {
      id: 3,
      title: 'Competitor analysis - Smart Jeweler',
      category: 'Business Strategy',
      categoryColor: '#fff3e0'
    },
    {
      id: 4,
      title: 'Website feedback points',
      category: 'Website',
      categoryColor: '#e8eaf6'
    },
    {
      id: 5,
      title: 'Ideas for Bravo Creations blog',
      category: 'Content Ideas',
      categoryColor: '#f3e5f5'
    }
  ];

  return (
    <div className="notes-container">
      <h2>
        <span className="icon">📝</span>
        Recent Notes
      </h2>
      
      <div className="notes-list">
        {notes.map(note => (
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