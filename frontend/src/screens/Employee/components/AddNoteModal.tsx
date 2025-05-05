import React, { useState } from 'react';
import { NoteModal, NoteData } from '../../../components';
import { Employee } from '../../../types/employee.types';

interface AddNoteModalProps {
  employee: Employee | null;
  onSave: (noteData: any) => void;
  onClose: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ employee, onSave, onClose }) => {
  // Default initial data for the note
  const initialNoteData: NoteData = {
    title: '',
    description: '',
    project_id: '',
    files: []
  };

  // Projects list will vary depending on your application
  // This is a placeholder - integrate with your projects source
  const projects = [
    { id: 'project-1', title: 'Website Redesign' },
    { id: 'project-2', title: 'Mobile App' },
    { id: 'project-3', title: 'CRM System' }
  ];

  // Wrapper function to adapt to the expected interface
  const handleSaveNote = async (noteData: NoteData) => {
    onSave({
      title: noteData.title,
      body: noteData.description, // Map description to body
      category: 'General',
      project: noteData.project_id,
      employeeId: employee?.id,
      date: new Date().toISOString()
    });
  };

  return (
    <NoteModal
      open={true}
      onClose={onClose}
      onSave={handleSaveNote}
      editMode={false}
      initialData={initialNoteData}
      projects={projects}
    />
  );
};

export default AddNoteModal; 