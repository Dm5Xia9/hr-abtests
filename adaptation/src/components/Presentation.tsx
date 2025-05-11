import { useState, useEffect } from 'react';
import { PresentationContent, PresentationSlide, QuizSlide } from '../types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';

interface PresentationProps {
  content: PresentationContent;
  onComplete: () => void;
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
}

export const Presentation: React.FC<PresentationProps> = ({
  content,
  onComplete,
  currentSlideIndex,
  onSlideChange
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLastSlide, setIsLastSlide] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setIsLastSlide(currentSlideIndex === content.slides.length - 1);
  }, [currentSlideIndex, content.slides.length]);

  const handleNext = () => {
    if (currentSlideIndex < content.slides.length - 1) {
      onSlideChange(currentSlideIndex + 1);
    } else {
      setIsCompleted(true);
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      onSlideChange(currentSlideIndex - 1);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (!showResult) {
      setSelectedAnswer(index);
    }
  };

  const handleQuizSubmit = () => {
    setShowResult(true);
    const slide = content.slides[currentSlideIndex] as QuizSlide;
    if (selectedAnswer === slide.content.correctAnswer) {
      setQuizCompleted(true);
      if (isLastSlide) {
        handleComplete();
      }
    } else {
      setAttempts(attempts + 1);
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
  };

  const handleComplete = () => {
    if (!isCompleting) {
      setIsCompleting(true);
      // Добавляем небольшую задержку перед завершением
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  const currentSlide = content.slides[currentSlideIndex];
  const isQuizSlide = 'type' in currentSlide && currentSlide.type === 'quiz';
  const theme = content.theme || 'light';
  const layout = 'layout' in currentSlide ? currentSlide.layout : content.defaultLayout || 'default';

  const renderSlideContent = (slide: PresentationSlide) => {
    if ('type' in slide && slide.type === 'quiz') {
      const quizSlide = slide as QuizSlide;
      return (
        <div className="quiz">
          <h4 className="quiz-question">{quizSlide.content.question}</h4>
          <div className="quiz-options">
            {quizSlide.content.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`quiz-option ${selectedAnswer === index ? 'selected' : ''} ${
                  showResult
                    ? index === quizSlide.content.correctAnswer
                      ? 'correct'
                      : selectedAnswer === index
                      ? 'incorrect'
                      : ''
                    : ''
                }`}
                disabled={showResult}
              >
                {option}
              </button>
            ))}
          </div>
          {!showResult && selectedAnswer !== null && (
            <button onClick={handleQuizSubmit} className="quiz-submit">
              Проверить
            </button>
          )}
          {showResult && (
            <div className="quiz-result">
              {selectedAnswer === quizSlide.content.correctAnswer ? (
                <div className="quiz-success">
                  <p>Правильно!</p>
                  {isLastSlide && (
                    <p>Поздравляем! Вы завершили все этапы.</p>
                  )}
                </div>
              ) : (
                <div className="quiz-error">
                  <p>Неправильно. Попробуйте еще раз.</p>
                  <p className="quiz-attempts">Попытка {attempts + 1}</p>
                  <button onClick={handleRetryQuiz} className="quiz-retry">
                    Попробовать снова
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if ('code' in slide && slide.code) {
      return (
        <div className="code-block">
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !match ? (
                  <code className={className} {...props}>
                    {children}
                  </code>
                ) : (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...(props as SyntaxHighlighterProps)}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
              },
            }}
          >
            {typeof slide.content === 'string' ? slide.content : ''}
          </ReactMarkdown>
          <div className="code-example">
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={slide.code.language}
              PreTag="div"
            >
              {slide.code.code}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    }

    if ('image' in slide && slide.image) {
      return (
        <div className={`image-content ${slide.image.position || 'right'}`}>
          <div className="text-content">
            <ReactMarkdown>
              {typeof slide.content === 'string' ? slide.content : ''}
            </ReactMarkdown>
          </div>
          <div className="image-container">
            <img src={slide.image.url} alt={slide.image.alt} />
          </div>
        </div>
      );
    }

    return (
      <ReactMarkdown>
        {typeof slide.content === 'string' ? slide.content : ''}
      </ReactMarkdown>
    );
  };

  return (
    <div className={`presentation theme-${theme}`}>
      <div className="presentation-header">
        <h2>{currentSlide.title}</h2>
      </div>
      {/* Slides */}
      <div className="slides">
        <div className={`slide active layout-${layout}`}>
          <div className="slide-content">
            {renderSlideContent(currentSlide)}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="slide-navigation">
        <button
          onClick={handlePrevious}
          disabled={currentSlideIndex === 0}
          className="nav-button"
        >
          Назад
        </button>
        <span className="slide-counter">
          {currentSlideIndex + 1} из {content.slides.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentSlideIndex === content.slides.length - 1 && (isQuizSlide && !quizCompleted)}
          className="nav-button"
        >
          {isLastSlide ? 'Завершить' : 'Далее'}
        </button>
      </div>
    </div>
  );
} 