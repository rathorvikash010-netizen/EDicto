import { useState, useCallback } from 'react';

/**
 * Custom hook for word pronunciation.
 * Uses Audio API when audioUrl is available, falls back to SpeechSynthesis.
 */
export default function usePronunciation() {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback((word, audioUrl) => {
    if (speaking) return;

    setSpeaking(true);

    // Try Audio API first if we have a URL
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => {
        // Fallback to SpeechSynthesis on error
        speakWithSynthesis(word);
      };
      audio.play().catch(() => {
        speakWithSynthesis(word);
      });
      return;
    }

    // Fallback: SpeechSynthesis API
    speakWithSynthesis(word);

    function speakWithSynthesis(text) {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);

        // Ensure voices are loaded
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(
          (v) => v.lang.startsWith('en') && v.name.includes('Google')
        ) || voices.find((v) => v.lang.startsWith('en'));
        if (englishVoice) utterance.voice = englishVoice;

        window.speechSynthesis.speak(utterance);
      } else {
        setSpeaking(false);
      }
    }
  }, [speaking]);

  return { speak, speaking };
}
