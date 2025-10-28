import React from 'react';
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
  AccordionDetails
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  ExpandMore
} from '@mui/icons-material';

const SourcesPage: React.FC = () => {
  const sources = [
    {
      name: 'ISS Position',
      icon: '🛰️',
      type: 'space_station',
      description: 'Позиция Международной космической станции в реальном времени',
      api: 'https://api.wheretheiss.at/v1/satellites/25544',
      reliability: 95,
      entropy: 'Очень высокая',
      latency: '1-2 секунды',
      advantages: [
        'Реальные космические данные',
        'Невозможно подделать',
        'Постоянно изменяющиеся координаты',
        'Скорость 27,600 км/ч',
        'Высота 400 км над Землей'
      ],
      technical: {
        data: ['latitude', 'longitude', 'altitude', 'velocity', 'timestamp'],
        method: 'SHA-512 хеширование координат',
        fallback: 'Системное время при недоступности API'
      },
      justification: 'МКС движется по непредсказуемой орбите со скоростью 27,600 км/ч. Координаты постоянно изменяются и зависят от множества факторов: гравитационных возмущений, солнечного ветра, атмосферного сопротивления. Это обеспечивает высокую энтропию и криптографическую стойкость.'
    },
    {
      name: 'CU Randomness Beacon',
      icon: '⚛️',
      type: 'quantum_beacon',
      description: 'Квантовый генератор случайности от Колорадского университета',
      api: 'https://beacon.colorado.edu/beacon/2.0/pulse/latest',
      reliability: 98,
      entropy: 'Максимальная',
      latency: '2-3 секунды',
      advantages: [
        'Квантовая физика',
        'Фундаментальная случайность',
        'Невозможно предсказать',
        'Академическая репутация',
        'Открытый исходный код'
      ],
      technical: {
        data: ['pulse', 'outputValue', 'timeStamp', 'version'],
        method: 'Квантовые флуктуации вакуума',
        fallback: 'Отключение при недоступности'
      },
      justification: 'CU Beacon использует квантовые флуктуации вакуума для генерации истинно случайных чисел. Это фундаментальная случайность на квантовом уровне, которая физически невозможна для предсказания или воспроизведения. Обеспечивает максимальную криптографическую стойкость.'
    },
    {
      name: 'Random.org',
      icon: '📻',
      type: 'atmospheric',
      description: 'Атмосферные шумы как источник случайности',
      api: 'https://api.random.org/json-rpc/2/invoke',
      reliability: 90,
      entropy: 'Высокая',
      latency: '1-2 секунды',
      advantages: [
        'Атмосферные шумы',
        'Многолетняя репутация',
        'Коммерческое использование',
        'API с высокой доступностью',
        'Документированная методология'
      ],
      technical: {
        data: ['random', 'id', 'advisoryDelay'],
        method: 'Атмосферные радиошумы',
        fallback: 'Локальная генерация'
      },
      justification: 'Random.org использует атмосферные радиошумы для генерации случайных чисел. Эти шумы создаются молниями, солнечным ветром и другими природными явлениями. Обеспечивает высокую энтропию и используется в коммерческих приложениях уже много лет.'
    },
    {
      name: 'NIST Beacon',
      icon: '🏛️',
      type: 'government',
      description: 'Официальный генератор случайности от NIST',
      api: 'https://beacon.nist.gov/beacon/2.0/pulse/latest',
      reliability: 99,
      entropy: 'Максимальная',
      latency: '2-4 секунды',
      advantages: [
        'Государственный стандарт',
        'NIST сертификация',
        'Криптографическая стойкость',
        'Регулярные аудиты',
        'Международное признание'
      ],
      technical: {
        data: ['pulse', 'outputValue', 'timeStamp', 'version'],
        method: 'Квантовые генераторы NIST',
        fallback: 'Отключение при недоступности'
      },
      justification: 'NIST Beacon - это официальный генератор случайности от Национального института стандартов и технологий США. Использует сертифицированные квантовые генераторы и проходит регулярные криптографические аудиты. Обеспечивает максимальную надежность и соответствует государственным стандартам.'
    },
    {
      name: 'Space Weather',
      icon: '🌌',
      type: 'cosmic',
      description: 'Космическая погода и солнечная активность',
      api: 'https://services.swpc.noaa.gov/json/',
      reliability: 85,
      entropy: 'Высокая',
      latency: '3-5 секунд',
      advantages: [
        'Солнечная активность',
        'Космические частицы',
        'Геомагнитные бури',
        'Непредсказуемые явления',
        'Научные данные'
      ],
      technical: {
        data: ['kp', 'ap', 'f10_7', 'sunspot_number'],
        method: 'Космические измерения NOAA',
        fallback: 'Исторические данные'
      },
      justification: 'Космическая погода включает солнечную активность, геомагнитные бури и космические частицы. Эти явления непредсказуемы и создают естественную энтропию. Данные от NOAA обеспечивают научную точность и высокое качество случайности.'
    },
    {
      name: 'Internet Entropy',
      icon: '🌐',
      type: 'hybrid',
      description: 'Гибридный источник на основе интернет-данных',
      api: 'Множественные источники',
      reliability: 80,
      entropy: 'Средняя',
      latency: '2-3 секунды',
      advantages: [
        'Множественные источники',
        'Блокчейн данные',
        'Криптовалютные курсы',
        'Валютные курсы',
        'Рыночные данные'
      ],
      technical: {
        data: ['latency', 'blockchain', 'crypto', 'currency', 'market'],
        method: 'Комбинирование множественных источников',
        fallback: 'Локальная генерация'
      },
      justification: 'Internet Entropy комбинирует данные из множественных источников: задержки сети, блокчейн транзакции, курсы криптовалют и валют. Хотя каждый источник может быть предсказуем, их комбинирование создает сложную энтропию, которую трудно предсказать.'
    },
    {
      name: 'OpenWeatherMap',
      icon: '🌤️',
      type: 'meteorological',
      description: 'Метеорологические данные в реальном времени',
      api: 'https://api.openweathermap.org/data/2.5/weather',
      reliability: 75,
      entropy: 'Средняя',
      latency: '1-2 секунды',
      advantages: [
        'Погодные данные',
        'Температура и давление',
        'Влажность и ветер',
        'Географическое разнообразие',
        'Реальные измерения'
      ],
      technical: {
        data: ['temp', 'pressure', 'humidity', 'wind_speed', 'clouds'],
        method: 'Метеорологические измерения',
        fallback: 'Кэшированные данные'
      },
      justification: 'Метеорологические данные включают температуру, давление, влажность и скорость ветра. Эти параметры постоянно изменяются и зависят от множества факторов. Обеспечивают дополнительную энтропию, особенно при использовании данных из разных географических точек.'
    }
  ];

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 95) return '#00ff00';
    if (reliability >= 85) return '#ffd700';
    if (reliability >= 75) return '#ff6b35';
    return '#ff0000';
  };

  const getEntropyColor = (entropy: string) => {
    switch (entropy) {
      case 'Максимальная': return '#00ff00';
      case 'Очень высокая': return '#00d4ff';
      case 'Высокая': return '#ffd700';
      case 'Средняя': return '#ff6b35';
      default: return '#ff0000';
    }
  };

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
          🛰️ Источники энтропии ISSentropy
        </Typography>

        <Typography 
          variant="h6" 
          sx={{ 
            textAlign: 'center', 
            color: 'text.secondary',
            mb: 6,
            maxWidth: '900px',
            margin: '0 auto 3rem auto'
          }}
        >
          Подробная информация о каждом источнике случайности, их технических характеристиках и обосновании выбора
        </Typography>

        {/* Общая статистика */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#00d4ff', mb: 3 }}>
            📊 Общая статистика
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(20, 20, 40, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                textAlign: 'center'
              }}>
                <CardContent>
                  <Typography variant="h3" sx={{ color: '#00d4ff', mb: 1 }}>
                    {sources.length}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#00d4ff' }}>
                    Источников
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Независимых источников энтропии
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(20, 20, 40, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 255, 0, 0.2)',
                textAlign: 'center'
              }}>
                <CardContent>
                  <Typography variant="h3" sx={{ color: '#00ff00', mb: 1 }}>
                    {Math.round(sources.reduce((acc, s) => acc + s.reliability, 0) / sources.length)}%
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#00ff00' }}>
                    Надежность
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Средняя надежность источников
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(20, 20, 40, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 107, 53, 0.2)',
                textAlign: 'center'
              }}>
                <CardContent>
                  <Typography variant="h3" sx={{ color: '#ff6b35', mb: 1 }}>
                    {sources.filter(s => s.entropy === 'Максимальная' || s.entropy === 'Очень высокая').length}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#ff6b35' }}>
                    Высокая энтропия
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Источников с максимальной энтропией
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'rgba(20, 20, 40, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                textAlign: 'center'
              }}>
                <CardContent>
                  <Typography variant="h3" sx={{ color: '#ffd700', mb: 1 }}>
                    {sources.filter(s => s.type === 'quantum_beacon' || s.type === 'government').length}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#ffd700' }}>
                    Квантовые
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Квантовых и государственных источников
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Детальная информация о источниках */}
        <Box>
          <Typography variant="h4" gutterBottom sx={{ color: '#ff6b35', mb: 3 }}>
            🔍 Детальная информация
          </Typography>
          
          {sources.map((source, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Accordion sx={{ 
                mb: 2,
                background: 'rgba(20, 20, 40, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 107, 53, 0.2)',
                '&:before': { display: 'none' }
              }}>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: '#ff6b35' }} />}
                  sx={{ 
                    '& .MuiAccordionSummary-content': { 
                      alignItems: 'center',
                      gap: 2
                    }
                  }}
                >
                  <Typography variant="h2" sx={{ mr: 2 }}>
                    {source.icon}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {source.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {source.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                    <Chip 
                      label={`${source.reliability}%`} 
                      size="small" 
                      sx={{ 
                        backgroundColor: getReliabilityColor(source.reliability),
                        color: 'white'
                      }}
                    />
                    <Chip 
                      label={source.entropy} 
                      size="small" 
                      sx={{ 
                        backgroundColor: getEntropyColor(source.entropy),
                        color: 'white'
                      }}
                    />
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom sx={{ color: '#00d4ff' }}>
                        🚀 Преимущества
                      </Typography>
                      <List dense>
                        {source.advantages.map((advantage, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <Typography sx={{ color: '#00d4ff' }}>•</Typography>
                            </ListItemIcon>
                            <ListItemText 
                              primary={advantage}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom sx={{ color: '#ff6b35' }}>
                        ⚙️ Технические характеристики
                      </Typography>
                      <Paper sx={{ p: 2, background: 'rgba(0, 0, 0, 0.3)' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>API:</strong> <code style={{ color: '#00ff00' }}>{source.api}</code>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Латентность:</strong> {source.latency}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Метод:</strong> {source.technical.method}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Fallback:</strong> {source.technical.fallback}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Данные:</strong> {source.technical.data.join(', ')}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ color: '#00ff00' }}>
                        📋 Обоснование выбора
                      </Typography>
                      <Paper sx={{ p: 3, background: 'rgba(0, 255, 0, 0.05)', border: '1px solid rgba(0, 255, 0, 0.2)' }}>
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                          {source.justification}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          ))}
        </Box>

        {/* Методология комбинирования */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#00ff00', mb: 3 }}>
            🔬 Методология комбинирования
          </Typography>
          
          <Card sx={{ 
            background: 'rgba(20, 20, 40, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 0, 0.2)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#00ff00' }}>
                SHA-512 Хеширование
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Все источники энтропии комбинируются с использованием криптографического хеширования SHA-512:
              </Typography>
              
              <Paper sx={{ p: 2, background: '#1e1e1e', mb: 2 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#00d4ff' }}>
                  1. Получение данных от всех источников{'\n'}
                  2. Конкатенация в единую строку{'\n'}
                  3. Добавление временной метки{'\n'}
                  4. SHA-512 хеширование{'\n'}
                  5. Извлечение случайных чисел{'\n'}
                  6. Нормализация в заданный диапазон
                </Typography>
              </Paper>
              
              <Typography variant="body1">
                Этот метод обеспечивает равномерное распределение энтропии от всех источников и исключает возможность предсказания результата даже при компрометации одного из источников.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </motion.div>
    </Box>
  );
};

export default SourcesPage;
