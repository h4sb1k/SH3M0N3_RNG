import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  PlayArrow,
  Refresh,
  Download,
  Star,
  Satellite,
  Science,
  Visibility,
  Numbers,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface SequenceResult {
  success: boolean;
  generationId: string;
  result: {
    numbers: number[];
    method: string;
    hash: string;
    timestamp: string;
  };
  sources: Array<{
    source: string;
    icon: string;
    type: string;
    proof?: any;
  }>;
  tests?: {
    overallScore: number;
    passed: boolean;
    tests: Record<string, {
      name: string;
      passed: boolean;
      pValue: number;
      description: string;
    }>;
  };
}

interface EntropyCollectionResult {
  success: boolean;
  sources: Array<{
    name: string;
    displayName: string;
    type: string;
    icon: string;
    available: boolean;
  }>;
  current_step?: string;
  progress?: number;
}

const SequencePage: React.FC = () => {
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);
  const [count, setCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sequenceResult, setSequenceResult] = useState<SequenceResult | null>(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [entropyCollection, setEntropyCollection] = useState<EntropyCollectionResult | null>(null);
  const [showEntropyDetails, setShowEntropyDetails] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Подготовка к генерации',
    'Сбор космической энтропии',
    'Генерация случайной последовательности',
    'Проведение статистических тестов',
    'Завершение генерации',
  ];

  const generateSequence = async () => {
    if (minValue >= maxValue) {
      return;
    }

    setIsGenerating(true);
    setSequenceResult(null);
    setAnimationStep(0);
    setCurrentStep(0);

    try {
      // Шаг 1: Получение источников
      setCurrentStep(1);
      const sourcesResponse = await axios.get('/api/generate/sources');
      setEntropyCollection(sourcesResponse.data);
      
      // Шаг 2: Генерация последовательности
      setCurrentStep(2);
      const generateResponse = await axios.post('/api/generate', {
        count: count,
        min: minValue,
        max: maxValue,
        sourcesToUse: ['cubeacon', 'randomorg', 'nist', 'internet', 'iss'],
        combineMethod: 'hash',
        runTests: true
      });

      const result = generateResponse.data;
      setSequenceResult(result);
      setCurrentStep(3);
      
      // Шаг 3: Анимация результатов
      setTimeout(() => {
        setCurrentStep(4);
        setIsGenerating(false);
      }, 1000);

    } catch (error) {
      console.error('Ошибка генерации:', error);
      setIsGenerating(false);
    }
  };

  const resetSequence = () => {
    setSequenceResult(null);
    setAnimationStep(0);
    setCurrentStep(0);
    setEntropyCollection(null);
    setShowEntropyDetails(false);
  };

  const downloadResults = () => {
    if (sequenceResult) {
      const data = {
        generationId: sequenceResult.generationId,
        min_value: minValue,
        max_value: maxValue,
        count: count,
        sequence: sequenceResult.result.numbers,
        hash: sequenceResult.result.hash,
        timestamp: sequenceResult.result.timestamp,
        sources: sequenceResult.sources,
        tests: sequenceResult.tests
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `issentropy_sequence_${sequenceResult.generationId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };


  const getStatisticalTestIcon = (passed: boolean) => {
    return passed ? '✅' : '❌';
  };

  const generateChartData = () => {
    if (!sequenceResult) return [];
    
    return sequenceResult.result.numbers.map((value, index) => ({
      index: index + 1,
      value: value,
      name: `#${index + 1}`
    }));
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
          🎲 Генерация случайной последовательности
        </Typography>
      </motion.div>

      {/* Настройка генерации */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Numbers color="primary" />
              Настройка генерации
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Минимальное значение"
                  type="number"
                    inputProps={{ min: -1000 }}
                    value={minValue}
                    onChange={(e) => setMinValue(parseInt(e.target.value) || 0)}
                  disabled={isGenerating}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Максимальное значение"
                  type="number"
                  value={maxValue}
                  onChange={(e) => setMaxValue(parseInt(e.target.value) || 100)}
                  disabled={isGenerating}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Количество чисел"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 10)}
                  disabled={isGenerating}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      startIcon={isGenerating ? <Refresh /> : <PlayArrow />}
                      onClick={isGenerating ? () => setIsGenerating(false) : generateSequence}
                      disabled={minValue >= maxValue || count <= 0 || count > 1000}
                      sx={{
                        minWidth: 200,
                        borderRadius: '20px',
                        background: isGenerating
                          ? 'linear-gradient(45deg, #ff6b35, #ff8a65)'
                          : 'linear-gradient(45deg, #00d4ff, #5cffff)',
                      }}
                    >
                      {isGenerating ? 'Генерируем...' : 'Запустить космическую генерацию'}
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={resetSequence}
                      disabled={isGenerating}
                      sx={{ borderRadius: '20px' }}
                    >
                      Сброс
                    </Button>
                  </motion.div>
                </Box>

                {minValue >= maxValue && (
                  <Alert severity="error" sx={{ mt: 2, borderRadius: '15px' }}>
                    Минимальное значение должно быть меньше максимального
                  </Alert>
                )}

                {count <= 0 && (
                  <Alert severity="error" sx={{ mt: 2, borderRadius: '15px' }}>
                    Количество чисел должно быть положительным
                  </Alert>
                )}

                {count > 1000 && (
                  <Alert severity="error" sx={{ mt: 2, borderRadius: '15px' }}>
                    Количество чисел не должно превышать 1000
                  </Alert>
                )}

                {minValue < maxValue && count > 0 && count <= 1000 && (
                  <Alert severity="success" sx={{ mt: 2, borderRadius: '15px' }}>
                    Готово к генерации {count} чисел в диапазоне от {minValue} до {maxValue}
                  </Alert>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Процесс генерации */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                  🚀 Космическая генерация в процессе...
                </Typography>

                {/* Stepper */}
                <Stepper activeStep={currentStep} orientation="vertical" sx={{ mb: 3 }}>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel
                        sx={{
                          '& .MuiStepLabel-label': {
                            color: index <= currentStep ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                            fontWeight: index <= currentStep ? 600 : 400,
                          },
                        }}
                      >
                        {label}
                      </StepLabel>
                      <StepContent>
                        {index === 1 && entropyCollection && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {entropyCollection.current_step}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={entropyCollection.progress}
                              sx={{
                                mt: 1,
                                height: 8,
                                borderRadius: 4,
                                background: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  background: 'linear-gradient(90deg, #00d4ff, #ff6b35)',
                                  borderRadius: 4,
                                },
                              }}
                            />
                          </Box>
                        )}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>

                {/* Анимация космического процесса */}
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Satellite sx={{ fontSize: 80, color: 'primary.main' }} />
                  </motion.div>

                  <Typography variant="h6" sx={{ mt: 2, mb: 3 }}>
                    Собираем энтропию из космоса...
                  </Typography>

                  {/* Визуализация процесса */}
                  <Box sx={{ position: 'relative', height: 100, overflow: 'hidden', mb: 3 }}>
                    {Array.from({ length: count }, (_, index) => (
                      <motion.div
                        key={index}
                        style={{
                          position: 'absolute',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'linear-gradient(45deg, #00d4ff, #ff6b35)',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}
                        animate={{
                          y: [100, -100],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 0.8,
                          delay: index * 0.2,
                          repeat: Infinity,
                          repeatDelay: count * 0.2,
                        }}
                      >
                        {minValue + Math.floor(Math.random() * (maxValue - minValue + 1))}
                      </motion.div>
                    ))}
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Прогресс: {Math.round(animationStep)}%
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 4,
                        overflow: 'hidden',
                        mt: 1,
                      }}
                    >
                      <motion.div
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #00d4ff, #ff6b35)',
                          borderRadius: 4,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${animationStep}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Результаты генерации */}
      <AnimatePresence>
        {sequenceResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Star color="primary" />
                  Результаты космической генерации
                </Typography>

                <Grid container spacing={3}>
                  {/* Сгенерированная последовательность */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      🎲 Сгенерированная последовательность
                    </Typography>
                    <Paper sx={{ p: 3, background: 'rgba(0, 212, 255, 0.05)', borderRadius: '15px' }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {sequenceResult.result.numbers.map((number, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <Chip
                              label={number}
                              sx={{
                                background: 'linear-gradient(45deg, #00d4ff, #ff6b35)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                minWidth: '50px',
                                height: '40px',
                              }}
                            />
                          </motion.div>
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Диапазон: {minValue} - {maxValue} | Количество: {count}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Статистические тесты */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      📊 NIST статистические тесты
                    </Typography>
                    <Paper sx={{ p: 2, background: 'rgba(0, 212, 255, 0.05)', borderRadius: '15px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {sequenceResult.tests && Object.entries(sequenceResult.tests.tests)
                          .map(([key, test]: [string, any]) => (
                            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span style={{ fontSize: '1.2rem' }}>
                                {getStatisticalTestIcon(test.passed)}
                              </span>
                              <Typography variant="body2">
                                {test.name}: {test.passed ? 'PASS' : 'FAIL'}
                              </Typography>
                            </Box>
                          ))}
                        <Box sx={{ mt: 2, p: 2, background: 'rgba(0, 0, 0, 0.2)', borderRadius: '10px' }}>
                          <Typography variant="h6" color="primary">
                            Общий балл: {sequenceResult.tests?.overallScore?.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Детальные результаты NIST тестов */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      🔬 Детальные результаты NIST тестов
                    </Typography>
                    <TableContainer component={Paper} sx={{ background: 'rgba(0, 212, 255, 0.05)', borderRadius: '15px', mb: 3 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Тест</TableCell>
                            <TableCell>Описание</TableCell>
                            <TableCell>Результат</TableCell>
                            <TableCell>P-value</TableCell>
                            <TableCell>Статистика</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sequenceResult.tests && Object.entries(sequenceResult.tests.tests)
                            .map(([key, test]: [string, any]) => (
                              <TableRow key={key}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getStatisticalTestIcon(test.passed)}
                                    <Typography variant="body2" fontWeight="bold">
                                      {test.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {test.description}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={test.passed ? 'PASS' : 'FAIL'}
                                    color={test.passed ? 'success' : 'error'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontFamily="monospace">
                                    {test.pValue?.toExponential(3) || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontFamily="monospace">
                                    {test.statistic?.toFixed(6) || 'N/A'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  {/* График последовательности */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      📈 Визуализация последовательности
                    </Typography>
                    <Paper sx={{ p: 2, background: 'rgba(0, 212, 255, 0.05)', borderRadius: '15px' }}>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={generateChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.7)" />
                            <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                            <RechartsTooltip
                              contentStyle={{
                                background: 'rgba(26, 26, 26, 0.9)',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                borderRadius: '8px',
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#00d4ff" 
                              strokeWidth={3}
                              dot={{ fill: '#ff6b35', strokeWidth: 2, r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Действия */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Download />}
                          onClick={downloadResults}
                          sx={{ borderRadius: '20px' }}
                        >
                          Скачать результаты
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => setShowEntropyDetails(true)}
                          sx={{ borderRadius: '20px' }}
                        >
                          Детали энтропии
                        </Button>
                      </motion.div>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Диалог с деталями энтропии */}
      <Dialog
        open={showEntropyDetails}
        onClose={() => setShowEntropyDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Science color="primary" />
            Детали источников энтропии
          </Typography>
        </DialogTitle>
        <DialogContent>
          {sequenceResult?.sources && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Источники энтропии:
              </Typography>
              {sequenceResult.sources.map((source: any, index: number) => (
                <Paper key={index} sx={{ p: 2, mb: 2, background: 'rgba(0, 212, 255, 0.05)' }}>
                  <Typography variant="subtitle1" color="primary">
                    {source.icon} {source.source}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Тип: {source.type}
                  </Typography>
                  {source.proof && (
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mt: 1 }}>
                      {JSON.stringify(source.proof, null, 2)}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEntropyDetails(false)} sx={{ borderRadius: '20px' }}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SequencePage;
