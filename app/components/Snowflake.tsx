"use client";

interface SnowflakeProps {
  id: number;
  posX: number;
  delay: number;
  duration: number;
  opacity: number;
  scale: number;
  rotation: number;
  windStrength: number;
}

export const Snowflake: React.FC<SnowflakeProps> = ({
  id,
  posX,
  delay,
  duration,
  opacity,
  scale,
  rotation,
  windStrength,
}) => {
  return (
    <div
      key={id}
      className="snowflake absolute top-0 text-white pointer-events-none"
      style={{
        left: `${posX}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        opacity: opacity,
        transform: `scale(${scale})`,
        "--wind-drift": `${windStrength * 50}px`,
        "--rotation": `${rotation}deg`,
      } as React.CSSProperties & {
        "--wind-drift": string;
        "--rotation": string;
      }}
    >
      ❄
    </div>
  );
};

export default Snowflake;
