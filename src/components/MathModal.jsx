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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 select-none">
      <div className="bg-[#121929] border-2 border-[#54627a] rounded-xl max-w-xl w-full p-4 md:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.95)] flex flex-col max-h-[92vh]">
        
        {/* Battle Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
              ⚔️ {monster?.name?.toUpperCase() || 'HERO'} ATTACK
            </span>
            <span className="text-slate-500 text-xs">|</span>
            <span className="text-purple-300 font-mono text-xs">{problem.mobName || 'TARGET'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrimoire(!showGrimoire)}
              className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 text-[11px] font-mono rounded"
            >
              Grimoire
            </button>
            {lesson?.vocabWords && (
              <button
                onClick={() => setShowVocab(!showVocab)}
                className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-[11px] font-mono rounded"
              >
                Vocab
              </button>
            )}
          </div>
        </div>

        {/* Grimoire Accordion */}
        {showGrimoire && (
          <div className="bg-slate-950 border border-indigo-600 rounded-lg p-3 mb-3 text-xs text-indigo-200 leading-relaxed font-sans">
            <div className="text-amber-300 font-mono font-bold text-[11px] mb-1">► KEY CONCEPT FORMULA:</div>
            <p>{lesson?.keyConceptSummary}</p>
          </div>
        )}

        {/* Vocab Accordion */}
        {showVocab && lesson?.vocabWords && (
          <div className="bg-slate-950 border border-emerald-600 rounded-lg p-3 mb-3 text-xs text-emerald-200 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-2 font-sans">
            {lesson.vocabWords.map((v, i) => (
              <div key={i} className="border border-emerald-900 p-2 bg-black/40 rounded">
                <span className="text-amber-300 font-bold">[{v.term}]:</span> {v.definition}
              </div>
            ))}
          </div>
        )}

        {/* Question Slate (Crystal-clear, easy-to-read typography for 6th graders) */}
        <div className="bg-[#0b101c] border border-slate-700/80 rounded-lg p-4 mb-3 shadow-inner">
          <p className="text-slate-100 text-sm md:text-base leading-relaxed font-sans font-medium">
            {problem.prompt || problem.question}
          </p>
        </div>

        {/* Misconception Diagnostic Feedback */}
        {feedback === 'wrong' && (
          <div className="bg-rose-950/90 border border-rose-600 rounded-lg p-3 mb-3 text-xs text-rose-200 leading-relaxed font-sans">
            <div className="text-rose-300 font-mono font-bold mb-1">⚠️ MISCONCEPTION DETECTED:</div>
            {problem.misconceptionTrap && (
              <p className="mb-1 text-amber-200">
                <strong>Watch Out:</strong> {problem.misconceptionTrap}
              </p>
            )}
            {problem.hint && (
              <p className="text-slate-300">
                <strong>Hint:</strong> {problem.hint}
              </p>
            )}
          </div>
        )}

        {feedback === 'correct' && (
          <div className="bg-emerald-950 border border-emerald-500 rounded-lg p-2.5 mb-3 text-xs text-emerald-200 font-mono font-bold text-center">
            ★ CRITICAL STRIKE! ACCURACY CONFIRMED!
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
                  className={`p-3 rounded-lg border text-left text-sm font-sans font-bold flex items-center justify-between transition ${
                    selectedOption === opt
                      ? opt === problem.correctAnswer
                        ? 'bg-emerald-700 border-emerald-400 text-white'
                        : 'bg-rose-900 border-rose-500 text-white'
                      : 'bg-[#182032] hover:bg-[#222d46] border-slate-700 text-slate-100'
                  }`}
                >
                  <span className="text-amber-400 font-mono text-xs">[{String.fromCharCode(65 + idx)}]</span>
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
                  placeholder="Type exact answer (e.g. 25, 1.50)..."
                  autoFocus
                  className="flex-1 bg-black border-2 border-slate-700 focus:border-amber-400 text-amber-300 px-3 py-2 text-sm font-mono text-center outline-none rounded-lg"
                />
                <button
                  type="submit"
                  disabled={!typedInput.trim()}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-black text-xs uppercase rounded-lg shadow disabled:opacity-50"
                >
                  Strike
                </button>
              </form>

              {/* Numpad */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {['7', '8', '9', 'DEL', '4', '5', '6', 'CLR', '1', '2', '3', '.', '0', '00', '$', '%'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNumpadPress(key)}
                    className="py-1.5 bg-[#182032] hover:bg-[#24304c] border border-slate-700 text-slate-200 text-xs font-mono font-bold rounded"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
          <span>🛡️ SHIELDS: {shields}</span>
          <span className="text-slate-500">Tap [A-D] or Type and hit Enter</span>
        </div>
      </div>
    </div>
  );
}
