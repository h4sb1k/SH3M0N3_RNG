import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Tabs, Tab } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import SequencePage from './pages/SequencePage';
import DemoPage from './pages/DemoPage';
import AuditPage from './pages/AuditPage';
import DocsPage from './pages/DocsPage';
import SourcesPage from './pages/SourcesPage';
import SpaceBackground from './components/SpaceBackground';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#5cffff',
      dark: '#00a2cc',
    },
    secondary: {
      main: '#ff6b35',
      light: '#ff9a5a',
      dark: '#c73e0a',
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(20, 20, 40, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '4rem',
      fontWeight: 900,
      background: 'linear-gradient(45deg, #00d4ff, #ff6b35, #00d4ff)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#00d4ff',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#ff6b35',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          textTransform: 'none',
          fontWeight: 700,
          padding: '15px 30px',
          fontSize: '1.1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(45deg, #00d4ff, #ff6b35)',
          boxShadow: '0 8px 32px rgba(0, 212, 255, 0.3)',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 12px 40px rgba(0, 212, 255, 0.5)',
            background: 'linear-gradient(45deg, #5cffff, #ff9a5a)',
          },
          '&:active': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          background: 'rgba(20, 20, 40, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '1.2rem',
          fontWeight: 600,
          textTransform: 'none',
          minHeight: '70px',
          '&.Mui-selected': {
            color: '#00d4ff',
            textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: 'linear-gradient(45deg, #00d4ff, #ff6b35)',
          height: '4px',
          borderRadius: '2px',
          boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
        },
      },
    },
  },
});

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabValue = () => {
    switch (location.pathname) {
      case '/generator': return 0;
      case '/demo': return 1;
      case '/audit': return 2;
      case '/docs': return 3;
      default: return 0;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const routes = ['/generator', '/demo', '/audit', '/docs'];
    navigate(routes[newValue]);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Космический фон */}
      <SpaceBackground />
      
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Header />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(0, 212, 255, 0.3)', mb: 4 }}>
            <Tabs
              value={getTabValue()}
              onChange={handleTabChange}
                  aria-label="ISSentropy tabs"
              sx={{
                '& .MuiTabs-flexContainer': {
                  gap: 2,
                },
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>🎲</span>
                    <span>Генератор</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>🚀</span>
                    <span>Демонстрация</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>🔍</span>
                    <span>Аудит</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>📚</span>
                    <span>Документация</span>
                  </Box>
                } 
              />
            </Tabs>
          </Box>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5 }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/generator" replace />} />
                <Route path="/generator" element={<SequencePage />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/audit" element={<AuditPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/sources" element={<SourcesPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
