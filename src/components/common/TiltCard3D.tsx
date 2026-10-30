import React, { useRef, useState, useCallback } from 'react';

interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum rotation in degrees (e.g. 10)
  glareOpacity?: number; // Opacity of the specular light shine (e.g. 0.3)
  scale?: number; // Scale factor on hover (e.g. 1.02)
  onClick?: () => void;
}

export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  maxTilt = 10,
  glareOpacity = 0.25,
  scale = 1.02,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
  });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt percentages from -1 to 1
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      const rotateY = percentX * maxTilt;
      const rotateX = -percentY * maxTilt;

      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
        transition: 'transform 0.1s ease-out',
      });

      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: glareOpacity,
      });
    },
    [maxTilt, glareOpacity, scale]
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={style}
      className={`relative transform-style-3d cursor-pointer select-none ${className}`}
    >
      {/* Dynamic 3D Specular Glare / Light Reflection */}
      <div
        className="pointer-events-none absolute inset-0 rounded-inherit transition-opacity duration-300 z-30"
        style={{
          borderRadius: 'inherit',
          opacity: glarePosition.opacity,
          background: `radial-gradient(circle 280px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.45), transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
};
