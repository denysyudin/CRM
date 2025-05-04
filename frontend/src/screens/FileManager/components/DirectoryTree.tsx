import React, { useState, useEffect } from 'react';
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
import { File } from '../../../types';

interface DirectoryTreeProps {
  files: File[];
  currentFolder: string;
  onFolderSelect: (folderId: string, folderName: string) => void;
  loading: boolean;
}

interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

const DirectoryTree: React.FC<DirectoryTreeProps> = ({
  files,
  currentFolder,
  onFolderSelect,
  loading
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ root: true });

  // Build tree data structure from flat files list
  useEffect(() => {
    if (files.length > 0) {
      // Get only folders
      const folders = files.filter(file => 
        file.type === 'application/vnd.google-apps.folder'
      );
      
      // Create root node
      const root: TreeNode = {
        id: 'root',
        name: 'My Drive',
        children: []
      };
      
      // Map of all nodes by id for quick access
      const nodesMap: Record<string, TreeNode> = {
        'root': root
      };
      
      // First pass - create all nodes
      folders.forEach(folder => {
        nodesMap[folder.id] = {
          id: folder.id,
          name: folder.title,
          children: []
        };
      });
      
      // Second pass - create parent-child relationships
      folders.forEach(folder => {
        const parentId = folder.parent_id || 'root';
        if (nodesMap[parentId]) {
          nodesMap[parentId].children.push(nodesMap[folder.id]);
        }
      });
      
      // Set tree data
      setTreeData([root]);
      
      // Expand current folder's path
      if (currentFolder !== 'root') {
        const expandPath = (folderId: string): string[] => {
          const path: string[] = [folderId];
          const folder = folders.find(f => f.id === folderId);
          
          if (folder && folder.parent_id && folder.parent_id !== 'root') {
            path.push(...expandPath(folder.parent_id));
          } else if (folder && folder.parent_id === 'root') {
            path.push('root');
          }
          
          return path;
        };
        
        const pathToExpand = expandPath(currentFolder);
        const newExpandedNodes = { ...expandedNodes };
        
        pathToExpand.forEach(nodeId => {
          newExpandedNodes[nodeId] = true;
        });
        
        setExpandedNodes(newExpandedNodes);
      }
    }
  }, [files, currentFolder]);

  const handleNodeToggle = (nodeId: string) => {
    setExpandedNodes({
      ...expandedNodes,
      [nodeId]: !expandedNodes[nodeId]
    });
  };

  // Recursive component to render tree nodes
  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const isSelected = currentFolder === node.id;
    
    return (
      <React.Fragment key={node.id}>
        <ListItemButton 
          onClick={() => onFolderSelect(node.id, node.name)}
          selected={isSelected}
          sx={{ 
            pl: 2 + (depth * 2),
            borderRadius: 1,
            my: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'primary.light',
              '&:hover': { backgroundColor: 'primary.light' }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {node.children.length > 0 ? (
              <Box 
                component="span" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeToggle(node.id);
                }}
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  mr: 1
                }}
              >
                {isExpanded ? 
                  <ExpandMoreIcon fontSize="small" /> : 
                  <ChevronRightIcon fontSize="small" />}
              </Box>
            ) : <Box component="span" sx={{ width: 24 }} />}
            {isExpanded ? 
              <FolderOpenIcon color="primary" /> : 
              <FolderIcon color={isSelected ? "primary" : "action"} />}
          </ListItemIcon>
          <ListItemText 
            primary={node.name} 
            primaryTypographyProps={{ 
              variant: 'body2',
              fontWeight: isSelected ? 'bold' : 'normal'
            }} 
          />
        </ListItemButton>
        
        {node.children.length > 0 && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {node.children.map(child => renderTreeNode(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Folders
        </Typography>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} height={30} sx={{ my: 0.5 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Folders
      </Typography>
      <List 
        component="nav"
        aria-labelledby="nested-list-subheader"
        dense
        sx={{ 
          width: '100%',
          bgcolor: 'background.paper',
          '& .MuiListItemButton-root:hover': {
            bgcolor: 'action.hover',
          }
        }}
      >
        {treeData.map(node => renderTreeNode(node))}
      </List>
    </Box>
  );
};

export default DirectoryTree; 