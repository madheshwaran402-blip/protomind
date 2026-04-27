import { useState } from 'react'
import { generateQuiz } from '../services/quizGenerator'
import { notify } from '../services/toast'

const DIFFICULTY_COLORS = {
  Easy: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800' },
  Hard: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800' },
}

function QuestionCard({ question, index, onAnswer, userAnswer, showResults }) {
  const diff = DIFFICULTY_COLORS[question.difficulty] || DIFFICULTY_COLORS.Medium
  const isCorrect = userAnswer === question.correct
  const isAnswered = userAnswer !== undefined

  return (
    <div className={`bg-[#13131f] border rounded-2xl p-5 transition ${
      showResults && isAnswered
        ? isCorrect ? 'border-green-800' : 'border-red-800'
        : 'border-[#2e2e4e]'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400 font-bold text-sm">Q{index + 1}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${diff.color} ${diff.bg} ${diff.border}`}>
            {question.difficulty}
          </span>
          {question.topic && (
            <span className="text-xs bg-[#0d0d1a] text-slate-500 px-2 py-0.5 rounded-full border border-[#2e2e4e]">
              {question.topic}
            </span>
          )}
        </div>
        {showResults && isAnswered && (
          <span className="text-xl">{isCorrect ? '✅' : '❌'}</span>
        )}
      </div>

      {/* Question */}
      <p className="text-white text-sm font-medium leading-relaxed mb-4">{question.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, i) => {
          const letter = option.charAt(0)
          const isSelected = userAnswer === letter
          const isCorrectOption = question.correct === letter

          let optionStyle = 'bg-[#0d0d1a] border-[#2e2e4e] text-slate-300 hover:border-indigo-600'
          if (showResults) {
            if (isCorrectOption) optionStyle = 'bg-green-950 border-green-700 text-green-300'
            else if (isSelected && !isCorrectOption) optionStyle = 'bg-red-950 border-red-700 text-red-300'
            else optionStyle = 'bg-[#0d0d1a] border-[#1e1e2e] text-slate-500 opacity-60'
          } else if (isSelected) {
            optionStyle = 'bg-indigo-950 border-indigo-700 text-white'
          }

          return (
            <button
              key={i}
              onClick={() => !isAnswered && !showResults && onAnswer(question.id, letter)}
              disabled={isAnswered || showResults}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition ${optionStyle}`}
            >
              <span className="font-bold text-sm shrink-0">{letter}</span>
              <span className="text-sm">{option.slice(3)}</span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showResults && isAnswered && question.explanation && (
        <div className={`mt-4 rounded-xl p-3 ${isCorrect ? 'bg-green-950 border border-green-900' : 'bg-red-950 border border-red-900'}`}>
          <p className="text-xs font-semibold mb-1" style={{ color: isCorrect ? '#4ade80' : '#f87171' }}>
            {isCorrect ? '✅ Correct!' : '❌ Not quite — Correct answer: ' + question.correct}
          </p>
          <p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-200' : 'text-red-200'}`}>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  )
}

function ResultScreen({ score, total, questions, answers, onRetry }) {
  const percentage = Math.round((score / total) * 100)
  const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F'
  const gradeColor = percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-yellow-400' : 'text-red-400'

  const byTopic = {}
  questions.forEach(q => {
    if (!byTopic[q.topic]) byTopic[q.topic] = { correct: 0, total: 0 }
    byTopic[q.topic].total++
    if (answers[q.id] === q.correct) byTopic[q.topic].correct++
  })

  return (
    <div className="space-y-4">
      <div className="bg-[#13131f] border border-[#2e2e4e] rounded-2xl p-6 text-center">
        <div className="text-6xl font-black mb-2" style={{ color: percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#f59e0b' : '#ef4444' }}>
          {grade}
        </div>
        <p className="text-white text-2xl font-bold mb-1">{score}/{total} correct</p>
        <p className={`text-lg font-semibold ${gradeColor}`}>{percentage}%</p>
        <p className="text-slate-500 text-sm mt-2">
          {percentage >= 80 ? '🎉 Excellent! You really know your prototype!' :
           percentage >= 60 ? '👍 Good job! Review the missed questions.' :
           '📚 Keep studying — review the explanations below.'}
        </p>
      </div>

      {/* Topic breakdown */}
      {Object.keys(byTopic).length > 0 && (
        <div className="bg-[#13131f] border border-[#2e2e4e] rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Performance by Topic</h4>
          <div className="space-y-2">
            {Object.entries(byTopic).map(([topic, data]) => {
              const pct = Math.round((data.correct / data.total) * 100)
              const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
              return (
                <div key={topic} className="flex items-center gap-3">
                  <p className="text-slate-400 text-xs w-28 shrink-0 truncate">{topic}</p>
                  <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: pct + '%', backgroundColor: color }} />
                  </div>
                  <span className="text-xs w-12 text-right shrink-0" style={{ color }}>{data.correct}/{data.total}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <button
        onClick={onRetry}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
      >
        ↺ Try Again
      </button>
    </div>
  )
}

function PrototypeQuiz({ idea, components }) {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [mode, setMode] = useState('all')

  async function handleGenerate() {
    setLoading(true)
    setQuiz(null)
    setAnswers({})
    setSubmitted(false)
    setCurrentQ(0)
    try {
      const data = await generateQuiz(idea, components)
      setQuiz(data)
      notify.success('Quiz ready! ' + (data.questions?.length || 0) + ' questions')
    } catch {
      notify.error('Quiz generation failed — is Ollama running?')
    } finally {
      setLoading(false)
    }
  }

  function handleAnswer(questionId, letter) {
    setAnswers(prev => ({ ...prev, [questionId]: letter }))
    if (mode === 'one-by-one' && currentQ < (quiz?.questions?.length || 1) - 1) {
      setTimeout(() => setCurrentQ(prev => prev + 1), 800)
    }
  }

  function handleSubmit() {
    const unanswered = (quiz?.questions || []).filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      notify.warning(unanswered.length + ' question(s) not answered')
      return
    }
    setSubmitted(true)
  }

  function handleRetry() {
    setAnswers({})
    setSubmitted(false)
    setCurrentQ(0)
  }

  const score = submitted
    ? (quiz?.questions || []).filter(q => answers[q.id] === q.correct).length
    : 0

  const answeredCount = Object.keys(answers).length
  const totalQuestions = quiz?.questions?.length || 0

  const displayQuestions = mode === 'one-by-one'
    ? [quiz?.questions?.[currentQ]].filter(Boolean)
    : quiz?.questions || []

  return (
    <div className="space-y-4">

      {!quiz && !loading && (
        <>
          <p className="text-slate-400 text-sm">Test your knowledge about your prototype's components and circuits</p>
          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
          >
            🧠 Generate Quiz
          </button>
          <div className="text-center py-8 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
            <div className="text-5xl mb-3">🧠</div>
            <p className="text-white font-semibold mb-1">Prototype Knowledge Quiz</p>
            <p className="text-slate-500 text-sm mb-4">AI creates 8 multiple choice questions about your components</p>
            <div className="flex justify-center gap-4 text-xs text-slate-600 flex-wrap">
              <span>✓ Mixed difficulty</span>
              <span>✓ Explanations</span>
              <span>✓ Topic breakdown</span>
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 bg-[#13131f] border border-[#2e2e4e] rounded-xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">AI is writing your quiz questions...</p>
        </div>
      )}

      {quiz && !loading && (
        <>
          {submitted ? (
            <ResultScreen
              score={score}
              total={totalQuestions}
              questions={quiz.questions}
              answers={answers}
              onRetry={handleRetry}
            />
          ) : (
            <>
              {/* Quiz header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm">{quiz.quizTitle}</h3>
                  <p className="text-slate-500 text-xs">{answeredCount}/{totalQuestions} answered</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode(mode === 'all' ? 'one-by-one' : 'all')}
                    className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition"
                  >
                    {mode === 'all' ? '1️⃣ One by One' : '📋 Show All'}
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-lg text-xs transition"
                  >
                    ↺ New Quiz
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="w-full bg-[#1e1e2e] rounded-full h-2">
                <div
                  className="h-2 bg-indigo-600 rounded-full transition-all"
                  style={{ width: (answeredCount / totalQuestions * 100) + '%' }}
                />
              </div>

              {/* One-by-one navigation */}
              {mode === 'one-by-one' && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                    disabled={currentQ === 0}
                    className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition disabled:opacity-30"
                  >
                    ← Prev
                  </button>
                  <span className="text-slate-500 text-xs">{currentQ + 1} of {totalQuestions}</span>
                  <button
                    onClick={() => setCurrentQ(Math.min(totalQuestions - 1, currentQ + 1))}
                    disabled={currentQ === totalQuestions - 1}
                    className="px-4 py-2 bg-[#1e1e2e] hover:bg-[#2e2e4e] text-slate-400 rounded-xl text-xs transition disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-3">
                {displayQuestions.map((question, i) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={mode === 'one-by-one' ? currentQ : i}
                    onAnswer={handleAnswer}
                    userAnswer={answers[question.id]}
                    showResults={false}
                  />
                ))}
              </div>

              {/* Submit */}
              {mode === 'all' && (
                <button
                  onClick={handleSubmit}
                  disabled={answeredCount < totalQuestions}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                >
                  {answeredCount < totalQuestions
                    ? `Answer all questions (${totalQuestions - answeredCount} remaining)`
                    : '📊 Submit & See Results'}
                </button>
              )}

              {mode === 'one-by-one' && answeredCount === totalQuestions && (
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition"
                >
                  📊 Submit & See Results
                </button>
              )}
            </>
          )}

          {/* Show answers with explanations after submit */}
          {submitted && (
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm">Review All Questions</h3>
              {quiz.questions.map((question, i) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={i}
                  onAnswer={() => {}}
                  userAnswer={answers[question.id]}
                  showResults={true}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PrototypeQuiz