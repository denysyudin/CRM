import React, { useState, useEffect } from 'react';
import { FileTreeContext } from './components/DirectoryTree';
import DirectoryTree from './components/DirectoryTree';
import {
  Box,
  Breadcrumbs,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Typography,
  useTheme
} from '@mui/material';

// Icons
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
    import MoreVertIcon from '@mui/icons-material/MoreVert';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { useGetFilesQuery, useDeleteFileMutation } from '../../redux/api/filesApi';
import { File } from '../../types';

const FileManager: React.FC = () => {
  const theme = useTheme();
  const [files, setFiles] = useState<File[]>([]);
  const [allFiles, setAllFiles] = useState<File[]>([]); // Store all files for the tree
  const [loading, setLoading] = useState<boolean>(true);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([{id: 'root', name: 'My Drive'}]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contextMenuFile, setContextMenuFile] = useState<File | null>(null);
  const [treeContext, setTreeContext] = useState<FileTreeContext | null>(null);

  // Use the API query hook
  const { data: filesData, isLoading, isError } = useGetFilesQuery();
  const [deleteFile] = useDeleteFileMutation();
  // const [createFile] = useCreateFileMutation();
  
  // Load files when component mounts or when the query data changes
  useEffect(() => {
    if (filesData) {
      // Process the files data
      let processedFiles = [...filesData];

      // Organize files in the proper directory structure
      processedFiles = processedFiles.map(file => {
        // If file has no parent_id, set it to 'root'
        if (!file.project_id) {
          return { ...file, project_id: 'root' };
        }
        return file;
      });
      // Make sure project directories exist
      const projectFolders = new Set<string>();
      
      // Collect all unique project IDs
      setAllFiles(processedFiles);
      
      // Show files for the current folder
      updateFilesForCurrentFolder(processedFiles, currentFolder);
      setLoading(false);
    } else if (isError) {
      setLoading(false);
    } else {
      setLoading(isLoading);
    }
  }, [filesData, isLoading, isError, currentFolder]);

  // Update displayed files when the current folder changes
  const updateFilesForCurrentFolder = (allFilesData: File[], folderId: string) => {
    // Filter files to show only direct children of the current folder
    const childrenFiles = allFilesData.filter(file => file.project_id === folderId);
    setFiles(childrenFiles);
  };

  const navigateToFolder = (folderId: string, folderName: string, context?: FileTreeContext) => {
    setCurrentFolder(folderId);
    
    // If we receive context from the tree, update it
    if (context) {
      setTreeContext(context);
    }
    
    // Update folder path - find the path to the selected folder
    if (folderId === 'root') {
      setFolderPath([{id: 'root', name: 'My Drive'}]);
    } else {
      // First check if it's already in the path
      const existingIndex = folderPath.findIndex(item => item.id === folderId);
      
      if (existingIndex >= 0) {
        // If it exists in the path, truncate to that point
        setFolderPath(folderPath.slice(0, existingIndex + 1));
      } else {
        // Otherwise build a new path
        const buildFolderPath = (id: string, name: string): {id: string, name: string}[] => {
          const folder = allFiles.find(f => f.id === id);
          
          if (!folder || !folder.project_id || folder.project_id === 'root') {
            return [{id: 'root', name: 'My Drive'}, {id, name}];
          }
          
          const parent = allFiles.find(f => f.id === folder.project_id);
          if (!parent) {
            return [{id: 'root', name: 'My Drive'}, {id, name}];
          }
          
          return [...buildFolderPath(parent.id, parent.title), {id, name}];
        };
        
        setFolderPath(buildFolderPath(folderId, folderName));
      }
    }
    
    // Update files list to show children of the selected folder
    if (allFiles && allFiles.length > 0) {
      updateFilesForCurrentFolder(allFiles, folderId);
    }
    
    setSelectedFile(null);
  };

  const getFileIcon = (mimeType: string | null | undefined) => {
    if (!mimeType) {
      return <InsertDriveFileIcon fontSize="large" />;
    }
    
    if (mimeType === 'folder' || mimeType === 'application/vnd.google-apps.folder') {
      return <FolderIcon fontSize="large" color="primary" />;
    } else if (mimeType.includes('image')) {
      return <ImageIcon fontSize="large" color="secondary" />;
    } else if (mimeType.includes('pdf')) {
      return <PictureAsPdfIcon fontSize="large" sx={{ color: theme.palette.error.main }} />;
    } else if (mimeType.includes('video')) {
      return <VideoFileIcon fontSize="large" sx={{ color: theme.palette.warning.main }} />;
    } else if (mimeType.includes('audio')) {
      return <AudioFileIcon fontSize="large" sx={{ color: theme.palette.success.main }} />;
    } else if (mimeType.includes('document') || mimeType.includes('word')) {
      return <DescriptionIcon fontSize="large" sx={{ color: theme.palette.info.main }} />;
    } else {
      return <InsertDriveFileIcon fontSize="large" />;
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.file_type === 'folder' || file.file_type === 'application/vnd.google-apps.folder') {
      navigateToFolder(file.id, file.title);
    } else {
      setSelectedFile(file);
    }
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLElement>, file: File) => {
    event.preventDefault();
    setContextMenuFile(file);
    setAnchorEl(event.currentTarget);
  };

  const formatBytes = (bytes: string | undefined) => {
    if (!bytes) return 'Unknown size';
    const sizeInBytes = parseInt(bytes);
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    else if (sizeInBytes < 1048576) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    else if (sizeInBytes < 1073741824) return `${(sizeInBytes / 1048576).toFixed(2)} MB`;
    else return `${(sizeInBytes / 1073741824).toFixed(2)} GB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const closeContextMenu = () => {
    setAnchorEl(null);
    setContextMenuFile(null);
  };

  const handleDeleteFile = async () => {
    if (contextMenuFile) {
      try {
        await deleteFile(contextMenuFile);
        closeContextMenu();
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom={false}>
            File Explorer
          </Typography>
        </Paper>
        
        <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, overflow: 'hidden' }}>
          {/* Directory Tree Sidebar */}
          <Paper sx={{ 
            width: 250, 
            overflow: 'auto',
            display: { xs: 'none', sm: 'block' },
            borderRadius: 1,
          }}>
            <DirectoryTree 
              files={allFiles}
              currentFolder={currentFolder}
              onFolderSelect={(folderId, folderName, context) => navigateToFolder(folderId, folderName, context)}
              loading={loading || isLoading}
            />
          </Paper>
          
          {/* Files List */}
          <Paper sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : (
              <>
                {files.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      This folder is empty
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Upload files or create folders to see them here
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {files.map((file) => (
                      <ListItem 
                        key={file.id}
                        disablePadding
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            aria-label="more options"
                            onClick={(e) => handleContextMenu(e, file)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        }
                        sx={{ 
                          mb: 1,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <ListItemButton 
                          onClick={() => handleFileSelect(file)}
                          selected={selectedFile?.id === file.id}
                          sx={{ 
                            borderRadius: 1,
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            }
                          }}
                        >
                          <ListItemIcon>
                            {getFileIcon(file.file_type)}
                          </ListItemIcon>
                          <ListItemText 
                            primary={file.title} 
                            secondary={
                              <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary" component="span">
                                  {formatBytes(file.file_size)}
                                </Typography>
                                {file.created_at && (
                                  <Typography variant="body2" color="text.secondary" component="span">
                                      {formatDate(file.created_at)}
                                    </Typography>
                                  )}
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            )}
          </Paper>
        </Box>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={closeContextMenu}
        >
          <MenuItem onClick={handleDeleteFile}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default FileManager;