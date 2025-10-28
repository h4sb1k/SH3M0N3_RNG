import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

interface EntropyTransformationProps {
  entropyData: any[];
  finalNumbers: number[];
  isActive: boolean;
}

interface EntropySource {
  name: string;
  icon: string;
  type: string;
  color: string;
}

const EntropyTransformation: React.FC<EntropyTransformationProps> = ({
  entropyData,
  finalNumbers,
  isActive
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 500 });
  const [flowParticles, setFlowParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    phase: 'to-processor' | 'through-processor' | 'to-result';
  }>>([]);

  useEffect(() => {
    if (!svgRef.current || !isActive) return;

    const containerWidth = svgRef.current?.clientWidth || 900;
    const containerHeight = svgRef.current?.clientHeight || 500;
    const width = Math.max(containerWidth, 800);
    const height = Math.max(containerHeight, 400);
    setDimensions({ width, height });
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const animateFlow = () => {
      const entropySources = [
        { name: 'CU Beacon', icon: '⚛️', type: 'quantum', color: '#00d4ff' },
        { name: 'NIST Beacon', icon: '🏛️', type: 'quantum', color: '#00d4ff' },
        { name: 'Random.org', icon: '🌐', type: 'atmospheric', color: '#ff6b35' },
        { name: 'Space Weather', icon: '🛰️', type: 'cosmic', color: '#9c27b0' },
        { name: 'Internet', icon: '🏢', type: 'hybrid', color: '#4caf50' },
        { name: 'Weather', icon: '☁️', type: 'weather', color: '#2196f3' },
        { name: 'ISS Position', icon: '🛰️', type: 'space', color: '#ff9800' }
      ];

      const newParticles = entropySources.map((source, index) => ({
        id: Date.now() + index,
        x: 200,
        y: 100 + index * 50,
        color: source.color,
        phase: 'to-processor' as const
      }));

      setFlowParticles(newParticles);

      // Анимация движения частиц
      const animateParticle = (particleId: number) => {
        setFlowParticles(prev => prev.map(p => {
          if (p.id === particleId) {
            if (p.phase === 'to-processor') {
              // Движение к процессору по диагонали
              return { ...p, x: dimensions.width / 2 - 60, y: dimensions.height / 2, phase: 'through-processor' };
            } else if (p.phase === 'through-processor') {
              // Движение через процессор
              return { ...p, x: dimensions.width / 2 + 60, y: dimensions.height / 2, phase: 'to-result' };
            } else if (p.phase === 'to-result') {
              // Движение к результату по диагонали
              return { ...p, x: dimensions.width - 100, y: dimensions.height / 2 };
            }
          }
          return p;
        }));
      };

             // Запускаем анимацию для каждой частицы (замедлено до 2 секунд)
             newParticles.forEach((particle, index) => {
               setTimeout(() => animateParticle(particle.id), index * 200);
               setTimeout(() => animateParticle(particle.id), index * 200 + 4000);
               setTimeout(() => animateParticle(particle.id), index * 200 + 7000);
               setTimeout(() => {
                 setFlowParticles(prev => prev.filter(p => p.id !== particle.id));
               }, index * 200 + 9000);
             });
    };

           animateFlow();
           const interval = setInterval(animateFlow, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [isActive, dimensions]);

  const entropySources: EntropySource[] = [
    { name: 'CU Beacon', icon: '⚛️', type: 'quantum', color: '#00d4ff' },
    { name: 'NIST Beacon', icon: '🏛️', type: 'quantum', color: '#00d4ff' },
    { name: 'Random.org', icon: '🌐', type: 'atmospheric', color: '#ff6b35' },
    { name: 'Space Weather', icon: '🛰️', type: 'cosmic', color: '#9c27b0' },
    { name: 'Internet', icon: '🏢', type: 'hybrid', color: '#4caf50' },
    { name: 'Weather', icon: '☁️', type: 'weather', color: '#2196f3' },
    { name: 'ISS Position', icon: '🛰️', type: 'space', color: '#ff9800' }
  ];

  const generateRandomMatrix = (size: number) => {
    const matrix = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        matrix.push(Math.random() > 0.5 ? 1 : 0);
      }
    }
    return matrix;
  };

  const getColorFromNumber = (number: number) => {
    const hue = (number / 100) * 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      <svg 
        ref={svgRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          background: '#0a0a0a',
          border: '1px solid rgba(0, 212, 255, 0.2)'
        }}
        width={dimensions.width}
        height={dimensions.height}
      >
        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#00d4ff" />
          </marker>
        </defs>

        {/* Background */}
        <rect width="100%" height="100%" fill="#0a0a0a" />

        {/* Title */}
        <text
          x={dimensions.width / 2}
          y="30"
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fill="#00d4ff"
        >
          🔄 Преобразование энтропии в случайные числа
        </text>

        {/* Entropy sources */}
        {entropySources.map((source, index) => {
          const x = 50;
          const y = 100 + index * 50;
          
          return (
            <g key={index}>
              {/* Source icon */}
              <text
                x={x}
                y={y}
                fontSize="24"
                fill={source.color}
              >
                {source.icon}
              </text>
              
              {/* Source name */}
              <text
                x={x + 40}
                y={y}
                fontSize="14"
                fill={source.color}
              >
                {source.name}
              </text>
              
              {/* Data matrix */}
              {generateRandomMatrix(4).map((bit, i) => (
                <rect
                  key={i}
                  x={x + 150 + (i % 4) * 8}
                  y={y - 15 + Math.floor(i / 4) * 8}
                  width="6"
                  height="6"
                  fill={bit ? '#00ff00' : '#ff0000'}
                  rx="1"
                />
              ))}
              
              {/* Arrow to processor */}
              <path
                d={`M ${x + 200} ${y} L ${dimensions.width/2 - 60} ${y}`}
                stroke={source.color}
                strokeWidth="3"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}

        {/* SHA-512 Processor */}
        <rect
          x={dimensions.width / 2 - 60}
          y={dimensions.height / 2 - 30}
          width="120"
          height="60"
          fill="#1a1a2e"
          stroke="#00d4ff"
          strokeWidth="2"
          rx="10"
        />
        
        <text
          x={dimensions.width / 2}
          y={dimensions.height / 2 - 5}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#00d4ff"
        >
          SHA-512
        </text>
        
        <text
          x={dimensions.width / 2}
          y={dimensions.height / 2 + 10}
          textAnchor="middle"
          fontSize="10"
          fill="#ffffff"
        >
          Процессор
        </text>

        {/* Arrow to result */}
        <path
          d={`M ${dimensions.width / 2 + 60} ${dimensions.height / 2} L ${dimensions.width - 100} ${dimensions.height / 2}`}
          stroke="#00d4ff"
          strokeWidth="4"
          fill="none"
          markerEnd="url(#arrowhead)"
        />

        {/* Result box */}
        <rect
          x={dimensions.width - 90}
          y={dimensions.height / 2 - 20}
          width="80"
          height="40"
          fill="#1a1a2e"
          stroke="#ff6b35"
          strokeWidth="2"
          rx="5"
        />
        
        <text
          x={dimensions.width - 50}
          y={dimensions.height / 2 - 5}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#ff6b35"
        >
          Результат
        </text>
        
        <text
          x={dimensions.width - 50}
          y={dimensions.height / 2 + 10}
          textAnchor="middle"
          fontSize="10"
          fill="#ffffff"
        >
          {finalNumbers.length} чисел
        </text>

        {/* Result matrix */}
        {finalNumbers.slice(0, 64).map((number, index) => {
          const matrixSize = 8;
          const spacing = 6;
          const startX = dimensions.width - 50 - (matrixSize * spacing) / 2;
          const startY = dimensions.height / 2 + 30;
          const i = Math.floor(index / matrixSize);
          const j = index % matrixSize;
          
          return (
            <rect
              key={index}
              x={startX + j * spacing}
              y={startY + i * spacing}
              width="5"
              height="5"
              fill={getColorFromNumber(number)}
              rx="1"
            />
          );
        })}

        {/* Result matrix label */}
        <text
          x={dimensions.width - 50}
          y={dimensions.height / 2 + 80}
          textAnchor="middle"
          fontSize="10"
          fill="#ffffff"
        >
          Случайные числа
        </text>

        {/* Flow particles */}
        {flowParticles.map(particle => (
          <circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r="3"
            fill={particle.color}
          />
        ))}

        {/* Legend */}
        <text
          x="50"
          y={dimensions.height - 80}
          fontSize="14"
          fontWeight="bold"
          fill="#ffffff"
        >
          Легенда:
        </text>
        
        <rect
          x="50"
          y={dimensions.height - 70}
          width="8"
          height="8"
          fill="#00ff00"
        />
        <text
          x="65"
          y={dimensions.height - 62}
          fontSize="12"
          fill="#ffffff"
        >
          1 (бит)
        </text>
        
        <rect
          x="120"
          y={dimensions.height - 70}
          width="8"
          height="8"
          fill="#ff0000"
        />
        <text
          x="135"
          y={dimensions.height - 62}
          fontSize="12"
          fill="#ffffff"
        >
          0 (бит)
        </text>
      </svg>
    </Box>
  );
};

export default EntropyTransformation;