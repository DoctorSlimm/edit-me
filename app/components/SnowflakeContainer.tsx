"use client";

import { useState, useEffect, useMemo } from "react";
import Snowflake from "./Snowflake";

interface SnowflakeConfig {
  snowflakeCount: number;
  speed: number;
  windStrength: number;
  opacity: number;
}

interface SnowflakeData {
  id: number;
  posX: number;
  delay: number;
  duration: number;
  opacity: number;
  scale: number;
  rotation: number;
  windStrength: number;
}

interface SnowflakeContainerProps {
  enabled?: boolean;
  snowflakeCount?: number;
  speed?: number;
  windStrength?: number;
  opacity?: number;
}

/**
 * Detects if device is low-end based on available memory and processor info
 */
const isLowEndDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  // Check device memory if available
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory !== undefined && deviceMemory <= 2) {
    return true;
  }

  // Check hardware concurrency (CPU cores)
  const hardwareConcurrency = navigator.hardwareConcurrency;
  if (hardwareConcurrency !== undefined && hardwareConcurrency <= 2) {
    return true;
  }

  // Check if running on mobile
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  return isMobile;
};

/**
 * Generates randomized snowflake properties for GPU-accelerated animation
 */
const generateSnowflakes = (count: number): SnowflakeData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    posX: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 10,
    opacity: 0.6 + Math.random() * 0.4, // 0.6 to 1.0
    scale: 0.5 + Math.random() * 1.5, // 0.5 to 2.0
    rotation: Math.random() * 360,
    windStrength: -0.5 + Math.random() * 1, // -0.5 to 0.5
  }));
};

/**
 * Gets device-appropriate configuration
 */
const getDeviceConfig = (
  userConfig: Omit<SnowflakeConfig, "snowflakeCount">
): SnowflakeConfig => {
  const isLowEnd = isLowEndDevice();

  return {
    snowflakeCount: isLowEnd ? 100 : 300, // Reduce for low-end devices
    ...userConfig,
  };
};

/**
 * SnowflakeContainer - Renders hundreds of animated snowflakes with CSS GPU acceleration
 *
 * Features:
 * - Renders 100-300 snowflakes based on device capabilities
 * - GPU-accelerated CSS animations for smooth 60 FPS performance
 * - Responsive configuration for mobile and older browsers
 * - Feature flag support for progressive rollout
 * - No external animation libraries - pure React + CSS
 * - Memory efficient with automatic cleanup
 *
 * @param enabled - Feature flag to enable/disable snowflakes (default: true)
 * @param snowflakeCount - Number of snowflakes to render (default: auto-detected, 100-300)
 * @param speed - Fall velocity multiplier (default: 1)
 * @param windStrength - Horizontal drift strength (default: 0.3)
 * @param opacity - Base opacity of snowflakes (default: 0.8)
 */
export const SnowflakeContainer: React.FC<SnowflakeContainerProps> = ({
  enabled = true,
  snowflakeCount: customCount,
  speed = 1,
  windStrength = 0.3,
  opacity = 0.8,
}) => {
  const [snowflakes, setSnowflakes] = useState<SnowflakeData[]>([]);

  // Get device-appropriate configuration
  const config = useMemo(() => {
    const deviceConfig = getDeviceConfig({ speed, windStrength, opacity });
    return {
      ...deviceConfig,
      snowflakeCount: customCount ?? deviceConfig.snowflakeCount,
    };
  }, [customCount, speed, windStrength, opacity]);

  // Generate snowflakes on mount
  useEffect(() => {
    if (!enabled) {
      setSnowflakes([]);
      return;
    }

    const flakes = generateSnowflakes(config.snowflakeCount);
    setSnowflakes(flakes);

    // Cleanup function
    return () => {
      setSnowflakes([]);
    };
  }, [enabled, config.snowflakeCount]);

  if (!enabled || snowflakes.length === 0) {
    return null;
  }

  return (
    <div className="snowflake-container fixed inset-0 pointer-events-none overflow-hidden">
      {snowflakes.map((flake) => (
        <Snowflake
          key={flake.id}
          id={flake.id}
          posX={flake.posX}
          delay={flake.delay}
          duration={flake.duration}
          opacity={flake.opacity}
          scale={flake.scale}
          rotation={flake.rotation}
          windStrength={flake.windStrength}
        />
      ))}
    </div>
  );
};

export default SnowflakeContainer;
