import React, { useState, useEffect, ReactElement } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { File } from '../../../types';

import { useGetFilesQuery } from '../../../redux/api/filesApi';
import { useGetProjectsQuery } from '../../../redux/api/projectsApi';
import { useGetNotesQuery } from '../../../redux/api/notesApi';
import { useGetTasksQuery } from '../../../redux/api/tasksApi';

// File type icons
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CodeIcon from '@mui/icons-material/Code';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

export interface FileNode {
  id: string;
  name: string;
  children: FileNode[];
  parent?: string;
  type?: 'project' | 'note' | 'task' | 'file' | 'folder';
  fileType?: string;
}

// Current node with parent and children info for the column display
export interface FileTreeContext {
  parent: FileNode | null;
  current: FileNode | null;
  children: FileNode[];
}

interface DirectoryTreeProps {
  files: File[];
  currentFolder: string;
  onFolderSelect: (folderId: string, folderName: string, context?: FileTreeContext) => void;
  loading: boolean;
}

const DirectoryTree: React.FC<DirectoryTreeProps> = ({
  files,
  currentFolder,
  onFolderSelect,
  loading
}): ReactElement => {
  const [treeData, setTreeData] = useState<FileNode>(); // Root node
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ root: true });
  const [currentNode, setCurrentNode] = useState<FileNode | null>(null);
  const [treeContext, setTreeContext] = useState<FileTreeContext>({
    parent: null,
    current: null,
    children: []
  });

  const { data: filesData, isLoading: filesLoading } = useGetFilesQuery();
  const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery();
  const { data: notesData, isLoading: notesLoading } = useGetNotesQuery();
  const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery();

  // Get file icon based on file type
  const getFileIcon = (fileType: string | undefined, isSelected: boolean = false) => {
    if (!fileType) return <InsertDriveFileIcon fontSize="small" color={isSelected ? "primary" : "action"} />;
    
    const fileTypeLower = fileType.toLowerCase();
    
    if (fileTypeLower.match(/jpe?g|png|gif|bmp|svg/)) {
      return <ImageIcon fontSize="small" color={isSelected ? "primary" : "action"} />;
    } else if (fileTypeLower === 'pdf') {
      return <PictureAsPdfIcon fontSize="small" color={isSelected ? "primary" : "error"} />;
    } else if (fileTypeLower.match(/js|jsx|ts|tsx|html|css|java|py|c|cpp/)) {
      return <CodeIcon fontSize="small" color={isSelected ? "primary" : "info"} />;
    } else if (fileTypeLower.match(/txt|md|rtf/)) {
      return <TextSnippetIcon fontSize="small" color={isSelected ? "primary" : "action"} />;
    }
    
    return <InsertDriveFileIcon fontSize="small" color={isSelected ? "primary" : "action"} />;
  };

  // Recursively build file tree structure
  useEffect(() => {
    if (!filesData) return;

    // Initialize the root node
    const root: FileNode = {
      id: 'root',
      name: 'Root',
      children: [],
      type: 'folder'
    };

    // Map to store all nodes by ID for quick reference
    const nodeMap: Record<string, FileNode> = {
      'root': root
    };

    // First pass - create all nodes
    filesData.forEach(file => {
      
      const node: FileNode = {
        id: file.id,
        name: file.title,
        children: [],
        parent: file.project_id || 'root',
        type: file.file_type === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        fileType: file.file_type
      };

      nodeMap[file.id] = node;
    });

    // Second pass - build the tree structure
    filesData.forEach(file => {
      const node = nodeMap[file.id];
      const parentId = file.project_id || 'root';
      
      if (nodeMap[parentId]) {
        nodeMap[parentId].children.push(node);
      } else {
        // If parent doesn't exist, add to root
        root.children.push(node);
      }
    });

    // Sort all nodes
    const sortNodes = (node: FileNode) => {
      // Sort folders first, then files alphabetically
      node.children.sort((a, b) => {
        const aIsFolder = a.type === 'folder';
        const bIsFolder = b.type === 'folder';
        
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        
        return a.name.localeCompare(b.name);
      });
      
      // Recursively sort children
      node.children.forEach(sortNodes);
    };
    
    sortNodes(root);
    setTreeData(root);

    // Find the current node and its context (parent and children)
    const findNodeById = (nodeId: string, node: FileNode): FileNode | null => {
      if (node.id === nodeId) {
        return node;
      }
      
      for (const child of node.children) {
        const found = findNodeById(nodeId, child);
        if (found) return found;
      }
      
      return null;
    };

    // Find the parent node of a given node
    const findParentNode = (node: FileNode | null): FileNode | null => {
      if (!node || !node.parent) return null;
      return nodeMap[node.parent] || null;
    };

    // Update the tree context with current, parent and children info
    const updateTreeContext = (nodeId: string) => {
      const current = findNodeById(nodeId, root);
      const parent = current ? findParentNode(current) : null;
      const children = current ? current.children : [];
      
      setTreeContext({
        parent,
        current,
        children
      });
      
      setCurrentNode(current);
    };

    // If currentFolder is set, find and set the current node
    if (currentFolder) {
      updateTreeContext(currentFolder);
      
      // Ensure the path to the current node is expanded
      const node = findNodeById(currentFolder, root);
      if (node) {
        let parent = node.parent;
        const newExpandedNodes = { ...expandedNodes };
        
        while (parent) {
          newExpandedNodes[parent] = true;
          parent = nodeMap[parent]?.parent;
        }
        
        setExpandedNodes(newExpandedNodes);
      }
    }
  }, [filesData, currentFolder]);

  const handleNodeToggle = (nodeId: string) => {
    setExpandedNodes({
      ...expandedNodes,
      [nodeId]: !expandedNodes[nodeId]
    });
  };

  // Handle node selection
  const handleNodeSelect = (node: FileNode) => {
    setCurrentNode(node);
    
    // Find the parent and children for the selected node
    if (treeData) {
      const findParentById = (parentId: string, tree: FileNode): FileNode | null => {
        if (tree.id === parentId) return tree;
        
        for (const child of tree.children) {
          const found = findParentById(parentId, child);
          if (found) return found;
        }
        
        return null;
      };
      
      const parent = node.parent ? findParentById(node.parent, treeData) : null;
      
      const newContext = {
        parent,
        current: node,
        children: node.children
      };
      
      setTreeContext(newContext);
      
      // Pass the context to the parent component
      onFolderSelect(node.id, node.name, newContext);
    } else {
      onFolderSelect(node.id, node.name);
    }
    
    // Auto-expand folder when clicked
    if (node.children.length > 0 && !expandedNodes[node.id]) {
      handleNodeToggle(node.id);
    }
  };

  // Render a single node in the tree
  const renderNode = (node: FileNode, depth: number = 0, isLastChild: boolean = true) => {
    const isExpanded = !!expandedNodes[node.id];
    const isSelected = currentFolder === node.id;
    const hasChildren = node.children.length > 0;
    
    // Select the appropriate icon
    let nodeIcon;
    if (node.type === 'folder') {
      nodeIcon = isExpanded 
        ? <FolderOpenIcon fontSize="small" color="primary" /> 
        : <FolderIcon fontSize="small" color={isSelected ? "primary" : "action"} />;
    } else if (node.type === 'note') {
      nodeIcon = <DescriptionIcon fontSize="small" color={isSelected ? "primary" : "action"} />;
    } else if (node.type === 'task') {
      nodeIcon = <AssignmentIcon fontSize="small" color={isSelected ? "primary" : "action"} />;
    } else {
      nodeIcon = getFileIcon(node.fileType, isSelected);
    }
    
    return (
      <React.Fragment key={node.id}>
        <ListItemButton 
          onClick={() => handleNodeSelect(node)}
          selected={isSelected}
          sx={{ 
            pl: 1 + (depth * 1.5),
            py: 0.5,
            borderRadius: 0,
            my: 0,
            '&.Mui-selected': {
              backgroundColor: 'rgba(25, 118, 210, 0.12)',
              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.18)' }
            },
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 30 }}>
            {hasChildren && (
              <Box 
                component="span" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeToggle(node.id);
                }}
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'text.secondary',
                  width: 20,
                  height: 20,
                  mr: 0.5
                }}
              >
                {isExpanded ? 
                  <ExpandMoreIcon fontSize="small" sx={{ fontSize: 18 }} /> : 
                  <ChevronRightIcon fontSize="small" sx={{ fontSize: 18 }} />}
              </Box>
            )}
            {nodeIcon}
          </ListItemIcon>
          <ListItemText 
            primary={node.name} 
            primaryTypographyProps={{ 
              variant: 'body2',
              fontWeight: isSelected ? 'medium' : 'normal',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }} 
          />
        </ListItemButton>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ m: 0, p: 0 }}>
              {node.children.map((child, index) => renderNode(
                child, 
                depth + 1, 
                index === node.children.length - 1
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const isLoading = loading || filesLoading || projectsLoading || notesLoading || tasksLoading;

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', mb: 1 }}>
          Folders
        </Typography>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} height={30} sx={{ my: 0.5 }} />
        ))}
      </Box>
    );
  }

  if (!treeData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2">No files found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 1, py: 1 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', px: 1, mb: 1 }}>
        Explorer
      </Typography>
      <List 
        component="nav"
        aria-labelledby="nested-list-subheader"
        dense
        sx={{ 
          width: '100%',
          bgcolor: 'background.paper',
          p: 0,
          borderRadius: 1,
          '& .MuiListItemButton-root': {
            transition: 'all 0.1s',
          },
          '& .MuiListItemIcon-root': {
            minWidth: 30
          }
        }}
      >
        {renderNode(treeData, 0, true)}
      </List>
    </Box>
  );
};

export default DirectoryTree; 