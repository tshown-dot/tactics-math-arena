import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';

export default function MathModal({
  problem,
  lesson,
  monster,
  shields,
  isOpen,
  onSolve,
  onMistake,
  onClose
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [typedInput, setTypedInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showVocab, setShowVocab] = useState(false);
  const [showGrimoire, setShowGrimoire] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setTypedInput('');
    setFeedback(null);
    setShowVocab(false);
  }, [problem]);

  if (!isOpen || !problem) return null;

  const isMinion = problem.type === 'minion';

  const checkAnswer = (candidate) => {
    const rawClean = String(candidate).trim().replace(/[$,%]/g, '');
    const correctClean = String(problem.correctAnswer).trim().replace(/[$,%]/g, '');

    if (rawClean === correctClean) return true;

    if (problem.acceptableAnswers) {
      return problem.acceptableAnswers.some(ans => {
        const c = String(ans).trim().replace(/[$,%]/g, '');
        return c === rawClean;
      });
    }

    const numCand = parseFloat(rawClean);
    const numCorr = parseFloat(correctClean);
    if (!isNaN(numCand) && !isNaN(numCorr) && Math.abs(numCand - numCorr) < 0.001) {
      return true;
    }

    return false;
  };

  const handleSelectOption = (opt) => {
    if (feedback === 'correct') return;
    setSelectedOption(opt);
    handleSubmit(opt);
  };

  const handleSubmit = (ansToTest = typedInput) => {
    if (!ansToTest && ansToTest !== 0) return;

    const isCorrect = checkAnswer(ansToTest);

    if (isCorrect) {
      sound.hit();
      setFeedback('correct');
      setTimeout(() => {
        onSolve(problem);
      }, 750);
    } else {
      sound.shieldBreak();
      setFeedback('wrong');
      onMistake(problem);
    }
  };

  const handleNumpadPress = (char) => {
    if (char === 'CLR') {
      setTypedInput('');
    } else if (char === 'DEL') {
      setTypedInput(prev => prev.slice(0, -1));
    } else {
      setTypedInput(prev => prev + char);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 md:p-4 select-none">
      <div className="fft-box max-w-2xl w-full p-4 md:p-6 shadow-[0_0_50px_rgba(0,0,0,0.95)] flex flex-col max-h-[92vh]">
        
        {/* Battle Dialog Banner */}
        <div className="flex items-center justify-between border-b-2 border-amber-500/80 pb-2.5 mb-3 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-bold tracking-wider">
              ► {monster?.name?.toUpperCase() || 'HERO'} [STRIKE]
            </span>
            <span className="text-slate-400">vs</span>
            <span className="text-purple-300 font-bold">{problem.mobName || 'TARGET'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrimoire(!showGrimoire)}
              className="px-2 py-1 bg-indigo-900 border border-indigo-500 text-indigo-200 text-[9px] hover:bg-indigo-800"
            >
              GRIMOIRE
            </button>
            {lesson?.vocabWords && (
              <button
                onClick={() => setShowVocab(!showVocab)}
                className="px-2 py-1 bg-emerald-900 border border-emerald-500 text-emerald-200 text-[9px] hover:bg-emerald-800"
              >
                VOCAB
              </button>
            )}
          </div>
        </div>

        {/* Grimoire Accordion */}
        {showGrimoire && (
          <div className="bg-slate-950 border-2 border-indigo-500 p-3 mb-3 text-[9px] text-indigo-200 leading-relaxed">
            <div className="text-amber-300 font-bold mb-1">► KEY CONCEPT REFERENCE:</div>
            <p>{lesson?.keyConceptSummary}</p>
          </div>
        )}

        {/* Vocab Accordion */}
        {showVocab && lesson?.vocabWords && (
          <div className="bg-slate-950 border-2 border-emerald-500 p-3 mb-3 text-[9px] text-emerald-200 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-2">
            {lesson.vocabWords.map((v, i) => (
              <div key={i} className="border border-emerald-800/80 p-1.5 bg-black/50">
                <span className="text-amber-300 font-bold">[{v.term}]:</span> {v.definition}
              </div>
            ))}
          </div>
        )}

        {/* Question Slate */}
        <div className="bg-black/90 border-2 border-slate-700 p-4 mb-4 shadow-inner">
          <p className="text-slate-100 text-xs md:text-sm leading-relaxed font-mono font-semibold">
            {problem.prompt || problem.question}
          </p>
        </div>

        {/* Misconception Diagnostic Feedback */}
        {feedback === 'wrong' && (
          <div className="fft-box-danger p-3 mb-3 text-[9px] text-rose-200 leading-relaxed animate-in shake">
            <div className="text-rose-300 font-bold mb-1">⚠️ TACTICAL WARNING (MISTAKE DETECTED):</div>
            {problem.misconceptionTrap && (
              <p className="mb-1 text-amber-200">
                <strong>TRAP:</strong> {problem.misconceptionTrap}
              </p>
            )}
            {problem.hint && (
              <p className="text-slate-300">
                <strong>HINT:</strong> {problem.hint}
              </p>
            )}
          </div>
        )}

        {feedback === 'correct' && (
          <div className="bg-emerald-950 border-2 border-emerald-400 p-2.5 mb-3 text-[10px] text-emerald-200 font-bold text-center">
            ★ CRITICAL STRIKE! FORMULA MASTERED!
          </div>
        )}

        {/* Input Controls */}
        <div className="mt-auto">
          {isMinion && problem.options ? (
            <div className="grid grid-cols-2 gap-2.5">
              {problem.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={feedback === 'correct'}
                  className={`fft-btn p-3 text-left text-xs md:text-sm font-bold flex items-center justify-between ${
                    selectedOption === opt
                      ? opt === problem.correctAnswer
                        ? 'bg-emerald-700 border-emerald-400 text-white'
                        : 'bg-rose-900 border-rose-500 text-white'
                      : ''
                  }`}
                >
                  <span className="text-amber-400 text-[10px]">[{String.fromCharCode(65 + idx)}]</span>
                  <span className="flex-1 text-center font-mono">{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder="ENTER VALUE..."
                  autoFocus
                  className="flex-1 bg-black border-2 border-slate-700 focus:border-amber-400 text-amber-300 px-3 py-2 text-sm md:text-base font-mono text-center outline-none"
                />
                <button
                  type="submit"
                  disabled={!typedInput.trim()}
                  className="fft-btn-gold px-5 py-2 text-xs font-black disabled:opacity-50"
                >
                  STRIKE
                </button>
              </form>

              {/* Retro Keypad */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {['7', '8', '9', 'DEL', '4', '5', '6', 'CLR', '1', '2', '3', '.', '0', '00', '$', '%'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNumpadPress(key)}
                    className="fft-btn py-2 text-[10px] md:text-xs font-mono font-bold"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 text-[8px] text-slate-400 flex items-center justify-between">
          <span>SHIELDS REMAINING: {shields}</span>
          <span>SELECT [A-D] OR TYPE & HIT ENTER</span>
        </div>
      </div>
    </div>
  );
}
