import React from 'react';
import { Box } from '@mui/material';

const SpaceBackground: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Звездное небо - много звезд */}
      <div className="star star-1" />
      <div className="star star-2" />
      <div className="star star-3" />
      <div className="star star-4" />
      <div className="star star-5" />
      <div className="star star-6" />
      <div className="star star-7" />
      <div className="star star-8" />
      <div className="star star-9" />
      <div className="star star-10" />
      <div className="star star-11" />
      <div className="star star-12" />
      <div className="star star-13" />
      <div className="star star-14" />
      <div className="star star-15" />
      <div className="star star-16" />
      <div className="star star-17" />
      <div className="star star-18" />
      <div className="star star-19" />
      <div className="star star-20" />
      <div className="star star-21" />
      <div className="star star-22" />
      <div className="star star-23" />
      <div className="star star-24" />
      <div className="star star-25" />
      <div className="star star-26" />
      <div className="star star-27" />
      <div className="star star-28" />
      <div className="star star-29" />
      <div className="star star-30" />
      <div className="star star-31" />
      <div className="star star-32" />
      <div className="star star-33" />
      <div className="star star-34" />
      <div className="star star-35" />
      <div className="star star-36" />
      <div className="star star-37" />
      <div className="star star-38" />
      <div className="star star-39" />
      <div className="star star-40" />

      {/* Плавающие частицы */}
      <div className="particle particle-1" />
      <div className="particle particle-2" />
      <div className="particle particle-3" />
      <div className="particle particle-4" />
      <div className="particle particle-5" />

      {/* Большая Медведица */}
      <div className="constellation constellation-ursa-major">
        <div className="constellation-star ursa-star-1" />
        <div className="constellation-star ursa-star-2" />
        <div className="constellation-star ursa-star-3" />
        <div className="constellation-star ursa-star-4" />
        <div className="constellation-star ursa-star-5" />
        <div className="constellation-star ursa-star-6" />
        <div className="constellation-star ursa-star-7" />
        <div className="constellation-line ursa-line-1" />
        <div className="constellation-line ursa-line-2" />
        <div className="constellation-line ursa-line-3" />
        <div className="constellation-line ursa-line-4" />
        <div className="constellation-line ursa-line-5" />
        <div className="constellation-line ursa-line-6" />
      </div>
      
      {/* Орион */}
      <div className="constellation constellation-orion">
        <div className="constellation-star orion-star-1" />
        <div className="constellation-star orion-star-2" />
        <div className="constellation-star orion-star-3" />
        <div className="constellation-star orion-star-4" />
        <div className="constellation-star orion-star-5" />
        <div className="constellation-star orion-star-6" />
        <div className="constellation-star orion-star-7" />
        <div className="constellation-line orion-line-1" />
        <div className="constellation-line orion-line-2" />
        <div className="constellation-line orion-line-3" />
        <div className="constellation-line orion-line-4" />
        <div className="constellation-line orion-line-5" />
        <div className="constellation-line orion-line-6" />
        <div className="constellation-line orion-line-7" />
      </div>
      
      {/* Кассиопея */}
      <div className="constellation constellation-cassiopeia">
        <div className="constellation-star cassiopeia-star-1" />
        <div className="constellation-star cassiopeia-star-2" />
        <div className="constellation-star cassiopeia-star-3" />
        <div className="constellation-star cassiopeia-star-4" />
        <div className="constellation-star cassiopeia-star-5" />
        <div className="constellation-line cassiopeia-line-1" />
        <div className="constellation-line cassiopeia-line-2" />
        <div className="constellation-line cassiopeia-line-3" />
        <div className="constellation-line cassiopeia-line-4" />
      </div>

      {/* Лебедь */}
      <div className="constellation constellation-cygnus">
        <div className="constellation-star cygnus-star-1" />
        <div className="constellation-star cygnus-star-2" />
        <div className="constellation-star cygnus-star-3" />
        <div className="constellation-star cygnus-star-4" />
        <div className="constellation-star cygnus-star-5" />
        <div className="constellation-star cygnus-star-6" />
        <div className="constellation-line cygnus-line-1" />
        <div className="constellation-line cygnus-line-2" />
        <div className="constellation-line cygnus-line-3" />
        <div className="constellation-line cygnus-line-4" />
        <div className="constellation-line cygnus-line-5" />
      </div>
    </Box>
  );
};

export default SpaceBackground;
