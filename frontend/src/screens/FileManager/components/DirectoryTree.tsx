import React, { useState, useMemo, useEffect, ReactElement } from 'react';
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
  type?: 'project' | 'file';
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
  // files,
  currentFolder,
  onFolderSelect,
  loading
}): ReactElement => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ root: true });
  const [currentNode, setCurrentNode] = useState<FileNode | null>(null);
  const [treeContext, setTreeContext] = useState<FileTreeContext>({
    parent: null,
    current: null,
    children: []
  });

  const { data: filesData, isLoading: filesLoading } = useGetFilesQuery();
  const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery();

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

  // Build the tree using useMemo - only depend on API data, not component state
  const { treeData, nodeMap } = useMemo(() => {
    // Initialize data structure
    const root: FileNode = {
      id: 'root',
      name: 'Root',
      children: [],
      type: 'project'
    };

    // Map to store all nodes by ID for quick reference
    const nodeMap: Record<string, FileNode> = {
      'root': root
    };

    // If data isn't loaded yet, return empty structure
    if (!filesData || !projectsData) {
      console.log('Data not loaded yet, returning empty structure');
      return { treeData: root, nodeMap };
    }

    console.log('Building tree with projects:', projectsData.length, 'files:', filesData.length);

    // First, add all projects as top-level directories under root
    projectsData.forEach(project => {
      const projectNode: FileNode = {
        id: project.id,
        name: project.title,
        children: [],
        parent: 'root',
        type: 'project'
      };
      
      nodeMap[project.id] = projectNode;
      root.children.push(projectNode);
    });

    // Then, add all files
    filesData.forEach(file => {
      const node: FileNode = {
        id: file.id,
        name: file.title,
        children: [],
        parent: file.project_id || 'root',
        type: file.file_type === 'application/vnd.google-apps.folder' ? 'project' : 'file',
        fileType: file.file_type
      };

      nodeMap[file.id] = node;
    });

    // Sort all nodes
    const sortNodes = (node: FileNode) => {
      // Sort by type first (project > folder > file), then alphabetically
      node.children.sort((a, b) => {
        // Define type priority
        const typePriority = {
          'project': 1,
          'file': 2
        };
        
        const aTypePriority = a.type ? typePriority[a.type] || 99 : 99;
        const bTypePriority = b.type ? typePriority[b.type] || 99 : 99;
        
        // Compare type priorities
        if (aTypePriority !== bTypePriority) {
          return aTypePriority - bTypePriority;
        }
        
        // If same type, sort alphabetically
        return a.name.localeCompare(b.name);
      });
      
      // Recursively sort children
      node.children.forEach(sortNodes);
    };
    
    sortNodes(root);

    return { treeData: root, nodeMap };
  }, [projectsData, filesData]);  // Only depend on the API data

  // Handle node toggling (expand/collapse)
  const handleNodeToggle = (nodeId: string) => {
    setExpandedNodes({
      ...expandedNodes,
      [nodeId]: !expandedNodes[nodeId]
    });
  };

  // Find node by ID
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

  // Find parent node
  const findParentNode = (node: FileNode | null): FileNode | null => {
    if (!node || !node.parent || !nodeMap?.[node.parent]) return null;
    return nodeMap[node.parent];
  };

  // Handle initial expansion and selection based on currentFolder
  useEffect(() => {
    if (!treeData || !currentFolder || !nodeMap) return;
    
    // Find the current node
    const current = findNodeById(currentFolder, treeData);
    if (!current) return;
    
    // Set the currentNode
    setCurrentNode(current);
    
    // Expand the path to the current node
    let parentPath = [];
    let parent = current.parent;
    
    while (parent) {
      parentPath.push(parent);
      parent = nodeMap[parent]?.parent;
    }
    
    if (parentPath.length > 0) {
      // Use functional update to avoid closure issues
      setExpandedNodes(prev => {
        const newExpandedNodes = { ...prev };
        parentPath.forEach(p => {
          newExpandedNodes[p] = true;
        });
        return newExpandedNodes;
      });
    }
    
    // Set the tree context
    const parentNode = findParentNode(current);
    setTreeContext({
      parent: parentNode,
      current,
      children: current.children
    });
  }, [treeData, currentFolder, nodeMap]);

  // Handle node selection
  const handleNodeSelect = (node: FileNode) => {
    setCurrentNode(node);
    
    // Find the parent and children for the selected node
    const parent = findParentNode(node);
    const children = node.children;
    
    const newContext = {
      parent,
      current: node,
      children
    };
    
    setTreeContext(newContext);
    
    // Pass the context to the parent component
    onFolderSelect(node.id, node.name, newContext);
    
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
    if (node.type === 'project') {
      nodeIcon = isExpanded 
        ? <FolderOpenIcon fontSize="small" color="primary" /> 
        : <FolderIcon fontSize="small" color={isSelected ? "primary" : "action"} />;
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
            {node.type == 'project' && (
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

  const isLoading = loading || filesLoading || projectsLoading;

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

  if (!treeData || !nodeMap) {
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