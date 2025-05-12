import React, { useState, useEffect } from 'react';
import { FileTreeContext } from './components/DirectoryTree';
import DirectoryTree from './components/DirectoryTree';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';

// Icons
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import CreateFolderModal from '../../components/forms/CreateFolderModal';
import FileUploadModal from '../../components/forms/FileUploadModal';

import { useGetFilesQuery, useDeleteFileMutation, useCreateFileMutation } from '../../redux/api/filesApi';
import { useCreateFolderMutation, useGetFoldersQuery } from '../../redux/api/foldersApi';

import { File } from '../../types';
import { Folder } from '../../types/folder.types';
import { useGetProjectsQuery } from '../../redux/api/projectsApi';
import { useGetEmployeesQuery } from '../../redux/api/employeesApi';

const FileManager: React.FC = () => {
  const theme = useTheme();
  const [files, setFiles] = useState<File[]>([]);
  const [allFiles, setAllFiles] = useState<File[]>([]); // Store all files for the tree
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [folderPath, setFolderPath] = useState<{ id: string, name: string }[]>([{ id: 'root', name: 'My Drive' }]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contextMenuFile, setContextMenuFile] = useState<File | null>(null);
  const [treeContext, setTreeContext] = useState<FileTreeContext | null>(null);

  const [createFolderModalOpen, setCreateFolderModalOpen] = useState<boolean>(false);
  const [fileUploadModalOpen, setFileUploadModalOpen] = useState<boolean>(false);
  const [folderCreationLoading, setFolderCreationLoading] = useState<boolean>(false);
  const [fileUploadLoading, setFileUploadLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const { data: projectsData, isLoading: isLoadingProjects, isError: isErrorProjects, refetch: refetchProjects } = useGetProjectsQuery(undefined, {
    refetchOnMountOrArgChange: true // Force refetch when component mounts
  });

  const { data: employeeData } = useGetEmployeesQuery(undefined, {
    refetchOnMountOrArgChange: true // Force refetch when component mounts
  });

  // Use the API query hook with skipCaching option
  const { data: filesData, isLoading, isError, refetch } = useGetFilesQuery(undefined, {
    refetchOnMountOrArgChange: true // Force refetch when component mounts
  });
  const [createFile, { isLoading: isCreatingFile }] = useCreateFileMutation();
  const [createFolder, { isLoading: isCreatingFolder }] = useCreateFolderMutation();

  const { data: foldersData, isLoading: isLoadingFolders, isError: isErrorFolders, refetch: refetchFolders } = useGetFoldersQuery(undefined, {
    refetchOnMountOrArgChange: true // Force refetch when component mounts
  });

  // Force refetch on mount
  useEffect(() => {
    // Force refetch when component mounts
    refetch();
    console.log('foldersData', foldersData);
    console.log('filesData', filesData);
    setFolders(foldersData || []);
  }, [refetch]);

  // Load files when component mounts or when the query data changes
  useEffect(() => {
    if (filesData) {
      let processedFiles = [...filesData];
      processedFiles = processedFiles.map(file => {
        if (!file.project_id) {
          return { ...file, project_id: 'root' };
        }
        return file;
      });
      setAllFiles(processedFiles);
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
    const childrenFiles = allFilesData.filter(file => file.folder_id === folderId);
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
      setFolderPath([{ id: 'root', name: 'My Drive' }]);
    } else {
      // First check if it's already in the path
      const existingIndex = folderPath.findIndex(item => item.id === folderId);

      if (existingIndex >= 0) {
        // If it exists in the path, truncate to that point
        setFolderPath(folderPath.slice(0, existingIndex + 1));
      } else {
        // Otherwise build a new path
        const buildFolderPath = (id: string, name: string): { id: string, name: string }[] => {
          const folder = allFiles.find(f => f.id === id);

          if (!folder || !folder.project_id || folder.project_id === 'root') {
            return [{ id: 'root', name: 'My Drive' }, { id, name }];
          }

          const parent = allFiles.find(f => f.id === folder.project_id);
          if (!parent) {
            return [{ id: 'root', name: 'My Drive' }, { id, name }];
          }

          return [...buildFolderPath(parent.id, parent.title), { id, name }];
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
      return <InsertDriveFileIcon fontSize="large" sx={{ fontSize: '5rem' }} />;
    }

    if (mimeType === 'folder' || mimeType === 'application/vnd.google-apps.folder') {
      return <FolderIcon fontSize="large" color="primary" sx={{ fontSize: '5rem' }} />;
    } else if (mimeType.includes('image')) {
      return <ImageIcon fontSize="large" color="secondary" sx={{ fontSize: '5rem' }} />;
    } else if (mimeType.includes('pdf')) {
      return <PictureAsPdfIcon fontSize="large" sx={{ color: theme.palette.error.main, fontSize: '5rem' }} />;
    } else if (mimeType.includes('video')) {
      return <VideoFileIcon fontSize="large" sx={{ color: theme.palette.warning.main, fontSize: '5rem' }} />;
    } else if (mimeType.includes('audio')) {
      return <AudioFileIcon fontSize="large" sx={{ color: theme.palette.success.main, fontSize: '5rem' }} />;
    } else if (mimeType.includes('document') || mimeType.includes('word')) {
      return <DescriptionIcon fontSize="large" sx={{ color: theme.palette.info.main, fontSize: '5rem' }} />;
    } else {
      return <InsertDriveFileIcon fontSize="large" sx={{ fontSize: '5rem' }} />;
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.file_type === 'folder' || file.file_type === 'application/vnd.google-apps.folder') {
      navigateToFolder(file.id, file.title);
    } else {
      setSelectedFile(file);
      // Open the file in a new window/tab if file_path exists
      if (file.file_path) {
        window.open(file.file_path, '_blank');
      }
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

  // const closeContextMenu = () => {
  //   setAnchorEl(null);
  //   setContextMenuFile(null);
  // };

  // const handleDeleteFile = async () => {
  //   if (contextMenuFile) {
  //     try {
  //       await deleteFile(contextMenuFile);
  //       // Refresh the file list after deletion
  //       refetch();
  //       closeContextMenu();
  //     } catch (error) {
  //       console.error('Error deleting file:', error);
  //     }
  //   }
  // };

  const handleFolderCreated = async (folderName: string) => {
    try {
      setFolderCreationLoading(true);
      console.log('Creating folder:', folderName);
      console.log('Current folder:', currentFolder);

      await createFolder({
        title: folderName,
        parent: currentFolder,
      }).unwrap();
      
      await refetchFolders();
      setNotification({message: `Folder "${folderName}" created successfully`, type: 'success'});
      setCreateFolderModalOpen(false);
    } catch (error) {
      console.error('Error creating folder:', error);
      setNotification({message: `Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error'});
    } finally {
      setFolderCreationLoading(false);
    }
  };

  const handleFileUpload = async (fileData: FormData) => {
    try {
      setFileUploadLoading(true);
      fileData.append('folder_id', currentFolder);
      const response = await createFile(fileData as FormData).unwrap();
      await refetch();
      setNotification({message: `File${fileData.getAll('file').length > 1 ? 's' : ''} uploaded successfully`, type: 'success'});
      setFileUploadModalOpen(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setNotification({message: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error'});
    } finally {
      setFileUploadLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
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
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', mb: 2, pb: 2 }}>
                  <Typography variant="h4" component="h2" gutterBottom={false} sx={{ fontWeight: 'bold', padding: 2 }}>
                    {folderPath[folderPath.length - 1].name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" color="primary" sx={{ marginRight: 1 }} onClick={() => setCreateFolderModalOpen(true)}>
                      Create Folder
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => setFileUploadModalOpen(true)}>
                      Upload File
                    </Button>
                  </Box>
                </Box>
                {files.length === 0 && folders.length === 0 || (files.filter((file) => file.folder_id === currentFolder).length === 0 && folders.filter((folder) => folder.parent === currentFolder).length === 0) ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      This folder is empty
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Upload files or create folders to see them here
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'auto'
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
                      {/* Show folders first */}
                      {folders.filter((folder) => folder.parent === currentFolder).map((folder) => (
                        <Button   
                          key={`folder-${folder.id}`}
                          onClick={() => {
                            const newFolderId = folder.id || '';
                            setCurrentFolder(newFolderId);
                            console.log('Navigating to folder:', newFolderId);
                          }} 
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            width: '10rem',
                            textAlign: 'center',
                          }}
                        >
                          <FolderIcon fontSize="large" color="primary" sx={{ m: 1, fontSize: '5rem' }} />
                          <Typography variant="body2" noWrap sx={{ width: '100%' }}>
                            {folder.title}
                          </Typography>
                        </Button>
                      ))}

                      {/* Show files */}
                      {files.filter((file) => file.folder_id === currentFolder).map((file) => (
                        <Button
                          key={`file-${file.id}`}
                          onClick={() => handleFileSelect(file)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            width: '10rem',
                            textAlign: 'center',
                            position: 'relative',
                            '&:hover': {
                              '& .file-actions': {
                                opacity: 1
                              }
                            }
                          }}
                        >
                          <Box sx={{ m: 1 }}>
                            {getFileIcon(file.file_type)}
                          </Box>
                          <Typography variant="body2" noWrap sx={{ width: '100%', fontWeight: selectedFile?.id === file.id ? 'bold' : 'normal' }}>
                            {file.title.length > 15 ? file.title.slice(0, 15).concat('...') : file.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            {formatBytes(file.file_size)}
                          </Typography>
                          {/* <IconButton
                            className="file-actions"
                            size="small"
                            aria-label="more options"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContextMenu(e, file);
                            }}
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              opacity: 0,
                              transition: 'opacity 0.2s'
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton> */}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {
        createFolderModalOpen && (
          <CreateFolderModal
            open={createFolderModalOpen}
            onClose={() => !folderCreationLoading && setCreateFolderModalOpen(false)}
            onFolderCreated={handleFolderCreated}
            isLoading={folderCreationLoading}
          />
        )}

      {
        fileUploadModalOpen && (
          <FileUploadModal
            open={fileUploadModalOpen}
            onClose={() => !fileUploadLoading && setFileUploadModalOpen(false)}
            onUpload={handleFileUpload}
            projects={projectsData ? projectsData.map(project => ({
              id: project.id || '',
              name: project.title || ''
            })) : []}
            employees={employeeData ? employeeData.map(employee => ({
              id: employee.id || '',
              name: employee.name || ''
            })) : []}
            isLoading={fileUploadLoading}
          />
        )
      }

      <Snackbar 
        open={notification !== null} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {notification ? (
          <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};

export default FileManager;