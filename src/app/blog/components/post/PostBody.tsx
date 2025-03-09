'use client';

import React, { useEffect } from 'react';
import { Box, Grid2, Typography, useTheme } from '@mui/material';
import { TableOfContents } from '../shared/TableOfContents';
import { Post } from '@/app/types/blog';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

interface PostBodyProps {
  post: Post;
  content: string;
}

export function PostBody({ post, content }: PostBodyProps) {
  const theme = useTheme();
  // Initialize highlight.js to automatically highlight code blocks in the rendered content
  useEffect(() => {
    // Register languages we want to support
    hljs.configure({
      languages: ['javascript', 'typescript', 'json', 'html', 'css', 'jsx', 'tsx', 'java', 'python', 'bash', 'shell', 'xml', 'yaml', 'sh']
    });
    
    // Find all code blocks in the rendered content and highlight them
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
      
      // Fix the language display in the parent pre element
      const pre = block.parentElement;
      if (pre) {
        if (pre.className && pre.className.includes('language-')) {
          // If the pre has a language-* class, extract the language name
          const match = pre.className.match(/language-(\w+)/);
          if (match && match[1]) {
            pre.setAttribute('data-language', match[1]);
          }
        } else if (block.className) {
          // If only the code element has a language-* class, apply it to the pre
          const match = block.className.match(/language-(\w+)/);
          if (match && match[1]) {
            pre.setAttribute('data-language', match[1]);
          }
        }
      }
      
      // Add copy button to each code block
      if (pre && !pre.querySelector('.code-copy-button')) {
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-button';
        copyButton.setAttribute('aria-label', 'Copy code');
        copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        
        // Style the button with inline styles
        copyButton.style.position = 'absolute';
        copyButton.style.right = '12px';
        copyButton.style.top = '12px';
        copyButton.style.padding = '6px';
        copyButton.style.background = 'rgba(0, 0, 0, 0.3)';
        copyButton.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        copyButton.style.borderRadius = '4px';
        copyButton.style.cursor = 'pointer';
        copyButton.style.color = 'white';
        copyButton.style.opacity = '0';
        copyButton.style.transition = 'all 0.2s ease';
        copyButton.style.zIndex = '10';
        
        // Add click handler
        copyButton.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(block.textContent || '');
            
            // Change the button appearance
            copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            copyButton.style.backgroundColor = theme.palette.success.dark;
            
            // Add a "Copied!" tooltip
            const tooltip = document.createElement('div');
            tooltip.textContent = 'Copied!';
            tooltip.style.position = 'absolute';
            tooltip.style.right = '14px';
            tooltip.style.top = '0px';
            tooltip.style.backgroundColor = theme.palette.success.dark;
            tooltip.style.color = '#fff';
            tooltip.style.padding = '6px 10px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '12px';
            tooltip.style.fontWeight = 'bold';
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(0) scale(0.8)';
            tooltip.style.transition = 'all 0.2s ease';
            
            pre.appendChild(tooltip);
            
            // Animate the tooltip
            setTimeout(() => {
              tooltip.style.opacity = '1';
              tooltip.style.transform = 'translateY(-30px) scale(1)';
            }, 50);
            
            // Reset after 2 seconds
            setTimeout(() => {
              tooltip.style.opacity = '0';
              tooltip.style.transform = 'translateY(-20px) scale(0.8)';
              
              setTimeout(() => {
                tooltip.remove();
                copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
                copyButton.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
              }, 300);
            }, 2000);
          } catch (err) {
            console.error('Failed to copy text:', err);
          }
        });
        
        // Add hover effect for parent
        pre.addEventListener('mouseenter', () => {
          copyButton.style.opacity = '1';
        });
        
        pre.addEventListener('mouseleave', () => {
          copyButton.style.opacity = '0';
        });
        
        // Add button to pre element
        pre.appendChild(copyButton);
        pre.style.position = 'relative';
      }
    });
  }, [content]); // Re-run when content changes
  
  return (
    <Grid2 container spacing={4}>
      {/* Main Content */}
      <Grid2 size={{xs: 12, lg: 8}}>
        <Box 
          sx={theme => ({ 
            typography: 'body1',
            color: theme.palette.text.secondary,
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              color: theme.palette.text.primary,
              fontWeight: 600,
              mt: 4,
              mb: 2,
              scrollMarginTop: '104px', // For anchor navigation with taller fixed navbar
              position: 'relative',
              '&::before': {
                content: '""',
                display: 'block',
                height: '104px', // Offset for taller fixed header
                marginTop: '-104px',
                visibility: 'hidden',
                pointerEvents: 'none'
              }
            },
            '& a': {
              color: theme.palette.primary.main,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
                color: theme.palette.primary.light
              }
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              display: 'block',
              margin: '2rem auto',
              boxShadow: theme.shadows[1]
            },
            '& pre': {
              backgroundColor: theme.palette.mode === 'dark' ? '#282a36' : '#f5f5f5',
              p: 3,
              pt: 4,
              borderRadius: 1,
              overflowX: 'auto',
              boxShadow: theme.shadows[1],
              border: `1px solid ${theme.palette.divider}`,
              position: 'relative',
              // Highlight.js scrollbars
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                borderRadius: '0 0 8px 8px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)'
              },
              // Add a decorative top bar
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                background: (theme.palette.mode === 'dark') 
                  ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark}, ${theme.palette.secondary.main})`
                  : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
                borderRadius: '8px 8px 0 0'
              },
              // Language label
              '&[data-language]:not([data-language=""])::after': {
                content: 'attr(data-language)',
                position: 'absolute',
                top: '8px',
                left: '12px',
                fontSize: '0.7rem',
                fontWeight: 500,
                color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600],
                textTransform: 'uppercase',
                fontFamily: '"Fira Code", "Geist Mono", monospace',
                letterSpacing: '0.05em',
                display: 'inline-block',
                background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)',
                padding: '4px 6px',
                borderRadius: '4px',
                zIndex: 5
              }
            },
            '& code': {
              fontFamily: '"Fira Code", "Geist Mono", monospace',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 15, 25, 0.6)' : 'rgba(0, 0, 0, 0.05)',
              px: 1,
              borderRadius: 0.5,
              color: theme.palette.mode === 'dark' ? '#E4E4E7' : theme.palette.text.primary,
            },
            // Inline code (not in a pre block)
            '& :not(pre) > code': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 15, 25, 0.6)' : 'rgba(0, 0, 0, 0.05)',
              padding: '0.2em 0.4em',
              fontSize: '0.9em',
              borderRadius: '4px',
            },
            // Highlight.js theme overrides
            '& .hljs': {
              background: 'transparent',
              padding: 0,
              color: theme.palette.mode === 'dark' ? '#f8f8f2' : '#24292e',
            },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: theme.palette.primary.main,
              pl: 3,
              py: 1,
              ml: 0,
              mr: 0,
              my: 3,
              fontStyle: 'italic',
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(24, 24, 27, 0.5)' 
                : 'rgba(249, 250, 251, 0.8)',
              borderRadius: '0 4px 4px 0'
            },
            '& ul, & ol': {
              paddingLeft: 3
            },
            '& li': {
              marginBottom: 1
            },
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: 3
            },
            '& th, & td': {
              border: `1px solid ${theme.palette.divider}`,
              padding: 1.5
            },
            '& th': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(24, 24, 27, 0.7)' 
                : 'rgba(249, 250, 251, 0.8)'
            }
          })}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Grid2>
      
      {/* Sidebar with Table of Contents - Desktop */}
      <Grid2 size={{xs: 12, lg: 4}} sx={{ display: { xs: 'none', lg: 'block' } }}>
        <TableOfContents content={content} />
      </Grid2>
      
      {/* Mobile ToC - Shown only on small screens */}
      <Grid2 size={{xs: 12}} sx={{ display: { xs: 'block', lg: 'none' }, mt: 4, mb: 2 }}>
        <Box 
          sx={theme => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            backgroundColor: theme.palette.background.paper,
            p: 2
          })}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '""',
                width: 4,
                height: 16,
                backgroundColor: 'primary.main',
                display: 'inline-block',
                marginRight: 1,
                borderRadius: 1
              }
            }}
          >
            Table of Contents
          </Typography>
          <TableOfContents content={content} isMobile={true} />
        </Box>
      </Grid2>
    </Grid2>
  );
}