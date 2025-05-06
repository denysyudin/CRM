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
  type?: 'project' | 'note' | 'task' | 'file';
  fileType?: string;
}

const DirectoryTree: React.FC<DirectoryTreeProps> = ({
  files,
  currentFolder,
  onFolderSelect,
  loading
}): ReactElement => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ root: true });

  const { data: filesData, isLoading: filesLoading } = useGetFilesQuery();
  const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery();
  const { data: notesData, isLoading: notesLoading } = useGetNotesQuery();
  const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery();

  // Get file icon based on file type
  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <InsertDriveFileIcon fontSize="small" />;
    
    const fileTypeLower = fileType.toLowerCase();
    
    if (fileTypeLower.match(/jpe?g|png|gif|bmp|svg/)) {
      return <ImageIcon fontSize="small" color="action" />;
    } else if (fileTypeLower === 'pdf') {
      return <PictureAsPdfIcon fontSize="small" color="error" />;
    } else if (fileTypeLower.match(/js|jsx|ts|tsx|html|css|java|py|c|cpp/)) {
      return <CodeIcon fontSize="small" color="info" />;
    } else if (fileTypeLower.match(/txt|md|rtf/)) {
      return <TextSnippetIcon fontSize="small" color="action" />;
    }
    
    return <InsertDriveFileIcon fontSize="small" color="action" />;
  };

  // Build tree data structure from files data
  useEffect(() => {
    // Create root node - always show root directory
    const root: TreeNode = {
      id: 'root',
      name: 'Root Folder',
      children: []
    };
    
    // Map of all nodes by id for quick access
    const nodesMap: Record<string, TreeNode> = {
      'root': root
    };
    
    // If we have all the required data, build the full tree
    if (filesData && projectsData && notesData && tasksData) {
      // Track created projects to avoid duplicates
      const processedProjects = new Set<string>();
      
      // Process all files and create the directory structure
      filesData.forEach(file => {
        if (file.project_id) {
          const projectId = file.project_id;
          const projectNodeId = `project_${projectId}`;
          
          // Create project node if not already created
          if (!processedProjects.has(projectId)) {
            const project = projectsData.find(p => p.id === projectId);
            const projectNode: TreeNode = {
              id: projectNodeId,
              name: project?.title || 'Unknown Project',
              children: [],
              type: 'project'
            };
            
            nodesMap[projectNodeId] = projectNode;
            root.children.push(projectNode);
            processedProjects.add(projectId);
          }
          
          // Add note as child of project
          if (file.note_id) {
            const noteId = file.note_id;
            const noteNodeId = `note_${noteId}`;
            const note = notesData.find(n => n.id === noteId);
            
            if (note && !nodesMap[noteNodeId]) {
              const noteNode: TreeNode = {
                id: noteNodeId,
                name: note.title || 'Unknown Note',
                children: [],
                type: 'note'
              };
              
              nodesMap[noteNodeId] = noteNode;
              nodesMap[projectNodeId].children.push(noteNode);
            }
          }
          
          // Add task as child of project
          if (file.task_id) {
            const taskId = file.task_id;
            const taskNodeId = `task_${taskId}`;
            const task = tasksData.find(t => t.id === taskId);
            
            if (task && !nodesMap[taskNodeId]) {
              const taskNode: TreeNode = {
                id: taskNodeId,
                name: task.title || 'Unknown Task',
                children: [],
                type: 'task'
              };
              
              nodesMap[taskNodeId] = taskNode;
              nodesMap[projectNodeId].children.push(taskNode);
            }
          }
          
          // Add the actual file as a leaf node
          const fileNodeId = `file_${file.id}`;
          const fileNode: TreeNode = {
            id: fileNodeId,
            name: file.title || 'Unknown File',
            children: [],
            type: 'file',
            fileType: file.type || undefined
          };
          
          const parentNodeId = file.task_id 
            ? `task_${file.task_id}` 
            : file.note_id 
              ? `note_${file.note_id}` 
              : `project_${file.project_id}`;
              
          if (nodesMap[parentNodeId]) {
            nodesMap[parentNodeId].children.push(fileNode);
          }
        }
      });
      
      // Sort children alphabetically, with folders first
      const sortTreeNodes = (nodes: TreeNode[]) => {
        // Sort folders first, then files, both alphabetically
        return nodes.sort((a, b) => {
          const aIsFolder = a.children.length > 0 || a.type === 'project' || a.type === 'note' || a.type === 'task';
          const bIsFolder = b.children.length > 0 || b.type === 'project' || b.type === 'note' || b.type === 'task';
          
          if (aIsFolder && !bIsFolder) return -1;
          if (!aIsFolder && bIsFolder) return 1;
          
          return a.name.localeCompare(b.name);
        });
      };
      
      // Sort all nodes recursively
      const sortAllNodes = (node: TreeNode) => {
        if (node.children.length > 0) {
          node.children = sortTreeNodes(node.children);
          node.children.forEach(sortAllNodes);
        }
      };
      
      sortAllNodes(root);
    }
    
    // Always set tree data with at least the root node
    setTreeData([root]);
    
    // Expand current folder's path
    if (currentFolder !== 'root' && projectsData && notesData && tasksData) {
      // Find which node contains the current folder
      const findNodePath = (nodeId: string): string[] => {
        // For project nodes
        if (nodeId.startsWith('project_')) {
          return ['root', nodeId];
        }
        
        // For note/task nodes
        if (nodeId.startsWith('note_') || nodeId.startsWith('task_')) {
          const noteOrTask = nodeId.startsWith('note_')
            ? notesData.find(n => `note_${n.id}` === nodeId)
            : tasksData.find(t => `task_${t.id}` === nodeId);
            
          if (noteOrTask?.project_id) {
            return ['root', `project_${noteOrTask.project_id}`, nodeId];
          }
        }
        
        return [nodeId];
      };
      
      const pathToExpand = findNodePath(currentFolder);
      const newExpandedNodes = { ...expandedNodes };
      
      pathToExpand.forEach(nodeId => {
        newExpandedNodes[nodeId] = true;
      });
      
      setExpandedNodes(newExpandedNodes);
    }
  }, [filesData, projectsData, notesData, tasksData, currentFolder, expandedNodes]);

  const handleNodeToggle = (nodeId: string) => {
    setExpandedNodes({
      ...expandedNodes,
      [nodeId]: !expandedNodes[nodeId]
    });
  };

  // Recursive component to render tree nodes
  const renderTreeNode = (node: TreeNode, depth: number = 0, isLastChild: boolean = true) => {
    const isExpanded = !!expandedNodes[node.id];
    const isSelected = currentFolder === node.id;
    const hasChildren = node.children.length > 0;
    const isFolder = hasChildren || node.type === 'project' || node.type === 'note' || node.type === 'task';
    
    // Determine which icon to use
    let nodeIcon;
    if (node.type === 'note') {
      nodeIcon = <DescriptionIcon fontSize="small" color={isSelected ? "primary" : "action"} />;
    } else if (node.type === 'task') {
      nodeIcon = <AssignmentIcon fontSize="small" color={isSelected ? "primary" : "action"} />;
    } else if (isFolder) {
      nodeIcon = isExpanded 
        ? <FolderOpenIcon fontSize="small" color="primary" /> 
        : <FolderIcon fontSize="small" color={isSelected ? "primary" : "action"} />;
    } else {
      nodeIcon = getFileIcon(node.fileType);
    }
    
    return (
      <React.Fragment key={node.id}>
        <ListItemButton 
          onClick={() => onFolderSelect(node.id, node.name)}
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
            },
            position: 'relative',
            '&::before': isFolder ? {
              content: '""',
              position: 'absolute',
              left: 1 + (depth * 1.5) + (hasChildren ? 8 : 0),
              top: 0,
              bottom: 0,
              width: 1,
              bgcolor: isLastChild ? 'transparent' : 'rgba(0, 0, 0, 0.12)',
              display: depth > 0 ? 'block' : 'none'
            } : undefined
          }}
        >
          {/* Connecting lines */}
          {depth > 0 && (
            <Box 
              sx={{ 
                position: 'absolute',
                left: 1 + ((depth - 1) * 1.5) + 10,
                width: 10,
                height: 1,
                top: '50%',
                bgcolor: 'rgba(0, 0, 0, 0.12)',
                display: 'block'
              }}
            />
          )}
          
          <ListItemIcon sx={{ minWidth: 28, ml: hasChildren ? 0 : 2 }}>
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
                  mr: 0.5,
                  borderRadius: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
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
              {node.children.map((child, index) => renderTreeNode(
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
        {treeData.map(node => renderTreeNode(node))}
      </List>
    </Box>
  );
};

export default DirectoryTree; 