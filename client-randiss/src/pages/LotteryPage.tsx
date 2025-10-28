import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Add,
  Remove,
  PlayArrow,
  EmojiEvents,
  Person,
  Refresh,
  Download,
  Casino,
  Star,
  Satellite,
  Science,
  Security,
  Speed,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

interface Participant {
  id: string;
  name: string;
}

interface Winner {
  participant: string;
  index: number;
  proof: string;
}

interface LotteryResult {
  lottery_id: string;
  winners: Winner[];
  entropy_data: any;
  statistical_tests: any;
  timestamp: string;
}

interface EntropyCollectionResult {
  task_id: string;
  status: string;
  progress: number;
  current_step: string;
  entropy_data?: any;
  iss_data?: any;
  cities?: any[];
}

const LotteryPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [winnersCount, setWinnersCount] = useState(1);
  const [isConducting, setIsConducting] = useState(false);
  const [lotteryResult, setLotteryResult] = useState<LotteryResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [entropyCollection, setEntropyCollection] = useState<EntropyCollectionResult | null>(null);
  const [showEntropyDetails, setShowEntropyDetails] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Подготовка к тиражу',
    'Сбор космической энтропии',
    'Генерация случайной последовательности',
    'Проведение статистических тестов',
    'Выбор победителей',
    'Завершение тиража',
  ];

  const addParticipant = () => {
    if (newParticipant.trim() && !participants.some(p => p.name === newParticipant.trim())) {
      const newId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setParticipants([...participants, { id: newId, name: newParticipant.trim() }]);
      setNewParticipant('');
    }
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const conductLottery = async () => {
    if (participants.length < winnersCount) {
      return;
    }

    setIsConducting(true);
    setLotteryResult(null);
    setAnimationStep(0);
    setCurrentStep(0);

    try {
      // Шаг 1: Сбор энтропии
      setCurrentStep(1);
      const entropyResponse = await axios.post('http://localhost:8001/api/collect-entropy', {
        mode: 'real'
      });

      const entropyTaskId = entropyResponse.data.task_id;
      
      // Отслеживаем сбор энтропии
      const pollEntropy = async () => {
        try {
          const response = await axios.get(`http://localhost:8001/api/entropy-collection/${entropyTaskId}`);
          const status = response.data;
          setEntropyCollection(status);
          
          if (status.status === 'completed') {
            setCurrentStep(2);
            // Переходим к проведению лотереи
            conductLotteryWithEntropy(entropyTaskId);
          } else if (status.status === 'error') {
            throw new Error(status.error);
          } else {
            setTimeout(pollEntropy, 500);
          }
        } catch (error) {
          console.error('Ошибка сбора энтропии:', error);
          setIsConducting(false);
        }
      };

      pollEntropy();

    } catch (error) {
      console.error('Ошибка запуска лотереи:', error);
      setIsConducting(false);
    }
  };

  const conductLotteryWithEntropy = async (entropyTaskId: string) => {
    try {
      // Шаг 2: Проведение лотереи
      setCurrentStep(3);
      const lotteryResponse = await axios.post('http://localhost:8001/api/conduct-lottery', {
        participants: participants.map(p => p.name),
        winners_count: winnersCount,
        mode: 'real'
      });

      const lotteryId = lotteryResponse.data.lottery_id;
      
      // Отслеживаем проведение лотереи
      const pollLottery = async () => {
        try {
          const response = await axios.get(`http://localhost:8001/api/lottery/${lotteryId}`);
          const status = response.data;
          
          // Обновляем прогресс анимации
          setAnimationStep((status.progress / 100) * 100);
          
          if (status.status === 'completed') {
            setCurrentStep(5);
            setLotteryResult({
              lottery_id: lotteryId,
              winners: status.winners,
              entropy_data: status.entropy_data,
              statistical_tests: status.statistical_tests,
              timestamp: new Date().toISOString()
            });
            setShowResults(true);
            setIsConducting(false);
          } else if (status.status === 'error') {
            throw new Error(status.error);
          } else {
            setTimeout(pollLottery, 500);
          }
        } catch (error) {
          console.error('Ошибка проведения лотереи:', error);
          setIsConducting(false);
        }
      };

      pollLottery();

    } catch (error) {
      console.error('Ошибка проведения лотереи:', error);
      setIsConducting(false);
    }
  };

  const resetLottery = () => {
    setParticipants([]);
    setWinnersCount(1);
    setLotteryResult(null);
    setShowResults(false);
    setAnimationStep(0);
    setEntropyCollection(null);
    setCurrentStep(0);
  };

  const downloadResults = () => {
    if (lotteryResult) {
      const data = {
        lottery_id: lotteryResult.lottery_id,
        participants: participants.map(p => p.name),
        winners: lotteryResult.winners,
        entropy_data: lotteryResult.entropy_data,
        statistical_tests: lotteryResult.statistical_tests,
        timestamp: lotteryResult.timestamp,
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `issentropy_lottery_${lotteryResult.lottery_id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getStatisticalTestColor = (passed: boolean) => {
    return passed ? '#00ff00' : '#ff6b35';
  };

  const getStatisticalTestIcon = (passed: boolean) => {
    return passed ? '✅' : '❌';
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
          🎰 Космическая лотерея
        </Typography>
      </motion.div>

      {/* Настройка лотереи */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Casino color="primary" />
              Настройка лотереи
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Участники
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Имя участника"
                    value={newParticipant}
                    onChange={(e) => setNewParticipant(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                    disabled={isConducting}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '15px',
                      }
                    }}
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      onClick={addParticipant}
                      disabled={!newParticipant.trim() || isConducting}
                      sx={{ minWidth: 'auto', px: 2, borderRadius: '15px' }}
                    >
                      <Add />
                    </Button>
                  </motion.div>
                </Box>

                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  <List dense>
                    {participants.map((participant, index) => (
                      <motion.div
                        key={participant.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ListItem
                          sx={{
                            background: 'linear-gradient(45deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 53, 0.1))',
                            borderRadius: '15px',
                            mb: 1,
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                          }}
                        >
                          <ListItemIcon>
                            <Person color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={participant.name}
                            secondary={`Участник #${index + 1}`}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeParticipant(participant.id)}
                            disabled={isConducting}
                            color="error"
                          >
                            <Remove />
                          </IconButton>
                        </ListItem>
                      </motion.div>
                    ))}
                  </List>
                </Box>

                {participants.length === 0 && (
                  <Alert severity="info" sx={{ mt: 2, borderRadius: '15px' }}>
                    Добавьте участников для проведения лотереи
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Настройки
                </Typography>
                
                <TextField
                  fullWidth
                  label="Количество победителей"
                  type="number"
                  value={winnersCount}
                  onChange={(e) => setWinnersCount(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isConducting}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}
                  inputProps={{ min: 1, max: participants.length }}
                />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      startIcon={isConducting ? <Refresh /> : <PlayArrow />}
                      onClick={conductLottery}
                      disabled={participants.length < winnersCount || isConducting}
                      sx={{
                        minWidth: 200,
                        borderRadius: '20px',
                        background: isConducting
                          ? 'linear-gradient(45deg, #ff6b35, #ff8a65)'
                          : 'linear-gradient(45deg, #00d4ff, #5cffff)',
                      }}
                    >
                      {isConducting ? 'Проводим тираж...' : 'Запустить космический тираж'}
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={resetLottery}
                      disabled={isConducting}
                      sx={{ borderRadius: '20px' }}
                    >
                      Сброс
                    </Button>
                  </motion.div>
                </Box>

                {participants.length > 0 && (
                  <Alert severity="success" sx={{ mt: 2, borderRadius: '15px' }}>
                    {participants.length} участников готовы к космическому тиражу
                  </Alert>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Процесс проведения лотереи */}
      <AnimatePresence>
        {isConducting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                  🚀 Космический тираж в процессе...
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
                    {participants.map((participant, index) => (
                      <motion.div
                        key={participant.id}
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
                          repeatDelay: participants.length * 0.2,
                        }}
                      >
                        {participant.name}
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

      {/* Результаты лотереи */}
      <AnimatePresence>
        {lotteryResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <EmojiEvents color="primary" />
                  Результаты космического тиража
                </Typography>

                <Grid container spacing={3}>
                  {/* Победители */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      🏆 Победители
                    </Typography>
                    {lotteryResult.winners.map((winner, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                      >
                        <Paper
                          sx={{
                            p: 3,
                            mb: 2,
                            background: 'linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1))',
                            border: '2px solid #ffd700',
                            borderRadius: '15px',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.5,
                              }}
                            >
                              <Star sx={{ fontSize: 40, color: '#ffd700' }} />
                            </motion.div>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffd700' }}>
                                {winner.participant}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Место #{index + 1}
                              </Typography>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                Доказательство: {winner.proof.substring(0, 16)}...
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </motion.div>
                    ))}
                  </Grid>

                  {/* Статистические тесты */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      📊 Статистические тесты
                    </Typography>
                    <Paper sx={{ p: 2, background: 'rgba(0, 212, 255, 0.05)', borderRadius: '15px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontSize: '1.2rem' }}>
                            {getStatisticalTestIcon(lotteryResult.statistical_tests.frequency_test.passed)}
                          </span>
                          <Typography variant="body2">
                            Тест частоты: {lotteryResult.statistical_tests.frequency_test.passed ? 'PASS' : 'FAIL'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontSize: '1.2rem' }}>
                            {getStatisticalTestIcon(lotteryResult.statistical_tests.runs_test.passed)}
                          </span>
                          <Typography variant="body2">
                            Тест серий: {lotteryResult.statistical_tests.runs_test.passed ? 'PASS' : 'FAIL'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontSize: '1.2rem' }}>
                            {getStatisticalTestIcon(lotteryResult.statistical_tests.longest_run_test.passed)}
                          </span>
                          <Typography variant="body2">
                            Тест самой длинной серии: {lotteryResult.statistical_tests.longest_run_test.passed ? 'PASS' : 'FAIL'}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 2, p: 2, background: 'rgba(0, 0, 0, 0.2)', borderRadius: '10px' }}>
                          <Typography variant="h6" color="primary">
                            Общий балл: {(lotteryResult.statistical_tests.overall_score * 100).toFixed(1)}%
                          </Typography>
                        </Box>
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
            Детали космической энтропии
          </Typography>
        </DialogTitle>
        <DialogContent>
          {lotteryResult?.entropy_data && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Источники энтропии:
              </Typography>
              {lotteryResult.entropy_data.sources?.map((source: any, index: number) => (
                <Paper key={index} sx={{ p: 2, mb: 2, background: 'rgba(0, 212, 255, 0.05)' }}>
                  <Typography variant="subtitle1" color="primary">
                    {source.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {source.description}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mt: 1 }}>
                    {JSON.stringify(source.data, null, 2)}
                  </Typography>
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

export default LotteryPage;
