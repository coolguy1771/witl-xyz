'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Typography, 
  Box, 
  Chip, 
  Divider, 
  useTheme,
  alpha
} from '@mui/material';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { Post } from '@/app/types/blog';

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  const theme = useTheme();
  
  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerVariants}
    >
      {posts.length > 0 ? (
        posts.map((post) => (
          <motion.div key={post.slug} variants={itemVariants}>
            <Box sx={{ mb: 5, pb: 5, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 2,
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  {post.title}
                </Typography>
              </Link>
              
              <Box
                sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  alignItems: 'center',
                  mb: 2,
                  flexWrap: 'wrap'
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5, 
                    color: theme.palette.text.secondary
                  }}
                >
                  <CalendarIcon size={16} />
                  <Typography variant="body2">
                    {format(new Date(post.date), 'MMMM d, yyyy')}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5, 
                    color: theme.palette.text.secondary
                  }}
                >
                  <ClockIcon size={16} />
                  <Typography variant="body2">{post.readingTime}</Typography>
                </Box>
              </Box>
              
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 3,
                  lineHeight: 1.6
                }}
              >
                {post.excerpt}
              </Typography>
              
              {post.tags && post.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {post.tags.map(tag => (
                    <Chip 
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.2)
                        }
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </motion.div>
        ))
      ) : (
        <Box 
          sx={{ 
            width: '100%', 
            textAlign: 'center', 
            py: 8,
            px: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.4),
            borderRadius: 2,
            border: `1px dashed ${theme.palette.divider}`,
            color: theme.palette.text.secondary
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 500 }}>No posts found matching your criteria.</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Try selecting different tags or view all posts.</Typography>
        </Box>
      )}
    </motion.div>
  );
}