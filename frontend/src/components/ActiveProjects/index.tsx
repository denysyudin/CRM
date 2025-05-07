import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import { useGetActiveProjectsQuery } from '../../redux/api/projectsApi';

const ActiveProjects: React.FC = () => {
  const theme = useTheme();
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data = [], isLoading, isError } = useGetActiveProjectsQuery(undefined, {
    skip: !shouldFetch
  });

  useEffect(() => {
    if (data.length === 0) {
      setShouldFetch(true);
    }
  }, [data]);

  const projects = data;

  const getStatusColor = (status: string): { color: string; backgroundColor: string } => {
    switch (status) {
      case 'Not Started':
        return { 
          color: theme.palette.primary.main, 
          backgroundColor: theme.palette.primary.light 
        };
      case 'In Progress':
        return { 
          color: theme.palette.warning.main, 
          backgroundColor: theme.palette.warning.light 
        };
      case 'On Hold':
        return { 
          color: theme.palette.success.main, 
          backgroundColor: theme.palette.success.light 
        };
      case 'Completed':
        return { 
          color: theme.palette.info.main, 
          backgroundColor: theme.palette.info.light 
        };
      default:
        return { 
          color: theme.palette.text.primary, 
          backgroundColor: theme.palette.background.paper 
        };
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        borderRadius: 2,
        height: 'auto',
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1
        }}
        gutterBottom
      >
        <FolderIcon color="primary" />
        Active Project Status
      </Typography>
      <Divider />
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {projects.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No active projects to display
          </Typography>
        ) : (
          projects.map((project, index) => (
            <React.Fragment key={project.id}>
              <ListItem 
                sx={{ 
                  py: 1.5, 
                  px: 0,
                  display: 'flex', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <Typography variant="body1" >
                  {project.title}
                </Typography>
                <Chip
                  label={project.status}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    color: getStatusColor(project.status).color,
                    backgroundColor: getStatusColor(project.status).backgroundColor
                  }}
                />
              </ListItem>
              {index < projects.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </List>
    </Paper>
  );
};

export default ActiveProjects;