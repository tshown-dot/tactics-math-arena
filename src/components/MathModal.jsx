import React, { useState, useEffect } from 'react';
import { HelpCircle, BookOpen, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
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
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [showVocab, setShowVocab] = useState(false);
  const [showGrimoire, setShowGrimoire] = useState(false);

  useEffect(() => {
    // Reset state on problem change
    setSelectedOption(null);
    setTypedInput('');
    setFeedback(null);
    setShowVocab(false);
  }, [problem]);

  if (!isOpen || !problem) return null;

  const isMinion = problem.type === 'minion';

  // Normalize check for equivalent answers ($15, 15, 15.00, etc.)
  const checkAnswer = (candidate) => {
    const rawClean = String(candidate).trim().replace(/[$,%]/g, '');
    const correctClean = String(problem.correctAnswer).trim().replace(/[$,%]/g, '');

    if (rawClean === correctClean) return true;

    // Check optional acceptableAnswers array
    if (problem.acceptableAnswers) {
      return problem.acceptableAnswers.some(ans => {
        const c = String(ans).trim().replace(/[$,%]/g, '');
        return c === rawClean;
      });
    }

    // Number float equivalence check
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
      }, 900);
    } else {
      sound.shieldBreak();
      setFeedback('wrong');
      onMistake(problem);
    }
  };

  const handleNumpadPress = (char) => {
    if (char === 'CLEAR') {
      setTypedInput('');
    } else if (char === 'BACK') {
      setTypedInput(prev => prev.slice(0, -1));
    } else {
      setTypedInput(prev => prev + char);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚔️</span>
            <div>
              <h3 className="font-bold text-amber-400 text-sm md:text-base tracking-wide uppercase">
                {problem.mobName || 'Arena Target'}
              </h3>
              <p className="text-xs text-slate-400">{lesson?.title || 'Math Challenge'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Grimoire Reference Button */}
            <button
              onClick={() => setShowGrimoire(!showGrimoire)}
              className="px-2.5 py-1 text-xs font-semibold bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 rounded-lg border border-indigo-700/60 flex items-center gap-1.5 transition"
              title="Open Concept Grimoire"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grimoire</span>
            </button>

            {/* Vocab helper */}
            {lesson?.vocabWords && lesson.vocabWords.length > 0 && (
              <button
                onClick={() => setShowVocab(!showVocab)}
                className="px-2.5 py-1 text-xs font-semibold bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded-lg border border-emerald-700/60 flex items-center gap-1.5 transition"
                title="Vocab Hints"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Vocab</span>
              </button>
            )}
          </div>
        </div>

        {/* Grimoire Accordion */}
        {showGrimoire && (
          <div className="bg-indigo-950/90 border-b border-indigo-800/80 p-4 text-xs text-indigo-100 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Lesson Key Concept
              </span>
              <button onClick={() => setShowGrimoire(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <p className="leading-relaxed bg-black/40 p-2.5 rounded-lg border border-indigo-800/50">
              {lesson?.keyConceptSummary}
            </p>
          </div>
        )}

        {/* Vocab Helper Accordion */}
        {showVocab && lesson?.vocabWords && (
          <div className="bg-emerald-950/90 border-b border-emerald-800/80 p-4 text-xs text-emerald-100 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-300 uppercase tracking-wider">Lesson Vocabulary</span>
              <button onClick={() => setShowVocab(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {lesson.vocabWords.map((v, i) => (
                <div key={i} className="bg-black/40 p-2 rounded border border-emerald-800/40">
                  <span className="font-bold text-amber-300">{v.term}:</span> {v.definition}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problem Card Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Question Stem */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 shadow-inner">
            <p className="text-slate-100 text-base md:text-lg font-medium leading-relaxed">
              {problem.prompt || problem.question}
            </p>
          </div>

          {/* Remediation / Teachable Moment Feedback Alert */}
          {feedback === 'wrong' && (
            <div className="bg-rose-950/90 border-2 border-rose-600 rounded-xl p-4 text-rose-100 animate-in shake">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-xs md:text-sm">
                  <p className="font-bold text-rose-300">
                    Shield absorbed the attack! Review the concept:
                  </p>
                  {problem.misconceptionTrap && (
                    <p className="text-rose-200 bg-black/40 p-2 rounded border border-rose-800/60">
                      💡 <strong>Watch Out:</strong> {problem.misconceptionTrap}
                    </p>
                  )}
                  {problem.hint && (
                    <p className="text-slate-300">
                      <strong>Hint:</strong> {problem.hint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {feedback === 'correct' && (
            <div className="bg-emerald-950/90 border-2 border-emerald-500 rounded-xl p-3.5 text-emerald-100 flex items-center gap-2.5 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-xs md:text-sm font-semibold">
                Critical Strike! {problem.explanation || 'Mathematical mastery unlocked!'}
              </p>
            </div>
          )}

          {/* Input Method: 4 Arcade Buttons (Minions) vs Number Pad (Elites / Bosses) */}
          {isMinion && problem.options ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {problem.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={feedback === 'correct'}
                  className={`p-3.5 md:p-4 rounded-xl border-2 font-bold text-base md:text-lg transition-all active:scale-95 shadow-md flex items-center justify-between ${
                    selectedOption === opt
                      ? opt === problem.correctAnswer
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-rose-700 border-rose-500 text-white'
                      : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 hover:border-amber-400 text-slate-100'
                  }`}
                >
                  <span className="text-amber-400 text-xs font-mono px-2 py-0.5 bg-black/40 rounded">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-center font-mono">{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            /* Direct Number Pad / Keyboard Entry */
            <div className="space-y-3 pt-1">
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
                  placeholder="Enter exact value (e.g. 25, 1.50)..."
                  autoFocus
                  className="flex-1 bg-black/60 border-2 border-slate-700 focus:border-amber-400 text-slate-100 px-4 py-3 rounded-xl text-lg font-mono tracking-wider outline-none text-center"
                />
                <button
                  type="submit"
                  disabled={!typedInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl border-2 border-amber-300 shadow-lg active:scale-95 transition flex items-center gap-1.5"
                >
                  <span>Strike</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* On-Screen Touch Numpad for Chromebooks */}
              <div className="grid grid-cols-4 gap-1.5 pt-2">
                {['7', '8', '9', 'BACK', '4', '5', '6', 'CLEAR', '1', '2', '3', '.', '0', '00', '$', '%'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNumpadPress(key)}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:bg-slate-600 text-slate-200 font-mono font-bold rounded-lg text-sm transition shadow"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 px-5 py-2.5 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span>🛡️ Shields Left:</span>
            <span className="font-bold text-amber-400">{shields}</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Press [1-4] or type and hit Enter
          </span>
        </div>
      </div>
    </div>
  );
}
