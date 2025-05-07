import React from 'react';
import { NoteModal } from '../../../components';
import { Employee } from '../../../types/employee.types';
import { Note } from '../../../types/note.types';
interface AddNoteModalProps {
  employee: Employee | null;
  onSave: (noteData: Note) => void;
  onClose: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ employee, onSave, onClose }) => {
  // Default initial data for the note
  const initialNoteData: Note = {
    id: '',
    title: '',
    description: '',
    project_id: '',
    file: [],
    employee_id: '',
    created_at: ''
  };

  // Projects list will vary depending on your application
  // This is a placeholder - integrate with your projects source
  const projects = [
    { id: 'project-1', title: 'Website Redesign' },
    { id: 'project-2', title: 'Mobile App' },
    { id: 'project-3', title: 'CRM System' }
  ];

  // Wrapper function to adapt to the expected interface
  const handleSaveNote = async (noteData: Note) => {
    onSave(noteData);
  };

  return (
    <NoteModal
      open={true}
      onClose={onClose}
      onSave={handleSaveNote}
      editMode={false}
      initialData={initialNoteData}
      projects={projects as any}
    />
  );
};

export default AddNoteModal; 
