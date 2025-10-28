import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
} from '@mui/material';
import {
  PlayArrow,
  Refresh,
  Science,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import EntropyTransformation from '../components/EntropyTransformation';
import RandomWalk from '../components/RandomWalk';
import QuantumField from '../components/QuantumField';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  data?: any;
  duration: number;
}

interface EntropySource {
  name: string;
  displayName: string;
  type: string;
  icon: string;
  available: boolean;
}

const DemoPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [entropyData, setEntropyData] = useState<EntropySource[]>([]);
  const [statisticalResults, setStatisticalResults] = useState<any>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const [visualizationType, setVisualizationType] = useState<'transformation' | 'randomwalk' | 'quantum'>('transformation');

  const demoSteps: DemoStep[] = [
    {
      id: 'init',
      title: 'Инициализация системы',
      description: 'Подготовка к сбору энтропии. Система инициализирует криптографические модули и подключается к источникам энтропии.',
      status: 'pending',
      duration: 1500,
    },
    {
      id: 'entropy',
      title: 'Сбор энтропии',
      description: 'Сбор случайных данных из множественных источников: квантовые маяки, атмосферные шумы, космические данные.',
      status: 'pending',
      duration: 2500,
    },
    {
      id: 'combine',
      title: 'Комбинирование энтропии',
      description: 'Объединение данных из разных источников с использованием криптографических алгоритмов SHA-512.',
      status: 'pending',
      duration: 2000,
    },
    {
      id: 'generate',
      title: 'Генерация чисел',
      description: 'Создание случайной последовательности чисел на основе объединенной энтропии.',
      status: 'pending',
      duration: 1500,
    },
    {
      id: 'test',
      title: 'Статистические тесты',
      description: 'Проведение NIST и DIEHARD тестов для проверки качества случайности.',
      status: 'pending',
      duration: 2500,
    },
    {
      id: 'verify',
      title: 'Верификация',
      description: 'Проверка результатов и создание криптографических доказательств.',
      status: 'pending',
      duration: 1000,
    },
  ];

  const [steps, setSteps] = useState<DemoStep[]>(demoSteps);

  const startDemo = async () => {
    console.log('🚀 Запуск демонстрации, шаги:', demoSteps.length);
    setIsRunning(true);
    setCurrentStep(0);
    setAnimationProgress(0);
    setEntropyData([]);
    setStatisticalResults(null);
    setShowSteps(true);

    for (let i = 0; i < demoSteps.length; i++) {
      setCurrentStep(i);
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? 'active' : index < i ? 'completed' : 'pending'
      })));

      // Симуляция процесса
      await simulateStep(demoSteps[i]);

      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index <= i ? 'completed' : 'pending'
      })));

      // Обновляем прогресс анимации
      setAnimationProgress(((i + 1) / demoSteps.length) * 100);

      // Пауза между шагами
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const simulateStep = async (step: DemoStep) => {
    await new Promise(resolve => setTimeout(resolve, step.duration));

    // Симулируем данные для каждого шага
    switch (step.id) {
      case 'entropy':
        try {
          const sourcesResponse = await axios.get('/api/generate/sources');
          setEntropyData(sourcesResponse.data.sources);
        } catch (error) {
          console.error('Ошибка получения источников:', error);
        }
        break;
      case 'generate':
        try {
          const generateResponse = await axios.post('/api/generate', {
            count: 100,
            min: 1,
            max: 100,
            sourcesToUse: ['cubeacon', 'randomorg', 'nist', 'internet', 'iss'],
            combineMethod: 'hash',
            runTests: true
          });
          setStatisticalResults(generateResponse.data);
        } catch (error) {
          console.error('Ошибка генерации:', error);
        }
        break;
      default:
        // Для остальных шагов просто ждем
        break;
    }
  };

  const resetDemo = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setAnimationProgress(0);
    setEntropyData([]);
    setStatisticalResults(null);
    setShowSteps(false);
    setSteps(demoSteps.map(step => ({ ...step, status: 'pending' })));
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'active': return <PlayArrow color="primary" />;
      case 'error': return <Error color="error" />;
      default: return <Science color="disabled" />;
    }
  };


  const getDetailedExplanation = (stepId: string) => {
    switch (stepId) {
      case 'init':
        return 'Система инициализирует криптографические модули, проверяет доступность источников энтропии и подготавливает среду для генерации случайных чисел.';
      case 'entropy':
        return 'Сбор данных из множественных независимых источников энтропии обеспечивает максимальную случайность и криптографическую стойкость.';
      case 'combine':
        return 'Криптографическое объединение данных из разных источников устраняет корреляции и создает единый поток высокой энтропии.';
      case 'generate':
        return 'Генерация чисел происходит с использованием криптографически стойких алгоритмов на основе объединенной энтропии.';
      case 'test':
        return 'Статистические тесты проверяют качество случайности и соответствие международным стандартам NIST и DIEHARD.';
      case 'verify':
        return 'Создание криптографических доказательств обеспечивает возможность последующей верификации результатов.';
      default:
        return 'Детальное описание процесса генерации случайных чисел.';
    }
  };


  return (
    <Box>
      {/* Заголовок страницы */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          🚀 Демонстрация системы генерации случайных чисел
        </Typography>
      </motion.div>

      {/* Кнопки управления */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={startDemo}
            disabled={isRunning}
            sx={{ borderRadius: '20px', px: 4 }}
          >
            {isRunning ? 'Демонстрация запущена...' : 'Запустить демонстрацию'}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Refresh />}
            onClick={resetDemo}
            disabled={isRunning}
            sx={{ borderRadius: '20px', px: 4 }}
          >
            Сбросить
          </Button>
        </motion.div>
      </Box>


      {/* Прогресс демонстрации */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                  📊 Прогресс демонстрации
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={animationProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #00d4ff, #ff6b35)',
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                  {Math.round(animationProgress)}% завершено
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stepper с шагами */}
      <AnimatePresence>
        {showSteps && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ 
              duration: 0.6, 
              ease: "easeOut",
              delay: 0.2
            }}
          >
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  🔄 Этапы генерации случайных чисел ({steps.length} шагов)
                </Typography>
                <Stepper activeStep={currentStep} orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={step.id}>
                      <StepLabel
                        sx={{
                          '& .MuiStepLabel-label': {
                            color: step.status === 'completed' ? '#00ff00' : 
                                   step.status === 'active' ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                            fontWeight: step.status === 'active' ? 600 : 400,
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStepIcon(step.status)}
                          <Typography variant="h6">{step.title}</Typography>
                        </Box>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {step.description}
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                          {getDetailedExplanation(step.id)}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Результаты демонстрации */}
      <AnimatePresence>
        {statisticalResults && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 Результаты генерации
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Сгенерированные числа:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {statisticalResults.result?.numbers?.map((number: number, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.1,
                            ease: "easeOut"
                          }}
                        >
                          <Chip
                            label={number}
                            sx={{
                              background: 'linear-gradient(45deg, #00d4ff, #ff6b35)',
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                        </motion.div>
                      ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Hash: {statisticalResults.result?.hash}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Статистические тесты:
                    </Typography>
                    {statisticalResults.tests && (
                      <Box>
                        <Typography variant="body2">
                          Общий балл: {statisticalResults.tests.overallScore?.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2">
                          Статус: {statisticalResults.tests.passed ? 'PASS' : 'FAIL'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Переключатель визуализации - перемещен под результаты сортировки */}
      {statisticalResults?.result?.numbers && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4 }}>
          <Button
            variant={visualizationType === 'transformation' ? 'contained' : 'outlined'}
            onClick={() => setVisualizationType('transformation')}
            sx={{ borderRadius: '15px' }}
          >
            🔄 Преобразование
          </Button>
          <Button
            variant={visualizationType === 'randomwalk' ? 'contained' : 'outlined'}
            onClick={() => setVisualizationType('randomwalk')}
            sx={{ borderRadius: '15px' }}
          >
            🎲 Случайное блуждание
          </Button>
          <Button
            variant={visualizationType === 'quantum' ? 'contained' : 'outlined'}
            onClick={() => setVisualizationType('quantum')}
            sx={{ borderRadius: '15px' }}
          >
            ⚛️ Квантовое поле
          </Button>
        </Box>
      )}

      {/* Диаграмма преобразования энтропии */}
      <AnimatePresence>
        {visualizationType === 'transformation' && entropyData.length > 0 && statisticalResults?.result?.numbers && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card sx={{ mb: 4, borderRadius: '20px' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, pb: 0 }}>
                  <Typography variant="h5" sx={{ color: '#00d4ff', mb: 2, textAlign: 'center' }}>
                    🔄 Диаграмма преобразования энтропии
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0', textAlign: 'center', mb: 3 }}>
                    <strong>Как работает:</strong> Данные от источников энтропии (CU Beacon, NIST, Random.org) поступают в процессор SHA-512. 
                    Каждый источник дает 16 бит данных, которые преобразуются в финальные случайные числа. Стрелки показывают поток данных.
                  </Typography>
                </Box>
                <Box sx={{ height: '600px' }}>
                  <EntropyTransformation 
                    entropyData={entropyData}
                    finalNumbers={statisticalResults.result.numbers}
                    isActive={true}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Случайное блуждание */}
      <AnimatePresence>
        {visualizationType === 'randomwalk' && statisticalResults?.result?.numbers && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card sx={{ mb: 4, borderRadius: '20px' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, pb: 0 }}>
                  <Typography variant="h5" sx={{ color: '#00d4ff', mb: 2, textAlign: 'center' }}>
                    🎲 Интерактивное случайное блуждание
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0', textAlign: 'center', mb: 3 }}>
                    <strong>Как работает:</strong> Каждое случайное число из генератора преобразуется в угол и расстояние для следующего шага. 
                    Число 42 становится углом 151° и расстоянием 15 пикселей. Траектория показывает паттерн случайности в пространстве.
                  </Typography>
                </Box>
                <Box sx={{ height: '600px' }}>
                  <RandomWalk 
                    numbers={statisticalResults.result.numbers}
                    isActive={true}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Квантовое поле */}
      <AnimatePresence>
        {visualizationType === 'quantum' && statisticalResults?.result?.numbers && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card sx={{ mb: 4, borderRadius: '20px' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, pb: 0 }}>
                  <Typography variant="h5" sx={{ color: '#00d4ff', mb: 2, textAlign: 'center' }}>
                    ⚛️ Квантовое поле частиц
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0', textAlign: 'center', mb: 3 }}>
                    <strong>Как работает:</strong> Каждое случайное число определяет позицию, размер, цвет и энергию частицы. 
                    Число 73 создает частицу в позиции (450, 200) с размером 12px и энергией 0.8. Связи между частицами показывают их взаимодействие.
                  </Typography>
                </Box>
                <Box sx={{ height: '720px' }}>
                  <QuantumField 
                    numbers={statisticalResults.result.numbers}
                    isActive={true}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default DemoPage;
