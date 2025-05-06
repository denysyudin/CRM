import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DirectoryTree from './components/DirectoryTree';
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { useGetFilesQuery, useCreateFileMutation, useDeleteFileMutation } from '../../redux/api/filesApi';
import { File } from '../../types';

const FileManager: React.FC = () => {
  const theme = useTheme();
  const [files, setFiles] = useState<File[]>([]);
  const [allFiles, setAllFiles] = useState<File[]>([]); // Store all files for the tree
  const [loading, setLoading] = useState<boolean>(true);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([{id: 'root', name: 'My Drive'}]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contextMenuFile, setContextMenuFile] = useState<File | null>(null);

  // Use the API query hook
  const { data: filesData, isLoading, isError } = useGetFilesQuery();
  const [deleteFile] = useDeleteFileMutation();
  
  // Load files when component mounts or when the query data changes
  useEffect(() => {
    if (filesData) {
      setAllFiles(filesData);
      
      // Filter files for the current folder
      const filteredFiles = filesData.filter(file => 
        file.parent_id === currentFolder || 
        (currentFolder === 'root' && file.parent_id === 'root')
      );
      setFiles(filteredFiles);
      setLoading(false);
    } else if (isError) {
      setLoading(false);
      // Could add error state handling here
    } else {
      setLoading(isLoading);
    }
  }, [filesData, isLoading, isError, currentFolder]);

  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolder(folderId);
    
    // Update folder path
    if (folderId === 'root') {
      setFolderPath([{id: 'root', name: 'My Drive'}]);
    } else {
      const folderIndex = folderPath.findIndex(folder => folder.id === folderId);
      
      if (folderIndex >= 0) {
        // Navigate back to an existing folder in the path
        setFolderPath(folderPath.slice(0, folderIndex + 1));
      } else {
        // Navigate to a new subfolder
        setFolderPath([...folderPath, {id: folderId, name: folderName}]);
      }
    }
    
    // Filter files for the new current folder
    const filteredFiles = allFiles.filter(file => 
      file.parent_id === folderId || 
      (folderId === 'root' && file.parent_id === 'root')
    );
    setFiles(filteredFiles);
    
    setSelectedFile(null);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
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
    if (file.type === 'application/vnd.google-apps.folder') {
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

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    
    if (uploadedFiles && uploadedFiles.length > 0) {
      // Would handle real upload API call in production
      console.log(`Uploading ${uploadedFiles.length} files to ${currentFolder}`);
      
      // Mock adding the uploaded files
      const newFiles: File[] = Array.from(uploadedFiles).map(file => ({
        id: `file-${Date.now()}-${file.name}`,
        title: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size.toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        parent_id: currentFolder
      }));
      
      // Update both state variables
      setAllFiles([...allFiles, ...newFiles]);
      setFiles([...files, ...newFiles]);
      
      setUploadModalOpen(false);
    }
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
    <div className="app-container">
      <div className="sidebar">
        <Sidebar isOpen={true} toggleSidebar={() => {}} activePath="/files" />
      </div>
      <div className="main-content">
    <Box sx={{ display: 'flex', height: '100vh' }}>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom={false}>
            Google Drive Files
          </Typography>
        </Paper>
        
        {/* Breadcrumb Navigation */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            {folderPath.map((folder, index) => (
              <Typography
                key={folder.id}
                sx={{ 
                  cursor: 'pointer', 
                  color: index === folderPath.length - 1 ? 'text.primary' : 'primary.main',
                  fontWeight: index === folderPath.length - 1 ? 'bold' : 'normal',
                }}
                onClick={() => index < folderPath.length - 1 && navigateToFolder(folder.id, folder.name)}
              >
                {folder.name}
              </Typography>
            ))}
          </Breadcrumbs>
        </Paper>
        
        {/* Files Explorer with Directory Tree */}
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
              onFolderSelect={(folderId, folderName) => navigateToFolder(folderId, folderName)}
              loading={loading}
            />
          </Paper>
          
          {/* Files List */}
          <Paper sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : files.length === 0 ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ p: 2, color: 'text.secondary' }}>
                  {currentFolder === 'root' ? 'My Drive' : folderPath[folderPath.length - 1].name}
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <InsertDriveFileIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No files found</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Upload files to add them to this folder
                  </Typography>
                </Box>
              </Box>
            ) : (
              <List>
                {files.map((file) => (
                  <ListItem
                    key={file.id}
                    disablePadding
                    secondaryAction={
                      <IconButton edge="end" onClick={(e) => handleContextMenu(e, file)}>
                        <MoreVertIcon />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={() => handleFileSelect(file)}
                      selected={selectedFile?.id === file.id}
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.title}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                              {file.type !== 'application/vnd.google-apps.folder' && formatBytes(file.size)}
                            </Typography>
                            <Typography component="span" variant="body2" color="text.secondary">
                              Modified: {formatDate(file.updated_at || '')}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
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
      
      {/* Upload Modal */}
      <Modal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Upload Files
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Select files to upload to the current folder
          </Typography>
          <Button
            variant="contained"
            component="label"
            fullWidth
            startIcon={<CloudUploadIcon />}
          >
            Choose Files
            <input
              type="file"
              multiple
              hidden
              onChange={handleUpload}
            />
          </Button>
          <Button 
            onClick={() => setUploadModalOpen(false)} 
            sx={{ mt: 2 }}
            fullWidth
          >
            Cancel
          </Button>
        </Box>
      </Modal>
    </Box>
    </div>
    </div>
  );
};

export default FileManager;