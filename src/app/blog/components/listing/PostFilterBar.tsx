'use client';

import React from 'react';
import { 
  Box, 
  Chip, 
  Typography, 
  IconButton, 
  useTheme,
  Skeleton
} from '@mui/material';
import { useBlogTags } from '../../hooks';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';

interface PostFilterBarProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  currentView: 'grid' | 'list';
}

export function PostFilterBar({ 
  selectedTags, 
  onTagToggle, 
  onViewChange, 
  currentView 
}: PostFilterBarProps) {
  const theme = useTheme();
  const { tags, isLoading } = useBlogTags();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' }, 
        mb: 4,
        pb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ mb: { xs: 2, md: 0 } }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 1, 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          Filter by tags:
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={80} height={32} />
            ))
          ) : (
            <>
              <Chip
                label="All Posts"
                onClick={() => selectedTags.forEach(tag => onTagToggle(tag))}
                color={selectedTags.length === 0 ? "primary" : "default"}
                sx={{
                  backgroundColor: selectedTags.length === 0 
                    ? theme.palette.primary.main
                    : theme.palette.action.selected,
                  color: selectedTags.length === 0
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: selectedTags.length === 0
                      ? theme.palette.primary.dark
                      : theme.palette.action.hover
                  }
                }}
              />
              
              {tags.map(tag => (
                <Chip 
                  key={tag}
                  label={tag}
                  onClick={() => onTagToggle(tag)}
                  color={selectedTags.includes(tag) ? "primary" : "default"}
                  sx={{
                    backgroundColor: selectedTags.includes(tag) 
                      ? theme.palette.primary.main
                      : theme.palette.action.selected,
                    color: selectedTags.includes(tag)
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: selectedTags.includes(tag)
                        ? theme.palette.primary.dark
                        : theme.palette.action.hover
                    }
                  }}
                />
              ))}
            </>
          )}
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton 
          onClick={() => onViewChange('grid')}
          color={currentView === 'grid' ? 'primary' : 'default'}
          sx={{ 
            color: currentView === 'grid'
              ? theme.palette.primary.main
              : theme.palette.text.secondary
          }}
        >
          <GridViewIcon />
        </IconButton>
        
        <IconButton 
          onClick={() => onViewChange('list')}
          color={currentView === 'list' ? 'primary' : 'default'}
          sx={{ 
            color: currentView === 'list'
              ? theme.palette.primary.main
              : theme.palette.text.secondary
          }}
        >
          <ViewListIcon />
        </IconButton>
      </Box>
    </Box>
  );
}