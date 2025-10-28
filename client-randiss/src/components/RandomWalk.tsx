import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface RandomWalkProps {
  numbers: number[];
  isActive: boolean;
}

interface PathPoint {
  x: number;
  y: number;
}

const RandomWalk: React.FC<RandomWalkProps> = ({ numbers, isActive }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [pathData, setPathData] = useState<PathPoint[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const animationRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!svgRef.current || !isActive || numbers.length === 0) return;

    const containerWidth = svgRef.current?.clientWidth || 800;
    const containerHeight = svgRef.current?.clientHeight || 500;
    const width = Math.max(containerWidth, 600);
    const height = Math.max(containerHeight, 400);
    setDimensions({ width, height });

    // Создаем путь на основе чисел
    const startX = width / 2;
    const startY = height / 2;
    let currentX = startX;
    let currentY = startY;
    
    const newPathData = [{ x: startX, y: startY }];
    
    const margin = 20;
    numbers.forEach((number) => {
      const angle = (number / 100) * Math.PI * 2;
      const distance = 20 + (number % 12) * 2;
      
      currentX += Math.cos(angle) * distance;
      currentY += Math.sin(angle) * distance;
      
      // Ограничиваем границами поля
      currentX = Math.max(margin + 10, Math.min(width - margin - 10, currentX));
      currentY = Math.max(margin + 10, Math.min(height - margin - 10, currentY));
      
      newPathData.push({ x: currentX, y: currentY });
    });

    setPathData(newPathData);
    setCurrentPosition({ x: startX, y: startY });
    setCurrentIndex(0);
  }, [numbers, isActive]);

  useEffect(() => {
    if (!isActive || !isAnimating || pathData.length === 0) return;

    const moveStep = () => {
      if (currentIndex < pathData.length - 1) {
        const nextIndex = currentIndex + 1;
        const target = pathData[nextIndex];
        
        setCurrentPosition(target);
        setCurrentIndex(nextIndex);
        
         animationRef.current = setTimeout(moveStep, 1000);
      } else {
        setIsAnimating(false);
      }
    };

    moveStep();

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isActive, isAnimating, pathData, currentIndex]);

  const generatePath = (points: PathPoint[]) => {
    if (points.length < 2) return '';
    return points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');
  };

  const restartAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    setIsAnimating(false);
    setCurrentPosition({ x: dimensions.width / 2, y: dimensions.height / 2 });
    setCurrentIndex(0);
    
    // Небольшая задержка перед перезапуском
    setTimeout(() => {
      setIsAnimating(true);
    }, 100);
  };

  const startAnimation = () => {
    setIsAnimating(true);
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <svg 
        ref={svgRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 20, 40, 0.9) 0%, rgba(0, 0, 0, 0.9) 70%)',
          border: '1px solid rgba(0, 212, 255, 0.2)'
        }}
        width={dimensions.width}
        height={dimensions.height}
      >
        {/* Grid pattern */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          </pattern>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff6b35" stopOpacity="1" />
          </linearGradient>
        </defs>
        
        {/* Background with grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Field boundaries */}
        <rect
          x="20"
          y="20"
          width={dimensions.width - 40}
          height={dimensions.height - 40}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
        />
        
        {/* Central line */}
        <line
          x1={dimensions.width / 2}
          y1="20"
          x2={dimensions.width / 2}
          y2={dimensions.height - 20}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />
        
        {/* Central circle */}
        <circle
          cx={dimensions.width / 2}
          cy={dimensions.height / 2}
          r={Math.min(dimensions.width - 40, dimensions.height - 40) / 6}
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />

        {/* Path */}
        <path
          d={generatePath(pathData)}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Start point */}
        <circle
          cx={dimensions.width / 2}
          cy={dimensions.height / 2}
          r="10"
          fill="#00ff00"
          stroke="#ffffff"
          strokeWidth="3"
        />
        
        {/* Finish point */}
        {pathData.length > 0 && (
          <circle
            cx={pathData[pathData.length - 1].x}
            cy={pathData[pathData.length - 1].y}
            r="12"
            fill="#ff6b35"
            stroke="#ffffff"
            strokeWidth="3"
            opacity="0.9"
          />
        )}

        {/* Moving point */}
        <circle
          cx={currentPosition.x}
          cy={currentPosition.y}
          r="8"
          fill="#ff6b35"
          stroke="#ffffff"
          strokeWidth="2"
        />

        {/* Labels */}
        <text
          x={dimensions.width / 2 + 20}
          y={dimensions.height / 2 - 10}
          fill="#00ff00"
          fontSize="16"
          fontWeight="bold"
        >
          СТАРТ
        </text>
        
        {pathData.length > 0 && (
          <text
            x={pathData[pathData.length - 1].x + 20}
            y={pathData[pathData.length - 1].y - 10}
            fill="#ff6b35"
            fontSize="16"
            fontWeight="bold"
          >
            ФИНИШ
          </text>
        )}
      </svg>
      
      {/* Control panel */}
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        background: 'rgba(0, 0, 0, 0.85)', 
        padding: 2, 
        borderRadius: 3,
        border: '2px solid rgba(0, 212, 255, 0.4)',
        minWidth: '180px',
        backdropFilter: 'blur(5px)'
      }}>
        <Typography variant="h6" sx={{ color: '#00d4ff', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
          📊 Статистика:
        </Typography>
        
        <Typography variant="body2" sx={{ color: '#ffffff', mb: 0.5, fontSize: '0.85rem' }}>
          Шагов: {numbers.length}
        </Typography>
        
        <Typography variant="body2" sx={{ color: '#ffffff', mb: 0.5, fontSize: '0.85rem' }}>
          Позиция: ({Math.round(currentPosition.x)}, {Math.round(currentPosition.y)})
        </Typography>
        
        <Typography variant="body2" sx={{ color: '#ffffff', mb: 1.5, fontSize: '0.85rem' }}>
          Статус: {isAnimating ? '🟢 Активно' : '🔴 Остановлено'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
          <Button
            variant="contained"
            onClick={isAnimating ? restartAnimation : startAnimation}
            sx={{
              background: 'linear-gradient(45deg, #00d4ff, #ff6b35)',
              borderRadius: '12px',
              width: '100%',
              fontSize: '0.85rem',
              py: 0.5
            }}
          >
            {isAnimating ? '🔄 Перезапустить' : '▶️ Запустить'}
          </Button>
        </Box>
      </Box>

      {/* Description */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 10, 
        left: 10, 
        background: 'rgba(0, 0, 0, 0.85)', 
        padding: 2, 
        borderRadius: 3,
        border: '2px solid rgba(0, 212, 255, 0.4)',
        maxWidth: '350px',
        backdropFilter: 'blur(5px)'
      }}>
        <Typography variant="body2" sx={{ color: '#ffffff', mb: 1, fontSize: '0.9rem' }}>
          <strong>Как это работает:</strong>
        </Typography>
        <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: '0.8rem', lineHeight: 1.3 }}>
          Каждое случайное число определяет направление и расстояние следующего шага. 
          Траектория показывает, как случайность создает непредсказуемые паттерны движения.
        </Typography>
      </Box>
    </Box>
  );
};

export default RandomWalk;