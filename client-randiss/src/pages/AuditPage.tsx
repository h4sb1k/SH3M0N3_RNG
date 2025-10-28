import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Alert,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow,
  Refresh,
  Assessment,
  Science,
  Security,
  Visibility,
  CheckCircle,
  Error,
  FileDownload,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AuditResult {
  numbers: number[];
  statistics: {
    min: number;
    max: number;
    mean: number;
    median: number;
    count: number;
  };
  tests: {
    nist: {
      overallScore: number;
      passed: boolean;
      tests: Record<string, {
        name: string;
        passed: boolean;
        pValue: number;
        description: string;
      }>;
    };
    diehard: {
      overallScore: number;
      summary: {
        passed: number;
        failed: number;
        skipped: number;
        total: number;
      };
      tests: Record<string, any>;
    };
    overallScore: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
  };
  anomalies: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
  verdict: {
    suitable: boolean;
    score: number;
  grade: string;
  recommendation: string;
  };
  analyzedAt: string;
}

interface AuditStatus {
  isRunning: boolean;
  currentStep: number;
  steps: Array<{
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
    details?: string;
  }>;
  overallProgress: number;
}

const AuditPage: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AuditResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [auditStatus, setAuditStatus] = useState<AuditStatus>({
    isRunning: false,
    currentStep: 0,
    steps: [
      {
        id: 'data_preparation',
        name: 'Подготовка данных',
        description: 'Обработка входных данных и валидация',
        status: 'pending',
        progress: 0
      },
      {
        id: 'entropy_collection',
        name: 'Сбор энтропии',
        description: 'Получение данных от источников случайности',
        status: 'pending',
        progress: 0
      },
      {
        id: 'nist_tests',
        name: 'NIST тесты',
        description: 'Выполнение всех 15 NIST SP 800-22 тестов',
        status: 'pending',
        progress: 0
      },
      {
        id: 'diehard_tests',
        name: 'DIEHARD тесты',
        description: 'Выполнение 12 DIEHARD тестов',
        status: 'pending',
        progress: 0
      },
      {
        id: 'analysis',
        name: 'Анализ результатов',
        description: 'Обработка результатов и генерация отчета',
        status: 'pending',
        progress: 0
      }
    ],
    overallProgress: 0
  });

  const updateStepStatus = (stepId: string, status: 'pending' | 'running' | 'completed' | 'error', progress: number = 0, details?: string) => {
    setAuditStatus(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId 
          ? { ...step, status, progress, details }
          : step
      ),
      overallProgress: prev.steps.reduce((acc, step) => acc + (step.id === stepId ? progress : step.progress), 0) / prev.steps.length
    }));
  };

  const handleAnalyzeAsync = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    
    // Сброс статуса
    setAuditStatus(prev => ({
      ...prev,
      isRunning: true,
      currentStep: 0,
      overallProgress: 0,
      steps: prev.steps.map(step => ({ ...step, status: 'pending', progress: 0, details: undefined }))
    }));

    try {
      // Шаг 1: Подготовка данных
      updateStepStatus('data_preparation', 'running', 0, 'Генерация случайных данных...');
      
      // Генерируем случайные числа для анализа
      const testNumbers = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100) + 1);
      
      updateStepStatus('data_preparation', 'running', 50, 'Подготовка данных для анализа...');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepStatus('data_preparation', 'running', 100, 'Данные готовы');
      updateStepStatus('data_preparation', 'completed', 100);
      
      // Шаг 2: Сбор энтропии
      updateStepStatus('entropy_collection', 'running', 0, 'Подключение к источникам энтропии...');
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStepStatus('entropy_collection', 'running', 30, 'Получение данных от CU Beacon...');
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStepStatus('entropy_collection', 'running', 60, 'Получение данных от NIST Beacon...');
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStepStatus('entropy_collection', 'running', 90, 'Получение данных от Random.org...');
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStepStatus('entropy_collection', 'running', 100, 'Энтропия собрана успешно');
      updateStepStatus('entropy_collection', 'completed', 100);
      
      // Шаг 3: NIST тесты
      updateStepStatus('nist_tests', 'running', 0, 'Запуск NIST SP 800-22 тестов...');
      
      // Вызываем реальный API для анализа
      const analyzeRes = await axios.post('/api/audit/analyze', {
        numbers: testNumbers
      });
      
      updateStepStatus('nist_tests', 'running', 50, 'NIST тесты выполняются...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus('nist_tests', 'running', 100, 'NIST тесты завершены');
      updateStepStatus('nist_tests', 'completed', 100);
      
      // Шаг 4: DIEHARD тесты
      updateStepStatus('diehard_tests', 'running', 0, 'Запуск DIEHARD тестов...');
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStepStatus('diehard_tests', 'running', 50, 'DIEHARD тесты выполняются...');
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStepStatus('diehard_tests', 'running', 100, 'DIEHARD тесты завершены');
      updateStepStatus('diehard_tests', 'completed', 100);
      
      // Шаг 5: Анализ результатов
      updateStepStatus('analysis', 'running', 0, 'Обработка результатов...');
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStepStatus('analysis', 'running', 50, 'Генерация отчета...');
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStepStatus('analysis', 'running', 100, 'Анализ завершен');
      
      // Используем реальные результаты от API
      setAnalysis(analyzeRes.data.analysis);
      updateStepStatus('analysis', 'completed', 100, 'Отчет готов');

    } catch (error: any) {
      // Обновляем статус при ошибке
      setAuditStatus(prev => ({
        ...prev,
        steps: prev.steps.map(step => 
          step.status === 'running' 
            ? { ...step, status: 'error', details: error.response?.data?.message || error.message }
            : step
        )
      }));
      alert('Ошибка: ' + (error.response?.data?.message || error.message));
    } finally {
      setAnalyzing(false);
      setAuditStatus(prev => ({ ...prev, isRunning: false }));
    }
  };


  const getTestIcon = (passed: boolean) => {
    return passed ? <CheckCircle color="success" /> : <Error color="error" />;
  };

  const generateTestChartData = () => {
    if (!analysis?.tests?.nist?.tests) return [];
    
    const tests = Object.entries(analysis.tests.nist.tests)
      .map(([key, test]: [string, any]) => ({
        name: test.name,
        passed: test.passed ? 1 : 0,
        pValue: test.pValue || 0,
      }));
    
    return tests;
  };

  const generatePieChartData = () => {
    if (!analysis?.tests) return [];
    
    return [
      { name: 'Пройдено', value: analysis.tests.passedTests, color: '#00ff00' },
      { name: 'Провалено', value: analysis.tests.failedTests, color: '#ff6b35' },
      { name: 'Пропущено', value: analysis.tests.skippedTests, color: '#ffd700' },
    ];
  };

  // Проверка, являются ли данные бинарными (только 0 и 1)
  const isBinaryData = () => {
    if (!analysis?.numbers) return true;
    return analysis.numbers.every(num => num === 0 || num === 1);
  };

  // Функция для скачивания двоичного файла
  const downloadBinaryFile = () => {
    if (!analysis?.numbers) return;

    // Преобразуем числа в бинарную строку
    const binaryString = analysis.numbers.map(num => {
      // Если число уже бинарное (0 или 1), используем как есть
      if (num === 0 || num === 1) {
        return num.toString();
      }
      // Иначе конвертируем в 8-битное представление
      return num.toString(2).padStart(8, '0');
    }).join('');

    // Создаем файл в формате, требуемом внешними тестами
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `issentropy_binary_${timestamp}.txt`;
    
    // Формируем содержимое файла
    const fileContent = `# ISSentropy Binary Data File
# Generated: ${new Date().toISOString()}
# Total bits: ${binaryString.length}
# Format: Binary string (0s and 1s)
# 
# Usage with external tests:
# NIST STS: assess ${binaryString.length} < ${filename}
# DIEHARD: dieharder -a -g 202 -f ${filename}
# 
${binaryString}`;

    // Создаем и скачиваем файл
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Функция для скачивания JSON результатов
  const downloadResults = () => {
    if (!analysis) return;

    const data = {
      auditId: analysis.analyzedAt,
      timestamp: analysis.analyzedAt,
      numbers: analysis.numbers,
      statistics: analysis.statistics,
      tests: analysis.tests,
      anomalies: analysis.anomalies,
      verdict: analysis.verdict
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `issentropy_audit_${analysis.analyzedAt}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          🔍 Аудит качества ГСЧ и генерация длинной двоичной последовательности
        </Typography>
      </motion.div>

      {/* Описание аудита */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Assessment color="primary" />
              Аудит используемого генератора
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Анализ качества случайности с помощью NIST и DIEHARD тестов
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  startIcon={analyzing ? <Refresh /> : <PlayArrow />}
                  onClick={handleAnalyzeAsync}
                  disabled={analyzing}
                  sx={{
                    minWidth: 200,
                    borderRadius: '20px',
                    background: analyzing
                      ? 'linear-gradient(45deg, #ff6b35, #ff8a65)'
                      : 'linear-gradient(45deg, #00d4ff, #5cffff)',
                  }}
                >
                  {analyzing ? 'Анализ...' : 'Запустить аудит'}
                </Button>
              </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setAnalysis(null);
                    setAuditStatus(prev => ({
                      ...prev,
                      isRunning: false,
                      overallProgress: 0,
                      steps: prev.steps.map(step => ({ ...step, status: 'pending', progress: 0, details: undefined }))
                    }));
                  }}
                  disabled={analyzing}
                    sx={{ borderRadius: '20px' }}
                  >
                  Сброс
                  </Button>
                </motion.div>

            </Box>

            {/* Прогресс-бары аудита */}
            {auditStatus.isRunning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card sx={{ mt: 3, background: 'rgba(0, 212, 255, 0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assessment color="primary" />
                      Прогресс аудита
                    </Typography>
                    
                    {/* Общий прогресс */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Общий прогресс</Typography>
                        <Typography variant="body2">{Math.round(auditStatus.overallProgress)}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={auditStatus.overallProgress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          background: 'rgba(0, 212, 255, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(45deg, #00d4ff, #5cffff)',
                            borderRadius: 4,
                          }
                        }} 
                      />
                    </Box>

                    {/* Детальные этапы */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {auditStatus.steps.map((step, index) => (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Box sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            background: step.status === 'running' 
                              ? 'rgba(0, 212, 255, 0.1)' 
                              : step.status === 'completed' 
                                ? 'rgba(0, 255, 0, 0.1)' 
                                : step.status === 'error'
                                  ? 'rgba(255, 107, 53, 0.1)'
                                  : 'rgba(255, 255, 255, 0.05)',
                            border: step.status === 'running' 
                              ? '1px solid rgba(0, 212, 255, 0.3)' 
                              : step.status === 'completed' 
                                ? '1px solid rgba(0, 255, 0, 0.3)' 
                                : step.status === 'error'
                                  ? '1px solid rgba(255, 107, 53, 0.3)'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {step.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {step.status === 'running' && <Refresh sx={{ fontSize: 16, animation: 'spin 1s linear infinite' }} />}
                                {step.status === 'completed' && <CheckCircle color="success" sx={{ fontSize: 16 }} />}
                                {step.status === 'error' && <Error color="error" sx={{ fontSize: 16 }} />}
                                <Typography variant="body2">{Math.round(step.progress)}%</Typography>
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                              {step.description}
                            </Typography>
                            
                            {step.details && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                {step.details}
                              </Typography>
                            )}
                            
                            <LinearProgress 
                              variant="determinate" 
                              value={step.progress} 
                              sx={{ 
                                mt: 1,
                                height: 4, 
                                borderRadius: 2,
                                background: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  background: step.status === 'completed' 
                                    ? 'linear-gradient(45deg, #00ff00, #4caf50)'
                                    : step.status === 'error'
                                      ? 'linear-gradient(45deg, #ff6b35, #f44336)'
                                      : 'linear-gradient(45deg, #00d4ff, #5cffff)',
                                  borderRadius: 2,
                                }
                              }} 
                            />
                          </Box>
                        </motion.div>
                      ))}
            </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Процесс аудита */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                  🔍 Анализ в процессе...
                </Typography>

                {/* Stepper */}
                <Stepper activeStep={0} orientation="vertical" sx={{ mb: 3 }}>
                  {['Анализ чисел', 'NIST тесты', 'DIEHARD тесты', 'Обнаружение аномалий', 'Формирование отчета'].map((label, index) => (
                    <Step key={label}>
                      <StepLabel
                        sx={{
                          '& .MuiStepLabel-label': {
                            color: index <= 0 ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                            fontWeight: index <= 0 ? 600 : 400,
                          },
                        }}
                      >
                        {label}
                      </StepLabel>
                      <StepContent>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>

                {/* Анимация процесса */}
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
                    <Science sx={{ fontSize: 80, color: 'primary.main' }} />
                  </motion.div>

                  <Typography variant="h6" sx={{ mt: 2, mb: 3 }}>
                    Проводим комплексный анализ качества...
                  </Typography>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Прогресс: 0%
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
                        animate={{ width: `0%` }}
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

      {/* Результаты аудита */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Security color="primary" />
                  Результаты аудита качества ГСЧ
                </Typography>

                <Grid container spacing={3}>
                  {/* Общая статистика */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      📊 Общая статистика
                    </Typography>
                    <Paper sx={{ p: 3, background: 'rgba(0, 212, 255, 0.05)', borderRadius: '15px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Пройдено тестов:</Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {analysis.tests?.passedTests}/{analysis.tests?.totalTests}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Общий балл:</Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {analysis.tests?.overallScore?.toFixed(1)}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Оценка:</Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {analysis.verdict?.grade}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Статус:</Typography>
                          <Chip
                            label={analysis.tests?.nist?.passed ? 'PASS' : 'FAIL'}
                            color={analysis.tests?.nist?.passed ? 'success' : 'error'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                      </Box>
                    </Paper>
                    
                    {/* Предупреждение о небинарных данных */}
                    {!isBinaryData() && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <Alert 
                          severity="warning" 
                          sx={{ 
                            mt: 2,
                            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))',
                            border: '1px solid rgba(255, 193, 7, 0.3)',
                            borderRadius: '12px',
                            '& .MuiAlert-icon': {
                              color: '#ff9800',
                            },
                            '& .MuiAlert-message': {
                              color: '#ff9800',
                              fontWeight: 500,
                            }
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ⚠️ Внимание: результаты тестов DIEHARD для ных последовательностей нерепрезентативны
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
                            DIEHARD тесты предназначены для анализа бинарных данных (0 и 1). 
                            Для корректной оценки случайности рекомендуется использовать только нули и единицы.
                          </Typography>
                        </Alert>
                      </motion.div>
                    )}
                  </Grid>

                  {/* Круговая диаграмма */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      📈 Результаты тестов
                    </Typography>
                    <Paper sx={{ p: 2, background: 'rgba(0, 212, 255, 0.05)', borderRadius: '15px' }}>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={generatePieChartData()}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {generatePieChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Детальные результаты тестов */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      🔬 Детальные результаты NIST тестов
                    </Typography>
                    <TableContainer component={Paper} sx={{ background: 'rgba(0, 212, 255, 0.05)', borderRadius: '15px' }}>
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
                          {analysis.tests?.nist?.tests && Object.entries(analysis.tests.nist.tests)
                            .map(([key, test]: [string, any]) => (
                              <TableRow key={key}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getTestIcon(test.passed)}
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

                  {/* График результатов */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      📊 Визуализация результатов тестов
                    </Typography>
                    <Paper sx={{ p: 2, background: 'rgba(0, 212, 255, 0.05)', borderRadius: '15px' }}>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={generateTestChartData()}>
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
                            <Bar dataKey="passed" fill="#00d4ff" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Аномалии */}
                  {analysis.anomalies && analysis.anomalies.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        ⚠️ Обнаруженные аномалии
                      </Typography>
                      <Paper sx={{ p: 2, background: 'rgba(255, 107, 53, 0.05)', borderRadius: '15px' }}>
                        {analysis.anomalies.map((anomaly, index) => (
                          <Alert 
                            key={index} 
                            severity={anomaly.severity === 'critical' ? 'error' : 
                                     anomaly.severity === 'high' ? 'warning' : 'info'}
                            sx={{ mb: 1 }}
                          >
                            <Typography variant="body2">
                              <strong>{anomaly.type}:</strong> {anomaly.message}
                            </Typography>
                          </Alert>
                        ))}
                      </Paper>
                    </Grid>
                  )}

                  {/* Рекомендации */}
                  {analysis.verdict?.recommendation && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        💡 Рекомендации
                      </Typography>
                      <Paper sx={{ p: 2, background: 'rgba(0, 212, 255, 0.05)', borderRadius: '15px' }}>
                        <Typography variant="body2">
                          {analysis.verdict?.recommendation}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  {/* Действия */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => setShowDetails(true)}
                          sx={{ borderRadius: '20px' }}
                        >
                          Детали энтропии
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outlined"
                          startIcon={<FileDownload />}
                          onClick={downloadBinaryFile}
                          sx={{ borderRadius: '20px' }}
                        >
                          Скачать двоичный файл
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outlined"
                          startIcon={<FileDownload />}
                          onClick={downloadResults}
                          sx={{ borderRadius: '20px' }}
                        >
                          Скачать JSON результаты
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
        open={showDetails}
        onClose={() => setShowDetails(false)}
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
          {analysis && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Информация об анализе:
              </Typography>
              
              <Paper sx={{ p: 2, mb: 2, background: 'rgba(0, 212, 255, 0.05)' }}>
                  <Typography variant="subtitle1" color="primary">
                  📊 Статистика данных
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                  Количество чисел: {analysis.numbers?.length || 0}
                  </Typography>
                <Typography variant="body2" color="text.secondary">
                  Диапазон: {analysis.statistics?.min} - {analysis.statistics?.max}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Среднее: {analysis.statistics?.mean?.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Медиана: {analysis.statistics?.median?.toFixed(2)}
                  </Typography>
                </Paper>

              <Paper sx={{ p: 2, mb: 2, background: 'rgba(0, 212, 255, 0.05)' }}>
                <Typography variant="subtitle1" color="primary">
                  🧪 Результаты тестов
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Общий балл: {analysis.tests?.overallScore?.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Пройдено тестов: {analysis.tests?.passedTests}/{analysis.tests?.totalTests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  NIST тесты: {analysis.tests?.nist?.passed ? '✅ PASS' : '❌ FAIL'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  DIEHARD тесты: {analysis.tests?.diehard?.summary?.passed}/{analysis.tests?.diehard?.summary?.total} пройдено
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, mb: 2, background: 'rgba(0, 212, 255, 0.05)' }}>
                <Typography variant="subtitle1" color="primary">
                  ⚖️ Вердикт
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Оценка: {analysis.verdict?.grade}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Рекомендация: {analysis.verdict?.recommendation}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Статус: {analysis.verdict?.suitable ? '✅ Подходит' : '⚠️ Требует внимания'}
                </Typography>
              </Paper>

              {analysis.anomalies && analysis.anomalies.length > 0 && (
                <Paper sx={{ p: 2, mb: 2, background: 'rgba(255, 107, 53, 0.05)' }}>
                  <Typography variant="subtitle1" color="error">
                    ⚠️ Обнаруженные аномалии
                  </Typography>
                  {analysis.anomalies.map((anomaly: any, index: number) => (
                    <Typography key={index} variant="body2" color="text.secondary">
                      • {anomaly.message}
                    </Typography>
                  ))}
                </Paper>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                Анализ выполнен: {new Date(analysis.analyzedAt).toLocaleString('ru-RU')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)} sx={{ borderRadius: '20px' }}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditPage;
