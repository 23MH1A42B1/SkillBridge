import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../auth/AuthContext';

export default function VoiceNavigator() {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { signOut } = useAuth();

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      showToast('🎙️ Listening for command...', 'info');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      handleCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error !== 'no-speech') {
          showToast('Voice recognition failed', 'error');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleCommand = (transcript) => {
    let handled = false;

    if (transcript.includes('dashboard') || transcript.includes('home')) {
      navigate('/dashboard');
      showToast(`Navigating to Dashboard ("${transcript}")`, 'success');
      handled = true;
    } else if (transcript.includes('portfolio') || transcript.includes('resume') || transcript.includes('build')) {
      navigate('/resumes');
      showToast(`Opening Portfolio ("${transcript}")`, 'success');
      handled = true;
    } else if (transcript.includes('search') || transcript.includes('job') || transcript.includes('find')) {
      navigate('/smart-search');
      showToast(`Opening AI Job Search ("${transcript}")`, 'success');
      handled = true;
    } else if (transcript.includes('tracker') || transcript.includes('application')) {
      navigate('/tracker');
      showToast(`Opening Application Tracker ("${transcript}")`, 'success');
      handled = true;
    } else if (transcript.includes('analytics') || transcript.includes('stats')) {
      navigate('/analytics');
      showToast(`Opening Analytics ("${transcript}")`, 'success');
      handled = true;
    } else if (transcript.includes('upload') || transcript.includes('new resume')) {
      navigate('/upload');
      showToast(`Opening Upload ("${transcript}")`, 'success');
      handled = true;
    } else if (transcript.includes('profile') || transcript.includes('settings')) {
      navigate('/profile');
      showToast(`Opening Profile ("${transcript}")`, 'success');
      handled = true;
    } else if (transcript.includes('sign out') || transcript.includes('logout') || transcript.includes('log out')) {
      signOut();
      showToast(`Signing out ("${transcript}")`, 'success');
      handled = true;
    }

    if (!handled) {
      showToast(`Unrecognized command: "${transcript}"`, 'error');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  if (!supported) return null;

  return (
    <button
      onClick={toggleListening}
      className={`relative p-2 rounded-xl transition-all duration-300 group ${
        isListening 
          ? 'bg-brand-500/20 shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-brand-500/50' 
          : 'bg-white/5 border border-white/10 hover:bg-white/10'
      }`}
      title="Voice Navigation (Try saying 'Go to dashboard')"
    >
      {/* Microphone Icon */}
      <svg 
        className={`w-5 h-5 ${isListening ? 'text-brand-400' : 'text-gray-400 group-hover:text-white'}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
      
      {/* Ripple Animation when listening */}
      {isListening && (
        <span className="absolute inset-0 rounded-xl rounded-full border-2 border-brand-500/50 animate-ping opacity-75"></span>
      )}
    </button>
  );
}
