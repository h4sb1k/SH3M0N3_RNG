import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLinkClick = (path: string) => {
    navigate(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2 }}
    >
      <Box
        sx={{
          textAlign: 'center',
          py: 6,
          position: 'relative',
        }}
      >
        {/* Главный заголовок */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              mb: 2,
              position: 'relative',
              display: 'inline-block',
              fontFamily: 'Orbitron, monospace',
            }}
          >
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                background: 'linear-gradient(45deg, #00d4ff, #ff6b35, #00d4ff)',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ISSentropy
            </motion.span>
          </Typography>
        </motion.div>

        {/* Подзаголовок */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              color: 'text.secondary',
              fontWeight: 300,
              fontFamily: 'Orbitron, monospace',
            }}
          >
            🛰️ Прозрачный генератор случайных чисел на основе МКС 🛰️
          </Typography>
        </motion.div>

        {/* Описание */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Криптографически стойкий генератор случайных чисел на основе 
            позиции МКС и множественных источников энтропии с полной прозрачностью
          </Typography>
        </motion.div>

        {/* Информационные ссылки */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
              flexWrap: 'wrap',
              mb: 4,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              <Typography
                variant="h6"
                onClick={() => handleLinkClick('/docs')}
                sx={{
                  color: '#00d4ff',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                    textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
                  },
                }}
              >
                📚 Документация
              </Typography>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              <Typography
                variant="h6"
                onClick={() => handleLinkClick('/sources')}
                sx={{
                  color: '#ff6b35',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                    textShadow: '0 0 10px rgba(255, 107, 53, 0.5)',
                  },
                }}
              >
                🛰️ Источники энтропии
              </Typography>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
            >
              <Typography
                variant="h6"
                onClick={() => handleLinkClick('/docs')}
                sx={{
                  color: '#00ff00',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                    textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
                  },
                }}
              >
                🧪 Статистические тесты
              </Typography>
            </motion.div>
          </Box>
        </motion.div>

      </Box>
    </motion.div>
  );
};

export default Header;
