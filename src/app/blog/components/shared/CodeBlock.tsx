'use client';

import React, { useState, useEffect } from 'react';
import { Box, useTheme, alpha } from '@mui/material';
import { Check, Copy } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

interface CodeBlockProps {
  children: string;
  language?: string;
}

export function CodeBlock({ children, language }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');
  const theme = useTheme();

  useEffect(() => {
    // Register languages you want to support
    // This will run only once when the component is mounted
    hljs.configure({
      languages: ['javascript', 'typescript', 'json', 'html', 'css', 'jsx', 'tsx', 'python', 'bash', 'shell']
    });
  }, []);

  useEffect(() => {
    if (children) {
      let highlighted;
      if (language) {
        try {
          highlighted = hljs.highlight(children, { language }).value;
        } catch (e) {
          // If specific language highlighting fails, try auto detection
          highlighted = hljs.highlightAuto(children).value;
        }
      } else {
        highlighted = hljs.highlightAuto(children).value;
      }
      setHighlightedCode(highlighted);
    }
  }, [children, language]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Box 
      sx={{ 
        position: 'relative',
        my: 3,
        '&:hover .code-copy-button': {
          opacity: 1
        }
      }}
    >
      <Box
        component="button"
        onClick={copyToClipboard}
        className="code-copy-button"
        aria-label={isCopied ? 'Copied!' : 'Copy code'}
        sx={theme => ({
          position: 'absolute',
          right: '0.5rem',
          top: '0.9rem',
          padding: '0.4rem',
          background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: '4px',
          cursor: 'pointer', 
          color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
          opacity: 0,
          transition: 'all 0.2s ease',
          zIndex: 10,
          backdropFilter: 'blur(4px)',
          '&:hover': {
            background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)'
          }
        })}
      >
        {isCopied ? <Check size={16} /> : <Copy size={16} />}
      </Box>
      
      {language && (
        <Box 
          sx={theme => ({ 
            position: 'absolute',
            left: '1rem',
            top: '0.5rem',
            fontSize: '0.7rem', 
            color: theme.palette.common.white,
            fontFamily: '"Fira Code", "Geist Mono", monospace',
            fontWeight: 500,
            letterSpacing: '0.05em',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(0,0,0,0.4)' 
              : alpha(theme.palette.primary.main, 0.8),
            px: 1,
            py: 0.5,
            borderRadius: '4px',
            textTransform: 'uppercase',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
            boxShadow: theme.shadows[1]
          })}
        >
          {language}
        </Box>
      )}
      
      <Box 
        component="pre"
        sx={theme => ({ 
          p: 3,
          pt: 4,
          borderRadius: '10px',
          backgroundColor: theme.palette.mode === 'dark' ? '#282a36' : '#f7f7f7',
          overflowX: 'auto',
          fontFamily: '"Fira Code", "Geist Mono", monospace',
          fontSize: '0.875rem',
          color: theme.palette.mode === 'dark' ? '#f8f8f2' : '#24292e',
          boxShadow: theme.shadows[4],
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            borderRadius: '0 0 10px 10px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)'
          },
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
            borderRadius: '10px 10px 0 0'
          },
          // Override highlight.js styles
          '& .hljs': {
            background: 'transparent',
            padding: 0
          }
        })}
        className={language ? `language-${language}` : ''}
      >
        <code 
          dangerouslySetInnerHTML={{ 
            __html: highlightedCode || children
          }}
        />
      </Box>
    </Box>
  );
}