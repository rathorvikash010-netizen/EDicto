import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import QuizCard from '../components/quiz/QuizCard';
import QuizProgress from '../components/quiz/QuizProgress';
import QuizResult from '../components/quiz/QuizResult';
import { FiPlay, FiEdit3 } from 'react-icons/fi';
import * as api from '../services/api';

const QUIZ_COUNT = 5;

export default function Quiz() {
  const { submitQuiz } = useApp();
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState('');

  const startQuiz = async () => {
    setLoadingQuiz(true);
    setQuizError('');
    try {
      const res = await api.quiz.generate();
      const generated = res.data?.questions || [];
      if (generated.length === 0) {
        setQuizError('Not enough words in the database to generate a quiz. Try again later.');
        return;
      }
      setQuestions(generated.slice(0, QUIZ_COUNT));
      setStarted(true);
      setCurrentQ(0);
      setScore(0);
      setFinished(false);
      setAnswers([]);
    } catch (err) {
      setQuizError(err.data?.message || err.message || 'Failed to generate quiz');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAnswer = useCallback((isCorrect) => {
    setAnswers(prev => [...prev, isCorrect]);
    if (isCorrect) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        const finalScore = isCorrect ? score + 1 : score;
        submitQuiz(finalScore, questions.length, [...answers, isCorrect]);
        setFinished(true);
      } else {
        setCurrentQ(prev => prev + 1);
      }
    }, 400);
  }, [currentQ, questions.length, score, answers, submitQuiz]);

  const handleRetry = () => {
    setStarted(false);
    setCurrentQ(0);
    setScore(0);
    setFinished(false);
    setAnswers([]);
    setQuestions([]);
  };

  // Start screen
  if (!started) {
    return (
      <div className="page-container">
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', paddingTop: 'var(--space-2xl)' }}>
          <div className="animate-scale-in">
            <div style={{ marginBottom: 'var(--space-lg)', color: 'var(--accent-primary)' }}>
              <FiEdit3 size={56} />
            </div>
            <h2 style={{ marginBottom: 'var(--space-sm)' }}>Vocabulary Quiz</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-xl)', lineHeight: 1.6 }}>
              Test your knowledge with {QUIZ_COUNT} multiple-choice questions.
              Select the correct definition for each word.
            </p>

            <div className="card" style={{ textAlign: 'left', marginBottom: 'var(--space-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Questions</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{QUIZ_COUNT}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Type</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Multiple Choice</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Source</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Database Words</span>
              </div>
            </div>

            {quizError && (
              <div className="auth-error animate-fade-in" style={{ marginBottom: 'var(--space-lg)' }}>
                {quizError}
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              onClick={startQuiz}
              disabled={loadingQuiz}
            >
              {loadingQuiz ? 'Generating...' : <><FiPlay /> Start Quiz</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (finished) {
    return (
      <div className="page-container">
        <QuizResult score={score} total={questions.length} onRetry={handleRetry} />
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="page-container">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <QuizProgress current={currentQ + 1} total={questions.length} />
        <QuizCard
          key={currentQ}
          question={questions[currentQ]}
          questionNumber={currentQ + 1}
          total={questions.length}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
}
