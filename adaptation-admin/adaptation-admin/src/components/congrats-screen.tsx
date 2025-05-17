import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Trophy, PartyPopper, Rocket, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Employee } from "@/types";
import { useEffect, useState, useRef } from "react";

interface CongratsScreenProps {
  employee?: Employee | null;
  trackTitle: string;
}

// Функция для создания конфетти различных форм
const ConfettiPiece = ({ 
  delay, 
  x, 
  size, 
  type, 
  color, 
  duration, 
  rotation, 
  blowDirection 
}: { 
  delay: number; 
  x: number; 
  size: number; 
  type: 'circle' | 'square' | 'line' | 'star';
  color: string;
  duration: number;
  rotation: number;
  blowDirection: number;
}) => {
  // Вместо useAnimation используем встроенные animate пропсы для лучшей производительности
  const startY = -20;
  const endY = window.innerHeight + 50;
  const directionOffset = blowDirection * (Math.random() * 150 - 75);
  
  // Базовые стили для всех типов конфетти
  const baseStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: type === 'line' ? size / 3 : size,
    height: size,
    backgroundColor: color,
  };
  
  // Дополнительные стили в зависимости от типа
  let additionalStyle = {};
  
  switch (type) {
    case 'circle':
      additionalStyle = { borderRadius: '50%' };
      break;
    case 'square':
      additionalStyle = {}; // Уже квадратный по умолчанию
      break;
    case 'line':
      additionalStyle = {}; // Тонкий прямоугольник
      break;
    case 'star':
      additionalStyle = {
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
      };
      break;
  }
  
  // Общие анимационные свойства
  const animateProps = {
    y: [startY, endY],
    x: [x, x + directionOffset],
    rotate: [0, rotation],
    opacity: [1, 1, 0],
  };
  
  // Транзишн настройки
  const transitionProps = {
    duration,
    delay,
    ease: [0.1, 0.25, 0.3, 1] as const,
    opacity: { 
      times: [0, 0.7, 1],
      duration 
    }
  };
  
  return (
    <motion.div
      style={{ ...baseStyle, ...additionalStyle }}
      initial={{ y: startY, x: x, opacity: 0 }}
      animate={animateProps}
      transition={transitionProps}
    />
  );
};

export function CongratsScreen({ employee, trackTitle }: CongratsScreenProps) {
  const navigate = useNavigate();
  const [confetti, setConfetti] = useState<React.ReactNode[]>([]);
  const [blowDirection, setBlowDirection] = useState(0); // Направление "выдувания" конфетти
  
  // Для генерации уникальных ключей без использования Date.now()
  const keyRef = useRef(0);
  const getUniqueKey = () => {
    keyRef.current += 1;
    return keyRef.current;
  };

  // Цвета для конфетти
  const colors = [
    "#FFD700", // gold
    "#FF6347", // tomato
    "#4169E1", // royal blue
    "#32CD32", // lime green
    "#FF1493", // deep pink
    "#9370DB", // medium purple
    "#00CED1", // dark turquoise
    "#FF8C00", // dark orange
  ];
  
  // Функция создания салюта - оптимизированная версия
  const launchFirework = (initialX?: number) => {
    const x = initialX || Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
    const y = window.innerHeight * 0.7;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Запускаем частицы салюта в разные стороны - уменьшаем количество
    const particles: React.ReactNode[] = [];
    const particleCount = Math.floor(Math.random() * 15) + 20; // Уменьшаем количество частиц
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = Math.random() * 120 + 50; // Меньший разброс для оптимизации
      const speed = Math.random() * 2 + 1.5; // Немного быстрее, чтобы эффект оставался динамичным
      const size = Math.random() * 5 + 2; // Меньший размер частиц
      
      // Вычисляем координаты конечного положения
      const finalX = x + Math.cos(angle) * distance;
      const finalY = y + Math.sin(angle) * distance;
      
      particles.push(
        <motion.div
          key={`firework-${getUniqueKey()}`}
          style={{
            position: 'fixed',
            left: x,
            top: y,
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
            zIndex: 5
          }}
          animate={{
            left: finalX,
            top: finalY,
            opacity: [0.2, 1, 0],
            scale: [0.2, 1, 0.5]
          }}
          transition={{
            duration: speed,
            ease: "easeOut"
          }}
        />
      );
    }
    
    // Обновляем состояние только один раз для всех новых элементов
    setConfetti(prev => [...prev, ...particles]);
    
    // Запускаем еще немного конфетти при запуске салюта для дополнительного эффекта
    const confettiParticleCount = 15; // Небольшое количество
    const additionalConfetti: React.ReactNode[] = [];
    
    for (let i = 0; i < confettiParticleCount; i++) {
      const size = Math.random() * 10 + 5;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 30;
      const startX = x + Math.cos(angle) * 10; // Начальная позиция вокруг точки взрыва
      const startY = y + Math.sin(angle) * 10;
      const finalX = x + Math.cos(angle) * distance;
      const finalY = y + Math.sin(angle) * distance + 100; // Падают ниже 
      const duration = Math.random() * 1.5 + 1.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      additionalConfetti.push(
        <motion.div
          key={`confetti-${getUniqueKey()}`}
          style={{
            position: 'fixed',
            left: startX,
            top: startY,
            width: size / 3,
            height: size,
            backgroundColor: color,
            borderRadius: size / 6,
            zIndex: 5
          }}
          animate={{
            left: finalX,
            top: finalY,
            rotate: Math.random() * 360 - 180,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration,
            ease: [0.1, 0.25, 0.3, 1]
          }}
        />
      );
    }
    
    setConfetti(prev => [...prev, ...additionalConfetti]);
  };
  
  // Функция генерации конфетти
  const generateConfetti = (count: number) => {
    const shapes: ('circle' | 'square' | 'line' | 'star')[] = ['circle', 'square', 'line', 'star'];
    const confettiElements: React.ReactNode[] = [];
    
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 12 + 5; // Уменьшаем размер для лучшей производительности
      const delay = Math.random() * 0.8; // Уменьшаем задержку для более быстрого появления
      const x = Math.random() * window.innerWidth; // Позиция X
      const type = shapes[Math.floor(Math.random() * shapes.length)]; // Случайная форма, но меньше разнообразия
      const color = colors[Math.floor(Math.random() * colors.length)]; // Случайный цвет
      const duration = Math.random() * 2 + 2; // Продолжительность анимации от 2 до 4 секунд - быстрее падают
      const rotation = Math.random() * 360 - 180; // Вращение от -180 до 180 градусов - меньше
      
      confettiElements.push(
        <ConfettiPiece
          key={`confetti-${getUniqueKey()}`}
          delay={delay}
          x={x}
          size={size}
          type={type}
          color={color}
          duration={duration}
          rotation={rotation}
          blowDirection={blowDirection}
        />
      );
    }
    
    // Обновляем состояние за один раз вместо множественных обновлений
    setConfetti(prev => [...prev, ...confettiElements]);
  };
  
  // Очистка старых конфетти для предотвращения утечек памяти
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Удаляем старые конфетти каждые 5 секунд, чтобы не перегружать DOM
      setConfetti(prev => {
        if (prev.length > 500) {
          return prev.slice(prev.length - 300);
        }
        return prev;
      });
    }, 5000);
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  // Генерация конфетти при загрузке компонента
  useEffect(() => {
    // Первая партия конфетти - уменьшаем количество
    generateConfetti(60);
    
    // Через короткий промежуток - вторая партия с другим направлением
    const timer = setTimeout(() => {
      setBlowDirection(-1);
      generateConfetti(40);
    }, 1000);
    
    // Еще одна партия с другим направлением
    const timer2 = setTimeout(() => {
      setBlowDirection(1);
      generateConfetti(30);
    }, 2000);
    
    // Автоматический запуск фейерверка - только один главный
    const fireworksTimer = setTimeout(() => {
      launchFirework();
    }, 800);
    
    // Запуск ещё одного салюта с задержкой
    const fireworksTimer2 = setTimeout(() => {
      launchFirework(window.innerWidth * 0.7);
    }, 2200);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(fireworksTimer);
      clearTimeout(fireworksTimer2);
    };
  }, []);

  const congratsTextVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.5,
        duration: 0.5,
      },
    },
  };

  const iconContainerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 1,
      },
    },
  };

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: {
      width: "100%",
      transition: {
        delay: 1.5,
        duration: 1.5,
      },
    },
  };

  // Обработчик нажатия на кнопку для запуска дополнительного салюта
  const handleFireworkButton = () => {
    // Запускаем только один салют при нажатии для оптимизации
    launchFirework(window.innerWidth * 0.5);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
      {/* Конфетти */}
      <div className="confetti-container fixed inset-0 overflow-hidden pointer-events-none z-0">
        {confetti}
      </div>

      <Card className="w-full max-w-md border-2 border-primary/20 bg-background/95 backdrop-blur-sm z-10 shadow-lg">
        <CardContent className="pt-6 pb-8 text-center">
          <motion.div
            variants={congratsTextVariants}
            initial="initial"
            animate="animate"
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-primary mb-2">
              Поздравляем!
            </h1>
            <p className="text-lg text-muted-foreground">
              {employee?.fullName}, вы успешно завершили программу адаптации!
            </p>
          </motion.div>

          <motion.div
            variants={iconContainerVariants}
            initial="initial"
            animate="animate"
            className="flex justify-center gap-6 mb-8 text-primary"
          >
            <motion.div variants={iconVariants}>
              <Trophy className="h-10 w-10" />
            </motion.div>
            <motion.div variants={iconVariants}>
              <PartyPopper className="h-10 w-10" />
            </motion.div>
            <motion.div variants={iconVariants}>
              <Rocket className="h-10 w-10" />
            </motion.div>
            <motion.div variants={iconVariants}>
              <Sparkles className="h-10 w-10" />
            </motion.div>
            <motion.div variants={iconVariants}>
              <Heart className="h-10 w-10" />
            </motion.div>
          </motion.div>

          <div className="mb-6">
            <p className="mb-2 text-sm text-center">Прогресс адаптации</p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                variants={progressVariants}
                initial="initial"
                animate="animate"
              ></motion.div>
            </div>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              100% выполнено
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <p className="text-sm text-muted-foreground">
              Теперь вы полноценный член нашей команды!
              <br />
              Желаем успехов в дальнейшей работе.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="w-full"
                onClick={handleFireworkButton}
                variant="outline"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Салют!
              </Button>
              
              <Button
                className="w-full"
                onClick={() => window.location.reload()}
              >
                Вернуться к треку
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Оптимизированные плавающие элементы на фоне */}
      <div className="fixed -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-2xl z-0"></div>
      <div className="fixed -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-2xl z-0"></div>
    </div>
  );
} 