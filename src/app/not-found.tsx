'use client';

import { Box, Container, Typography, Button, useTheme, Paper } from '@mui/material';
import Link from 'next/link';
import { MapPin, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{
        minHeight: 'calc(100vh - 180px)',
        background: theme => theme.palette.mode === 'dark' 
          ? `radial-gradient(circle at 25% 25%, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
          : `radial-gradient(circle at 25% 25%, ${theme.palette.primary.light}10, ${theme.palette.background.default} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 8
      }}
    >
      {/* Animated background elements */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Box
          component={motion.div}
          key={i}
          initial={{ 
            x: Math.random() * 100 - 50 + '%', 
            y: Math.random() * 100 - 50 + '%',
            opacity: 0
          }}
          animate={{ 
            x: [
              Math.random() * 100 - 50 + '%', 
              Math.random() * 100 - 50 + '%',
              Math.random() * 100 - 50 + '%'
            ],
            y: [
              Math.random() * 100 - 50 + '%', 
              Math.random() * 100 - 50 + '%',
              Math.random() * 100 - 50 + '%'
            ],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 20 + Math.random() * 30,
            ease: "linear"
          }}
          sx={{
            position: 'absolute',
            width: 20 + Math.random() * 100,
            height: 20 + Math.random() * 100,
            borderRadius: '50%',
            background: theme => theme.palette.mode === 'dark'
              ? theme.palette.primary.dark + '15'
              : theme.palette.primary.light + '15',
            filter: 'blur(8px)',
            zIndex: 0
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
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <MapPin size={64} color={theme.palette.error.main} strokeWidth={1.5} />
        </motion.div>
        
        <Typography 
          variant="h1" 
          component="h1"
          sx={{ 
            fontWeight: 800,
            color: 'text.primary',
            mt: 2,
            fontSize: { xs: '3rem', sm: '4rem' }
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
          Page Not Found
        </Typography>
        
        <Typography 
          variant="body1"
          sx={{ 
            color: 'text.secondary',
            maxWidth: '500px',
            mb: 2
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          You might have mistyped the URL or the page may have been relocated.
        </Typography>
        
        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            component={Link}
            href="/"
            variant="outlined"
            size="large"
            startIcon={<Search />}
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