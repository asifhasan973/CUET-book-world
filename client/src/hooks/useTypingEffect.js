/**
 * useTypingEffect — Simulates a typewriter effect that cycles through
 * an array of strings, typing and deleting each one.
 *
 * @param {string[]} strings - Array of strings to cycle through
 * @param {Object} [options]
 * @param {number} [options.typingSpeed=80] - Milliseconds per character typed
 * @param {number} [options.deletingSpeed=40] - Milliseconds per character deleted
 * @param {number} [options.pauseDuration=2000] - Pause in ms after full string is typed
 * @returns {{ text: string, isTyping: boolean }}
 *
 * @example
 * const { text } = useTypingEffect(['Hello World', 'Welcome Back']);
 * return <h1>{text}<span className="cursor">|</span></h1>;
 */
import { useState, useEffect, useRef } from 'react';

const useTypingEffect = (
  strings = [],
  { typingSpeed = 80, deletingSpeed = 40, pauseDuration = 2000 } = {}
) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const stringIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (strings.length === 0) {
      setText('');
      return undefined;
    }

    const runTick = () => {
      const currentString = strings[stringIndex.current % strings.length] ?? '';

      if (isDeleting.current) {
        charIndex.current = Math.max(0, charIndex.current - 1);
        setText(currentString.slice(0, charIndex.current));
        setIsTyping(false);

        if (charIndex.current === 0) {
          isDeleting.current = false;
          stringIndex.current = (stringIndex.current + 1) % strings.length;
          timeoutRef.current = setTimeout(runTick, typingSpeed);
          return;
        }

        timeoutRef.current = setTimeout(runTick, deletingSpeed);
        return;
      }

      charIndex.current = Math.min(currentString.length, charIndex.current + 1);
      setText(currentString.slice(0, charIndex.current));
      setIsTyping(true);

      if (charIndex.current === currentString.length) {
        isDeleting.current = true;
        timeoutRef.current = setTimeout(runTick, pauseDuration);
        return;
      }

      timeoutRef.current = setTimeout(runTick, typingSpeed);
    };

    timeoutRef.current = setTimeout(runTick, isDeleting.current ? deletingSpeed : typingSpeed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [strings, typingSpeed, deletingSpeed, pauseDuration]);

  return { text, isTyping };
};

export default useTypingEffect;
