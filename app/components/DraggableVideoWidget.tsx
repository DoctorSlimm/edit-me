"use client";

import React, { useState, useEffect, useRef } from "react";

interface DraggableVideoWidgetProps {
  videoUrl?: string;
  initialPosition?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
}

const DraggableVideoWidget: React.FC<DraggableVideoWidgetProps> = ({
  videoUrl = "https://www.youtube.com/watch?v=Yy6fByUmPuE",
  initialPosition,
  onPositionChange,
}) => {
  // Extract video ID from URL
  const getVideoId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : "Yy6fByUmPuE";
  };

  const videoId = getVideoId(videoUrl);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  // Position state
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 20,
    y: 20,
  });

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Load position from localStorage on mount
  useEffect(() => {
    const loadPositionFromStorage = () => {
      try {
        const savedPosition = localStorage.getItem("videoWidgetPosition");
        if (savedPosition) {
          const parsed = JSON.parse(savedPosition);
          if (
            typeof parsed.x === "number" &&
            typeof parsed.y === "number"
          ) {
            setPosition(parsed);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to load position from localStorage:", error);
      }

      // Use initialPosition if provided, otherwise use default
      if (initialPosition) {
        setPosition(initialPosition);
      } else {
        // Default to bottom-right
        setPosition({
          x: typeof window !== "undefined" ? window.innerWidth - 600 : 20,
          y: typeof window !== "undefined" ? window.innerHeight - 350 : 20,
        });
      }
    };

    loadPositionFromStorage();
  }, [initialPosition]);

  // Save position to localStorage
  const savePositionToStorage = (pos: { x: number; y: number }) => {
    try {
      localStorage.setItem("videoWidgetPosition", JSON.stringify(pos));
      onPositionChange?.(pos);
    } catch (error) {
      console.error("Failed to save position to localStorage:", error);
    }
  };

  // Mouse down handler - start dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // Prevent dragging if clicking on iframe or controls
    if ((e.target as HTMLElement).tagName === "IFRAME") {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  // Mouse move handler - update position while dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Save position on drag end
      savePositionToStorage({
        x: position.x,
        y: position.y,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, position]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "560px",
        height: "315px",
        zIndex: 9999,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
      className="shadow-2xl rounded-lg overflow-hidden"
    >
      {/* YouTube iframe */}
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        title="Draggable Video Widget"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          border: "none",
          pointerEvents: isDragging ? "none" : "auto",
        }}
      />
    </div>
  );
};

export default DraggableVideoWidget;
