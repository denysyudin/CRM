import React from 'react';
import { 
  Box,
  List, 
  ListItem, 
  Typography, 
  Chip, 
  Divider,
  Paper,
  CircularProgress
} from '@mui/material';

import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import { useGetNotesQuery } from '../../redux/api/notesApi';

const RecentNotes: React.FC = () => {
  // Use RTK Query hook to fetch notes
  const { data: notes = [], isLoading, isError } = useGetNotesQuery();
  
  // Process notes to add category and color information
  const processedNotes = React.useMemo(() => {
    return notes.map((note: any) => {
      let categories = [];
      categories.push(note.category);
      console.log(categories);
      const colors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336'];
      
      const randomCategoryIndex = Math.floor(Math.random() * categories.length);
      
      return {
        ...note,
        category: categories[randomCategoryIndex],
        categoryColor: colors[randomCategoryIndex]
      };
    });
  }, [notes]);

  return (
    <Paper elevation={0} sx={{ 
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      <Box>
        <Typography variant="h6" component="h2" display="flex" alignItems="center" gap={2} gutterBottom>
          <FormatListBulletedRoundedIcon color="primary" /> Recent Notes
        </Typography>
        <Divider />

        {isLoading ? (
          <Box display="flex" justifyContent="center" >
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" align="center">Error loading notes</Typography>
        ) : processedNotes.length === 0 ? (
          <Typography align="center">No notes found</Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {processedNotes.slice(0, 5).map((note, index) => (
              <React.Fragment key={note.id}>
                <ListItem
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1.5,
                    px: 0
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      flexGrow: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      mr: 2
                    }}
                  >
                    {note.title}
                  </Typography>
                  <Chip
                    label={note.category}
                    size="small"
                    sx={{
                      backgroundColor: note.categoryColor,
                      color: '#fff',
                      fontWeight: 500
                    }}
                  />
                </ListItem>
                {index < processedNotes.slice(0, 5).length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default RecentNotes;