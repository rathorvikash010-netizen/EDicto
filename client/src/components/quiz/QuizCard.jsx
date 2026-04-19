import { useState } from 'react';

export default function QuizCard({ question, questionNumber, total, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    const isCorrect = index === question.correctIndex;
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1200);
  };

  const getOptionClass = (index) => {
    if (!answered) return selected === index ? 'selected' : '';
    if (index === question.correctIndex) return 'correct';
    if (index === selected && index !== question.correctIndex) return 'wrong';
    return '';
  };

  return (
    <div className="quiz-container animate-fade-in-up">
      <div className="quiz-header">
        <div className="quiz-question-counter">
          Question {questionNumber} of {total}
        </div>
        <p className="quiz-question-text">What does this word mean?</p>
        <div className="quiz-word-prompt">{question.word}</div>
      </div>

      <div className="quiz-options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`quiz-option ${getOptionClass(index)}`}
            onClick={() => handleSelect(index)}
            disabled={answered}
          >
            <span style={{ marginRight: '12px', fontWeight: 700, opacity: 0.4 }}>
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </button>
        ))}
      </div>

      {answered && (
        <div className={`quiz-feedback ${selected === question.correctIndex ? 'correct' : 'wrong'}`}>
          {selected === question.correctIndex
            ? '✓ Correct! Well done.'
            : `✗ Incorrect. The answer is: ${question.options[question.correctIndex]}`}
        </div>
      )}
    </div>
  );
}
