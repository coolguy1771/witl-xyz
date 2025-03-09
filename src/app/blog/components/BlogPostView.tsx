'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Box, 
  Button,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { PostHeader } from './post/PostHeader';
import { PostBody } from './post/PostBody';
import { PostFooter } from './post/PostFooter';
import { BlogPost } from '@/app/types/blog';

interface BlogPostViewProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
}

export function BlogPostView({ post, relatedPosts = [] }: BlogPostViewProps) {
  const router = useRouter();
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }}
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <Container maxWidth="lg" sx={{ pt: 0, pb: { xs: 4, md: 6 } }}>
        <Box 
          sx={{ 
            mb: 3,
            py: 2,
            backgroundColor: theme.palette.background.default
          }}
        >
          <motion.div
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => router.back()}
              sx={{ 
                color: 'primary.main',
                position: 'relative',
                '&:hover': { 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)' 
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  borderLeft: `2px solid ${theme.palette.primary.main}`,
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  transform: 'rotate(45deg)',
                  left: '6px',
                  top: 'calc(50% - 5px)'
                },
                pl: 4
              }}
            >
              Back to posts
            </Button>
          </motion.div>
        </Box>
        
        <PostHeader post={post} />
        <PostBody post={post} content={post.content} />
        <PostFooter post={post} relatedPosts={relatedPosts} />
      </Container>
    </motion.div>
  );
}