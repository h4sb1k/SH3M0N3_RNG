import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Security, 
  Science, 
  Speed,
  Satellite,
  Description,
  ExpandMore,
  ContentCopy,
  CheckCircle
} from '@mui/icons-material';

const DocsPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const features = [
    {
      icon: <Satellite />,
      title: 'Множественные источники энтропии',
      description: 'Используем 7 независимых источников случайности для максимальной надежности',
      details: [
        'CU Randomness Beacon - квантовая энтропия',
        'Random.org - атмосферные шумы',
        'NIST Beacon - государственный стандарт',
        'ISS Position - позиция МКС в реальном времени',
        'Space Weather - космическая погода',
        'Internet Entropy - гибридные данные',
        'OpenWeatherMap - метеорологические данные'
      ]
    },
    {
      icon: <Security />,
      title: 'Полная прозрачность',
      description: 'Каждый результат содержит криптографические доказательства',
      details: [
        'SHA-256 хеш для верификации',
        'Исходные данные от каждого источника',
        'Временные метки генерации',
        'Метод комбинирования энтропии',
        'Статистические тесты качества'
      ]
    },
    {
      icon: <Science />,
      title: 'NIST & DIEHARD тесты',
      description: 'Соответствие международным стандартам качества',
      details: [
        '15 официальных NIST SP 800-22 тестов',
        '12 DIEHARD статистических тестов',
        'Автоматическая проверка качества',
        'Детальные отчеты по каждому тесту',
        'Рекомендации по использованию'
      ]
    },
    {
      icon: <Speed />,
      title: 'Мгновенная генерация',
      description: 'Результаты получаются за секунды',
      details: [
        'Параллельное получение данных',
        'Оптимизированные алгоритмы',
        'Кэширование промежуточных результатов',
        'Адаптивные размеры запросов',
        'Fallback механизмы'
      ]
    }
  ];

  const apiEndpoints = [
    {
      method: 'POST',
      path: '/api/generate',
      description: 'Генерация случайных чисел с визуализацией',
      parameters: [
        { name: 'count', type: 'number', description: 'Количество случайных чисел для генерации (по умолчанию: 6)' },
        { name: 'min', type: 'number', description: 'Минимальное значение включительно (по умолчанию: 1)' },
        { name: 'max', type: 'number', description: 'Максимальное значение включительно (по умолчанию: 100)' },
        { name: 'sourcesToUse', type: 'array', description: 'Массив строк с именами источников энтропии для использования' },
        { name: 'combineMethod', type: 'string', description: 'Метод комбинирования данных ("hash", "xor", "weighted")' },
        { name: 'runTests', type: 'boolean', description: 'Запускать ли статистические тесты (по умолчанию: false)' }
      ],
      exampleRequest: `curl -X POST http://localhost:3001/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "count": 6,
    "min": 1,
    "max": 49,
    "sourcesToUse": ["cubeacon", "nist", "internet"],
    "combineMethod": "hash",
    "runTests": true
  }'`,
      exampleResponse: `{
  "success": true,
  "generationId": "gen_1729512000_abc123",
  "result": {
    "numbers": [7, 15, 23, 31, 42, 49],
    "method": "HASH",
    "hash": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    "timestamp": "2025-10-21T12:00:00.000Z"
  },
  "sources": [
    {
      "source": "CU Randomness Beacon",
      "icon": "⚛️",
      "type": "quantum_beacon",
      "proof": {
        "api_response": {...},
        "entropy_string_length": 256,
        "hash_rounds": 4
      }
    }
  ],
  "tests": {
    "overallScore": 85.7,
    "passed": true,
    "tests": {
      "frequency": {
        "name": "Frequency Test",
        "passed": true,
        "pValue": 0.234,
        "description": "Проверяет равномерность распределения нулей и единиц"
      }
    }
  }
}`
    },
    {
      method: 'GET',
      path: '/api/generate/sources',
      description: 'Получение списка доступных источников энтропии',
      parameters: [],
      exampleRequest: `curl -X GET http://localhost:3001/api/generate/sources`,
      exampleResponse: `{
  "sources": [
    {
      "name": "cubeacon",
      "displayName": "CU Randomness Beacon",
      "type": "quantum_beacon",
      "icon": "⚛️",
      "available": true,
      "description": "Квантовый источник случайности от Университета Колорадо"
    },
    {
      "name": "iss",
      "displayName": "ISS Position",
      "type": "space_station",
      "icon": "🛰️",
      "available": true,
      "description": "Позиция Международной космической станции"
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/tests/generate-file',
      description: 'Генерация файла с бинарными данными для внешнего тестирования',
      parameters: [
        { name: 'scenario', type: 'string', description: 'Сценарий генерации ("quick", "standard", "full", "professional")' },
        { name: 'sourcesToUse', type: 'array', description: 'Источники энтропии для использования (опционально)' }
      ],
      exampleRequest: `curl -X POST http://localhost:3001/api/tests/generate-file \\
  -H "Content-Type: application/json" \\
  -d '{
    "scenario": "professional",
    "sourcesToUse": ["cubeacon", "nist", "randomorg", "spaceweather", "internet", "openweathermap", "iss"]
  }'`,
      exampleResponse: `{
  "success": true,
  "fileName": "random_bits_1729512000.txt",
  "totalBits": 11000000,
  "splitReport": {
    "scenario": "professional",
    "targetBits": {
      "nist": 10000000,
      "diehard": 1000000,
      "total": 11000000
    },
    "efficiency": "4.8%",
    "expansionMethod": "Минимальная эффективность (<5%)",
    "availableTests": {
      "nist": 15,
      "diehard": 12
    }
  },
  "files": {
    "nist": {
      "content": "1010101010101010101010101010101010101010101010101010101010101010...",
      "lines": 125000,
      "bits": 10000000
    }
  },
  "instructions": {
    "nistSTS": "assess 10000000 < nist_file.txt",
    "dieharder": "dieharder -a -g 202 -f diehard_file.txt"
  }
}`
    },
    {
      method: 'POST',
      path: '/api/audit/analyze',
      description: 'Анализ качества последовательности случайных чисел',
      parameters: [
        { name: 'numbers', type: 'array', description: 'Массив чисел для анализа на случайность' },
        { name: 'auditId', type: 'string', description: 'ID аудита для отслеживания (опционально)' }
      ],
      exampleRequest: `curl -X POST http://localhost:3001/api/audit/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "numbers": [1, 5, 2, 8, 3, 9, 4, 7, 6, 0, 12, 15, 18, 22, 25, 30, 33, 36, 40, 45],
    "auditId": "audit_2025_001"
  }'`,
      exampleResponse: `{
  "success": true,
  "auditId": "audit_2025_001",
  "testResults": {
    "nist": {
      "overallScore": 78.5,
      "passed": true,
      "tests": {
        "frequency": {
          "name": "Frequency (Monobit) Test",
          "passed": true,
          "pValue": 0.234,
          "description": "Проверяет равномерность распределения нулей и единиц"
        }
      }
    },
    "diehard": {
      "overallScore": 0,
      "summary": {
        "passed": 0,
        "failed": 0,
        "skipped": 12,
        "total": 12
      }
    },
    "overallScore": 78.5,
    "totalTests": 15,
    "passedTests": 12,
    "failedTests": 3
  },
  "anomalies": [
    {
      "type": "patterns",
      "severity": "medium",
      "message": "Обнаружены арифметические прогрессии в последовательности"
    }
  ],
  "grade": "B",
  "recommendation": "Последовательность подходит для использования в лотереях с небольшими ограничениями"
}`
    }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            textAlign: 'center',
            background: 'linear-gradient(45deg, #00d4ff, #ff6b35)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          📚 Документация ISSentropy
        </Typography>

        <Typography 
          variant="h6" 
          sx={{ 
            textAlign: 'center', 
            color: 'text.secondary',
            mb: 6,
            maxWidth: '800px',
            margin: '0 auto 3rem auto'
          }}
        >
          Полное руководство по использованию криптографически стойкого генератора случайных чисел
        </Typography>

        {/* Основные возможности */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#00d4ff', mb: 3 }}>
            🚀 Основные возможности
          </Typography>
          
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(20, 20, 40, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    '&:hover': {
                      borderColor: 'rgba(0, 212, 255, 0.4)',
                      boxShadow: '0 12px 40px rgba(0, 212, 255, 0.2)',
                    }
                  }}>
                    <CardContent sx={{ 
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          color: '#00d4ff', 
                          mr: 2,
                          fontSize: '2rem'
                        }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {feature.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        {feature.description}
                      </Typography>
                      
                      <List dense sx={{ flex: 1 }}>
                        {feature.details.map((detail, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <Typography sx={{ color: '#00d4ff' }}>•</Typography>
                            </ListItemIcon>
                            <ListItemText 
                              primary={detail}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* API Документация */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#ff6b35', mb: 3 }}>
            🔌 API Документация
          </Typography>
          
          <Paper sx={{ 
            p: 3, 
            background: 'rgba(20, 20, 40, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 107, 53, 0.2)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#ff6b35' }}>
              Базовый URL: <code style={{ color: '#00ff00' }}>http://localhost:3001/api</code>
            </Typography>
            
            {apiEndpoints.map((endpoint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Accordion sx={{ 
                  background: 'rgba(0, 0, 0, 0.3)', 
                  mb: 2,
                  '&:before': { display: 'none' }
                }}>
                  <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#00d4ff' }} />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Chip 
                        label={endpoint.method} 
                        color={endpoint.method === 'POST' ? 'primary' : 'secondary'}
                        size="small"
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#00d4ff', flex: 1 }}>
                        {endpoint.path}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mr: 2 }}>
                        {endpoint.description}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      {/* Параметры */}
                      {endpoint.parameters.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" sx={{ color: '#00ff00', mb: 2 }}>
                            📋 Параметры:
                          </Typography>
                          <Grid container spacing={2}>
                            {endpoint.parameters.map((param, idx) => (
                              <Grid item xs={12} md={6} key={idx}>
                                <Paper sx={{ p: 2, background: 'rgba(0, 255, 0, 0.05)', border: '1px solid rgba(0, 255, 0, 0.2)' }}>
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#00ff00' }}>
                                    {param.name}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#ff6b35', mb: 1 }}>
                                    Тип: {param.type}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {param.description}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* Пример запроса */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ color: '#00d4ff' }}>
                            📤 Пример запроса:
                          </Typography>
                          <Tooltip title={copiedCode === `request-${index}` ? 'Скопировано!' : 'Копировать'}>
                            <IconButton 
                              size="small" 
                              onClick={() => copyToClipboard(endpoint.exampleRequest, `request-${index}`)}
                              sx={{ ml: 1 }}
                            >
                              {copiedCode === `request-${index}` ? <CheckCircle color="success" /> : <ContentCopy />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Paper sx={{ p: 2, background: '#1e1e1e', position: 'relative' }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#00d4ff', whiteSpace: 'pre-wrap' }}>
                            {endpoint.exampleRequest}
                          </Typography>
                        </Paper>
                      </Box>

                      {/* Пример ответа */}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ color: '#00ff00' }}>
                            📥 Пример ответа:
                          </Typography>
                          <Tooltip title={copiedCode === `response-${index}` ? 'Скопировано!' : 'Копировать'}>
                            <IconButton 
                              size="small" 
                              onClick={() => copyToClipboard(endpoint.exampleResponse, `response-${index}`)}
                              sx={{ ml: 1 }}
                            >
                              {copiedCode === `response-${index}` ? <CheckCircle color="success" /> : <ContentCopy />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Paper sx={{ p: 2, background: '#1e1e1e', position: 'relative' }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#00ff00', whiteSpace: 'pre-wrap' }}>
                            {endpoint.exampleResponse}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </Paper>
        </Box>

        {/* Примеры использования */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#00ff00', mb: 3 }}>
            💻 Примеры использования
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                background: 'rgba(20, 20, 40, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 255, 0, 0.2)'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#00ff00' }}>
                    🎲 Генерация лотерейных чисел
                  </Typography>
                  <Paper sx={{ p: 2, background: '#1e1e1e', mb: 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#00d4ff' }}>
                      POST /api/generate{'\n'}
                      {'{'}{'\n'}
                      {'  '}"count": 6,{'\n'}
                      {'  '}"min": 1,{'\n'}
                      {'  '}"max": 49,{'\n'}
                      {'  '}"sourcesToUse": ["iss", "cubeacon", "nist"]{'\n'}
                      {'}'}
                    </Typography>
                  </Paper>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Генерирует 6 чисел от 1 до 49 для лотереи, используя МКС, CU Beacon и NIST
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                background: 'rgba(20, 20, 40, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 255, 0, 0.2)'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#00ff00' }}>
                    📊 Анализ качества
                  </Typography>
                  <Paper sx={{ p: 2, background: '#1e1e1e', mb: 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#00d4ff' }}>
                      POST /api/audit/analyze{'\n'}
                      {'{'}{'\n'}
                      {'  '}"numbers": [1, 2, 3, 4, 5, 6]{'\n'}
                      {'}'}
                    </Typography>
                  </Paper>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Проводит полный статистический анализ последовательности чисел
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Полезные ссылки */}
        <Box>
          <Typography variant="h4" gutterBottom sx={{ color: '#ffd700', mb: 3 }}>
            🔗 Полезные ссылки
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card sx={{ 
                  cursor: 'pointer',
                  background: 'rgba(20, 20, 40, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 107, 53, 0.2)',
                  '&:hover': {
                    borderColor: 'rgba(255, 107, 53, 0.4)',
                    boxShadow: '0 8px 32px rgba(255, 107, 53, 0.2)',
                  }
                }}
                onClick={() => {
                  window.open('https://ru.wikipedia.org/wiki/NIST_SP_800-90A', '_blank');
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Description sx={{ fontSize: '3rem', color: '#ff6b35', mb: 1 }} />
                    <Typography variant="h6" sx={{ color: '#ff6b35' }}>
                      Статистические тесты
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      NIST SP 800-22 и DIEHARD тесты
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#ff6b35', fontSize: '0.75rem', mt: 1, display: 'block' }}>
                      Нажмите для перехода в Википедию
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card sx={{ 
                  cursor: 'pointer',
                  background: 'rgba(20, 20, 40, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  '&:hover': {
                    borderColor: 'rgba(0, 212, 255, 0.4)',
                    boxShadow: '0 8px 32px rgba(0, 212, 255, 0.2)',
                  }
                }}
                onClick={() => {
                  window.open('https://ru.wikipedia.org/wiki/%D0%A2%D0%B5%D1%81%D1%82%D1%8B_diehard', '_blank');
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Science sx={{ fontSize: '3rem', color: '#00d4ff', mb: 1 }} />
                    <Typography variant="h6" sx={{ color: '#00d4ff' }}>
                      DIEHARD тесты
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Классические тесты случайности
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#00d4ff', fontSize: '0.75rem', mt: 1, display: 'block' }}>
                      Нажмите для перехода в Википедию
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </Box>
  );
};

export default DocsPage;
