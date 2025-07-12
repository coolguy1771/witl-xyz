"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, PanInfo } from "framer-motion";
import { Box, useTheme } from "@mui/material";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { MagneticButton } from "./MagneticButton";
import CircularGallery from "./CircularGallery";

interface CarouselProps {
  children: React.ReactNode[];
  itemsPerView?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  spacing?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  infinite?: boolean;
  dragEnabled?: boolean;
  pauseOnHover?: boolean;
  // 3D WebGL carousel options
  use3D?: boolean;
  webglItems?: { image: string; text: string }[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  itemsPerView = { xs: 1, sm: 1, md: 2, lg: 2, xl: 3 },
  spacing = 24,
  autoPlay = true,
  autoPlayInterval = 4000,
  showArrows = true,
  showDots = true,
  infinite = true,
  dragEnabled = true,
  pauseOnHover = true,
  // 3D WebGL carousel options
  use3D = false,
  webglItems,
  bend = 3,
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05,
}) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(
    infinite ? children.length : 0
  );
  const [itemsToShow, setItemsToShow] = useState(itemsPerView.lg || 2);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval>>();
  const carouselRef = useRef<HTMLDivElement>(null);

  const totalItems = children.length;

  // Create infinite loop items
  const infiniteItems = infinite
    ? [...children, ...children, ...children] // Triple the items for smooth infinite scrolling
    : children;

  // Update items to show based on screen size
  useEffect(() => {
    const updateItemsToShow = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setItemsToShow(itemsPerView.xs || 1);
      } else if (width < 960) {
        setItemsToShow(itemsPerView.sm || 1);
      } else if (width < 1280) {
        setItemsToShow(itemsPerView.md || 2);
      } else if (width < 1920) {
        setItemsToShow(itemsPerView.lg || 2);
      } else {
        setItemsToShow(itemsPerView.xl || 3);
      }
    };

    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, [itemsPerView]);

  // Reset index when items change for infinite scroll
  useEffect(() => {
    if (infinite) {
      setCurrentIndex(totalItems);
    }
  }, [totalItems, infinite]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
  }, [isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
  }, [isTransitioning]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      if (infinite) {
        setCurrentIndex(index + totalItems);
      } else {
        setCurrentIndex(index);
      }
    },
    [isTransitioning, infinite, totalItems]
  );

  // Handle infinite loop reset
  useEffect(() => {
    if (!infinite || !isTransitioning) return;

    const timer = setTimeout(() => {
      setIsTransitioning(false);

      // Reset position for infinite scroll
      if (currentIndex >= totalItems * 2) {
        setCurrentIndex(totalItems);
      } else if (currentIndex < totalItems) {
        setCurrentIndex(totalItems * 2 - 1);
      }
    }, 600); // Match transition duration

    return () => clearTimeout(timer);
  }, [currentIndex, totalItems, infinite, isTransitioning]);

  // Auto play functionality
  useEffect(() => {
    if (isPlaying && totalItems > itemsToShow) {
      autoPlayRef.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [isPlaying, autoPlayInterval, totalItems, itemsToShow, goToNext]);

  // Pause/resume on hover
  const handleMouseEnter = () => {
    if (pauseOnHover && autoPlay) {
      setIsPlaying(false);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover && autoPlay) {
      setIsPlaying(true);
    }
  };

  // Handle drag
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (!dragEnabled) return;

    const threshold = 50;
    if (info.offset.x > threshold) {
      goToPrevious();
    } else if (info.offset.x < -threshold) {
      goToNext();
    }
  };

  // Get current slide for dots indicator
  const getCurrentSlideIndex = () => {
    if (!infinite) return currentIndex;
    return (
      (((currentIndex - totalItems) % totalItems) + totalItems) % totalItems
    );
  };

  // If there are fewer items than itemsToShow, just display them without carousel
  if (totalItems <= itemsToShow) {
    return (
      <Box
        sx={{
          display: "flex",
          gap: `${spacing}px`,
          width: "100%",
        }}
      >
        {children.map((child, index) => (
          <motion.div
            key={index}
            style={{
              flex: `0 0 calc((100% - ${(itemsToShow - 1) * spacing}px) / ${itemsToShow})`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {child}
          </motion.div>
        ))}
      </Box>
    );
  }

  // If 3D mode is enabled, render the WebGL carousel
  if (use3D && webglItems) {
    console.log("Debug: Rendering 3D carousel", {
      use3D,
      webglItemsLength: webglItems?.length,
      webglItems: webglItems?.slice(0, 2), // Show first 2 items
      bend,
      textColor: theme.palette.text.primary,
      borderRadius,
      font: `bold 24px ${theme.typography.fontFamily}`,
      scrollSpeed,
      scrollEase
    });
    
    return (
      <Box sx={{ width: "100%", position: "relative" }}>
        <CircularGallery
          items={webglItems}
          bend={bend}
          textColor={theme.palette.text.primary}
          borderRadius={borderRadius}
          font={`bold 24px ${theme.typography.fontFamily}`}
          scrollSpeed={scrollSpeed}
          scrollEase={scrollEase}
        />
      </Box>
    );
  }

  const itemWidth = `calc((100% - ${(itemsToShow - 1) * spacing}px) / ${itemsToShow})`;
  const translateX = `calc(-${currentIndex} * (${itemWidth} + ${spacing}px))`;

  return (
    <Box
      sx={{ position: "relative", width: "100%" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Container */}
      <Box
        ref={carouselRef}
        sx={{
          overflow: "hidden",
          width: "100%",
          position: "relative",
          cursor: dragEnabled ? "grab" : "default",
          "&:active": {
            cursor: dragEnabled ? "grabbing" : "default",
          },
        }}
      >
        <motion.div
          drag={dragEnabled ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={{
            x: translateX,
          }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
            duration: 0.6,
          }}
          style={{
            display: "flex",
            gap: `${spacing}px`,
            width: `calc(${infiniteItems.length} * (${itemWidth} + ${spacing}px))`,
          }}
        >
          {infiniteItems.map((child, index) => (
            <motion.div
              key={`${index}-${infinite ? Math.floor(index / totalItems) : 0}`}
              style={{
                flex: `0 0 ${itemWidth}`,
                minWidth: 0,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                filter:
                  Math.abs(index - currentIndex) <= itemsToShow / 2
                    ? "blur(0px) brightness(1)"
                    : "blur(1px) brightness(0.7)",
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.02,
                y: -5,
                transition: { duration: 0.2 },
              }}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      </Box>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MagneticButton
              onClick={goToPrevious}
              disabled={!infinite && currentIndex === 0}
              strength={0.4}
              sx={{
                position: "absolute",
                left: -20,
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[4],
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
                "&:disabled": {
                  opacity: 0.3,
                },
                zIndex: 2,
                transition: "all 0.2s ease",
              }}
            >
              <ChevronLeft size={20} />
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MagneticButton
              onClick={goToNext}
              disabled={!infinite && currentIndex >= totalItems - itemsToShow}
              strength={0.4}
              sx={{
                position: "absolute",
                right: -20,
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[4],
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
                "&:disabled": {
                  opacity: 0.3,
                },
                zIndex: 2,
                transition: "all 0.2s ease",
              }}
            >
              <ChevronRight size={20} />
            </MagneticButton>
          </motion.div>
        </>
      )}

      {/* Play/Pause Button */}
      {autoPlay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <MagneticButton
            onClick={() => setIsPlaying(!isPlaying)}
            strength={0.3}
            sx={{
              position: "absolute",
              top: -60,
              right: 0,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[2],
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
              zIndex: 2,
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </MagneticButton>
        </motion.div>
      )}

      {/* Dots Indicator */}
      {showDots && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              mt: 3,
            }}
          >
            {Array.from({ length: totalItems }).map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor:
                    index === getCurrentSlideIndex()
                      ? theme.palette.primary.main
                      : theme.palette.action.disabled,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                whileHover={{
                  scale: 1.2,
                  backgroundColor: theme.palette.primary.main,
                }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: index === getCurrentSlideIndex() ? 1.2 : 1,
                  opacity: index === getCurrentSlideIndex() ? 1 : 0.6,
                }}
              />
            ))}
          </Box>
        </motion.div>
      )}
    </Box>
  );
};
