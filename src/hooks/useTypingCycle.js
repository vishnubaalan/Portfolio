import { useEffect, useState } from 'react';

/**
 * Cycles through a list of words with a typing effect.
 * @param {string[]} words
 * @param {{ typing?: number, deleting?: number, pause?: number }} [opts]
 */
export function useTypingCycle(words, opts = {}) {
  const { typing = 80, deleting = 40, pause = 1500 } = opts;
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('typing');

  useEffect(() => {
    const current = words[index];
    let timer;
    if (phase === 'typing') {
      if (text.length < current.length) {
        timer = setTimeout(() => setText(current.slice(0, text.length + 1)), typing);
      } else {
        timer = setTimeout(() => setPhase('deleting'), pause);
      }
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        timer = setTimeout(() => setText(current.slice(0, text.length - 1)), deleting);
      } else {
        setIndex((i) => (i + 1) % words.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, index, words, typing, deleting, pause]);

  return text;
}
