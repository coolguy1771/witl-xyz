'use client';

import { Box, Container, Typography, Button, useTheme, Paper } from '@mui/material';
import Link from 'next/link';
import { FileX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{
        minHeight: 'calc(100vh - 180px)',
        background: theme => theme.palette.mode === 'dark' 
          ? `radial-gradient(circle at 75% 25%, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
          : `radial-gradient(circle at 75% 25%, ${theme.palette.secondary.light}10, ${theme.palette.background.default} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 8
      }}
    >
      {/* Animated book pages floating in background */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box
          component={motion.div}
          key={i}
          initial={{ 
            x: Math.random() * 100 - 50 + '%', 
            y: Math.random() * 100 - 50 + '%',
            rotate: Math.random() * 20 - 10,
            opacity: 0
          }}
          animate={{ 
            x: [
              Math.random() * 100 - 50 + '%', 
              Math.random() * 100 - 50 + '%'
            ],
            y: [
              Math.random() * 100 - 50 + '%', 
              Math.random() * 100 - 50 + '%'
            ],
            rotate: [
              Math.random() * 20 - 10,
              Math.random() * 20 - 10
            ],
            opacity: [0.05, 0.2, 0.05]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 15 + Math.random() * 20,
            ease: "easeInOut"
          }}
          sx={{
            position: 'absolute',
            width: 60 + Math.random() * 40,
            height: 80 + Math.random() * 40,
            borderRadius: '2px',
            background: theme => theme.palette.mode === 'dark'
              ? theme.palette.secondary.dark + '20'
              : theme.palette.secondary.light + '20',
            filter: 'blur(3px)',
            zIndex: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
      ))}
      
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          elevation={4}
          sx={{ 
            textAlign: 'center',
            py: 8,
            px: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            backdropFilter: 'blur(10px)',
            background: theme => theme.palette.mode === 'dark'
              ? 'rgba(18, 18, 18, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }
          }}
      >
        <FileX size={64} color={theme.palette.error.main} strokeWidth={1.5} />
        
        <Typography 
          variant="h2" 
          component="h1"
          sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            mt: 2
          }}
        >
          404
        </Typography>
        
        <Typography 
          variant="h4"
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 1
          }}
        >
          Post Not Found
        </Typography>
        
        <Typography 
          variant="body1"
          sx={{ 
            color: 'text.secondary',
            maxWidth: '500px',
            mb: 2
          }}
        >
          The blog post you're looking for doesn't exist or may have been moved.
          Please check the URL or return to the blog homepage.
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            href="/"
            variant="outlined"
            size="large"
            sx={{ 
              borderRadius: '8px',
              px: 3
            }}
          >
            Go Home
          </Button>
          
          <Button
            component={Link}
            href="/blog"
            variant="contained"
            size="large"
            sx={{
              borderRadius: '8px',
              px: 3
            }}
          >
            Browse Blog
          </Button>
        </Box>
      </Paper>
      </Container>
    </Box>
  );
}