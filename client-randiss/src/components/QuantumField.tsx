import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, Button, Slider } from '@mui/material';

interface QuantumFieldProps {
  numbers: number[];
  isActive: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  energy: number;
  trail: { x: number; y: number }[];
}

const QuantumField: React.FC<QuantumFieldProps> = ({ numbers, isActive }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  const getContainerSize = useCallback(() => {
    if (svgRef.current) {
      return {
        width: Math.max(svgRef.current.clientWidth || 900, 600),
        height: Math.max(svgRef.current.clientHeight || 600, 400)
      };
    }
    return { width: 900, height: 600 };
  }, []);

  const createParticles = useCallback(() => {
    const { width, height } = getContainerSize();
    setDimensions({ width, height });
    
           const newParticles: Particle[] = numbers.map((number, index) => {
             // Улучшенный генератор случайных чисел для лучшего распределения
             const seed1 = (number + index) * 997;
             const seed2 = (number * index + 1) * 1237;
             const seed3 = (number + index * 2) * 1543;
             
             const random1 = () => {
               const x = Math.sin(seed1) * 10000;
               return x - Math.floor(x);
             };
             
             const random2 = () => {
               const x = Math.sin(seed2) * 10000;
               return x - Math.floor(x);
             };
             
             const random3 = () => {
               const x = Math.sin(seed3) * 10000;
               return x - Math.floor(x);
             };

             return {
               id: index,
               x: random1() * (width - 200) + 100,
               y: random2() * (height - 300) + 150,
               vx: (random1() - 0.5) * 2 * 0.2,
               vy: (random2() - 0.5) * 2 * 0.2,
               size: 6 + random3() * 12,
               color: `hsl(${random3() * 360}, 70%, 60%)`,
               energy: 0.7 + random1() * 0.3,
               trail: [],
             };
           });
    setParticles(newParticles);
  }, [numbers, getContainerSize]);

  useEffect(() => {
    if (!isActive || numbers.length === 0) return;
    createParticles();
  }, [isActive, numbers, createParticles]);

  useEffect(() => {
    if (!isActive || !isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const updateParticles = () => {
      const { width, height } = getContainerSize();
      setDimensions({ width, height });
      
      setParticles(prevParticles => prevParticles.map(p => {
        let newX = p.x + p.vx * animationSpeed;
        let newY = p.y + p.vy * animationSpeed;

        // Отражение от границ
        if (newX < p.size || newX > width - p.size) {
          p.vx *= -1;
          newX = Math.max(p.size, Math.min(width - p.size, newX));
        }
        if (newY < p.size || newY > height - p.size) {
          p.vy *= -1;
          newY = Math.max(p.size, Math.min(height - p.size, newY));
        }

        // Обновляем след
        const newTrail = [...p.trail, { x: newX, y: newY }];
        if (newTrail.length > 20) {
          newTrail.shift();
        }

        return { ...p, x: newX, y: newY, trail: newTrail };
      }));
      animationFrameRef.current = requestAnimationFrame(updateParticles);
    };

    animationFrameRef.current = requestAnimationFrame(updateParticles);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, isPlaying, animationSpeed, getContainerSize]);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setAnimationSpeed(newValue as number);
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const restartAnimation = () => {
    createParticles();
  };

  const generatePath = (trail: { x: number; y: number }[]) => {
    if (trail.length < 2) return '';
    return trail.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');
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
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.1) 0%, rgba(0, 0, 0, 0.9) 70%)',
          border: '1px solid rgba(0, 212, 255, 0.2)'
        }}
        width={dimensions.width}
        height={dimensions.height}
      >
        {/* Grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Центральная область */}
        <circle
          cx={dimensions.width / 2}
          cy={dimensions.height / 2}
          r={100}
          fill="none"
          stroke="rgba(0, 212, 255, 0.3)"
          strokeWidth="2"
        />

        {/* Particles */}
        {particles.map(particle => (
          <g key={particle.id}>
            {/* Particle trail */}
            <path
              d={generatePath(particle.trail)}
              fill="none"
              stroke={particle.color}
              strokeWidth={1}
              opacity={0.4}
            />
            
            {/* Energy field - более заметные радиальные кольца */}
            <circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size * (2 + Math.sin(Date.now() * 0.005 * particle.energy) * 0.8)}
              fill={particle.color}
              opacity={0.15 * particle.energy}
            />
            
            {/* Второе кольцо */}
            <circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size * (3.5 + Math.sin(Date.now() * 0.003 * particle.energy) * 0.6)}
              fill="none"
              stroke={particle.color}
              strokeWidth={1}
              opacity={0.2 * particle.energy}
            />
            
            {/* Третье кольцо */}
            <circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size * (5 + Math.sin(Date.now() * 0.002 * particle.energy) * 0.4)}
              fill="none"
              stroke={particle.color}
              strokeWidth={0.5}
              opacity={0.1 * particle.energy}
            />
            
            {/* Particle */}
            <circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={particle.color}
              stroke="white"
              strokeWidth={0.5}
            />
          </g>
        ))}
        
        {/* Connections between close particles - более заметные связи */}
        {particles.flatMap((p1, i) =>
          particles.slice(i + 1).map(p2 => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 120) {
              const opacity = Math.max(0.1, 0.4 - distance / 120);
              const strokeWidth = Math.max(0.5, 2 - distance / 60);
              return (
                <line
                  key={`${p1.id}-${p2.id}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="rgba(0, 212, 255, 0.3)"
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                />
              );
            }
            return null;
          }).filter(Boolean)
        )}
      </svg>

      {/* Control panel */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        background: 'rgba(0, 0, 0, 0.8)', 
        padding: 2, 
        borderRadius: 2,
        border: '1px solid rgba(0, 212, 255, 0.3)',
        minWidth: '200px',
        backdropFilter: 'blur(5px)'
      }}>
        <Typography variant="h6" sx={{ color: '#00d4ff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          ⚛️ Управление полем:
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            onClick={togglePlayPause}
            sx={{ borderRadius: '15px', minWidth: '120px' }}
          >
            {isPlaying ? '⏸️ Пауза' : '▶️ Воспроизвести'}
          </Button>
          <Button
            variant="outlined"
            onClick={restartAnimation}
            sx={{ borderRadius: '15px', minWidth: '120px' }}
          >
            🔄 Перезапуск
          </Button>
        </Box>
        
        <Typography sx={{ color: '#ffffff', mb: 1 }}>Скорость анимации:</Typography>
        <Slider
          value={animationSpeed}
          onChange={handleSliderChange}
          min={0.1}
          max={3}
          step={0.1}
          sx={{ width: '100%', mb: 2 }}
        />
        
        <Typography sx={{ color: '#ffffff', mb: 1 }}>
          Частиц: {particles.length}
        </Typography>
        <Typography sx={{ color: '#ffffff', fontSize: '0.9rem' }}>
          Соединений: {particles.reduce((acc, p1, i) => 
            acc + particles.slice(i + 1).filter(p2 => {
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              return Math.sqrt(dx * dx + dy * dy) < 120;
            }).length, 0
          )}
        </Typography>
      </Box>

      {/* Description */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 20, 
        left: 20, 
        background: 'rgba(0, 0, 0, 0.8)', 
        padding: 2, 
        borderRadius: 2,
        border: '1px solid rgba(0, 212, 255, 0.3)',
        maxWidth: '400px',
        backdropFilter: 'blur(5px)'
      }}>
        <Typography variant="body2" sx={{ color: '#ffffff', mb: 1 }}>
          <strong>Квантовое поле:</strong>
        </Typography>
        <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: 1.4 }}>
          Каждая частица представляет случайное число. Частицы взаимодействуют друг с другом, 
          создавая динамические связи. Энергетические поля показывают активность каждой частицы.
        </Typography>
      </Box>
    </Box>
  );
};

export default QuantumField;