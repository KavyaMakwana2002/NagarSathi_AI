"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Sparkles } from "lucide-react";

export default function VoiceInput({ onTranscriptChange }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSupported(true);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!supported) {
      alert("Voice input is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Use Gujarati ("gu-IN") or fallback to Hindi/English
    recognition.lang = "gu-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        onTranscriptChange(text);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
          isListening
            ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
            : "bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700"
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5 animate-spin" />
            <span>સાંભળી રહ્યો છું... બોલો</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5" />
            <span>ગુજરાતીમાં બોલીને લખો (Mic)</span>
          </>
        )}
      </button>

      {isListening && (
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
      )}
    </div>
  );
}
