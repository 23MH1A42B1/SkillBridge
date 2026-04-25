import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getInterviewPrep, evaluateMockAnswer, saveInterviewSession } from '../services/interviewService';
import AppLayout from '../components/AppLayout';
import { PERSONAS, getPersona } from '../data/personas';

function TypewriterText({ text }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayed}</span>;
}

const AudioVisualizer = ({ active }) => {
  const [heights, setHeights] = useState(new Array(12).fill(4));
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!active) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      setHeights(new Array(12).fill(4));
      return;
    }

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        
        analyserRef.current.fftSize = 64;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        const update = () => {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          const newHeights = Array.from({ length: 12 }, (_, i) => {
            const val = dataArrayRef.current[i * 2] || 0;
            return Math.max(4, (val / 255) * 40);
          });
          setHeights(newHeights);
          animationRef.current = requestAnimationFrame(update);
        };
        update();
      } catch (err) {
        console.error("Audio visualizer failed:", err);
      }
    };

    initAudio();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [active]);

  return (
    <div className="flex items-center justify-center gap-1 h-12 w-full max-w-[200px]">
      {heights.map((h, i) => (
        <div 
          key={i} 
          className="w-1.5 bg-gradient-to-t from-brand-600 to-brand-400 rounded-full transition-all duration-75 shadow-neon-glow"
          style={{ 
            height: `${h}px`,
            opacity: 0.4 + (h / 40) * 0.6
          }}
        />
      ))}
    </div>
  );
};

export default function InterviewSimulator() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [mode, setMode] = useState('selector'); 
  const [selectedPersonaId, setSelectedPersonaId] = useState('mentor');
  const [chatHistory, setChatHistory] = useState([]);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  
  const [mlStatus, setMlStatus] = useState('initializing');
  const [mlProgress, setMlProgress] = useState(0);
  const [sentiment, setSentiment] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const data = await getInterviewPrep(user.uid, jobId);
      if (data) {
        const all = [...data.behavioral, ...data.technical];
        setQuestions(all);
      }
      setLoading(false);
    }
    load();

    const initVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Webcam failed:", err);
        setIsVideoOn(false);
      }
    };
    if (mode === 'simulator') initVideo();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        const current = event.results[event.results.length - 1][0].transcript;
        setTranscript(current);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }

    workerRef.current = new Worker(new URL('../services/mlWorker.js', import.meta.url), {
      type: 'module'
    });

    const onMessageReceived = (event) => {
      const msg = event.data;
      if (msg.status === 'progress') {
        if (msg.progress?.progress) setMlProgress(msg.progress.progress);
      } else if (msg.status === 'ready') {
        setMlStatus('ready');
      } else if (msg.status === 'complete') {
        setMlStatus('ready');
        if (msg.result && msg.result.length > 0) setSentiment(msg.result[0]);
      } else if (msg.status === 'error') {
        setMlStatus('error');
      }
    };

    workerRef.current.addEventListener('message', onMessageReceived);
    workerRef.current.postMessage({ type: 'init' });

    return () => {
      workerRef.current.removeEventListener('message', onMessageReceived);
      workerRef.current.terminate();
    };
  }, [user, jobId]);

  useEffect(() => {
    if (transcript && transcript.length > 15 && workerRef.current && mlStatus === 'ready') {
      workerRef.current.postMessage({ type: 'analyze', text: transcript });
    }
  }, [transcript, mlStatus]);

  const speak = (text) => {
    synthRef.current.cancel();
    const utter = new SpeechUtterance(text);
    utter.rate = 0.9;
    utter.pitch = 1;
    synthRef.current.speak(utter);
  };

  const startQuestion = () => {
    const q = questions[currentIndex].question;
    speak(q);
    setTranscript('');
    setFeedback(null);
    setSentiment(null);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleEvaluate = async () => {
    if (!transcript) return;
    setEvaluating(true);
    
    const newHistory = [
      ...chatHistory,
      { role: 'assistant', content: questions[currentIndex].question },
      { role: 'user', content: transcript }
    ];

    try {
      const result = await evaluateMockAnswer(
        questions[currentIndex].question, 
        transcript, 
        "Software Engineer", 
        selectedPersonaId,
        newHistory
      );
      
      // Add Mock Video Metrics
      result.videoMetrics = {
        confidence: Math.round(75 + Math.random() * 20),
        eyeContact: Math.round(60 + Math.random() * 30),
        toneStability: Math.round(80 + Math.random() * 15)
      };
      
      setFeedback(result);
      setChatHistory(newHistory);

      if (result && user) {
        saveInterviewSession(user.uid, 'Software Engineer', questions[currentIndex].question, transcript, result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTranscript('');
      setFeedback(null);
    } else {
      alert("Mock Interview Complete! Great job 🚀");
      navigate(`/dashboard`);
    }
  };

  if (loading) return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white font-black uppercase tracking-[0.2em] animate-pulse">Initializing Simulator...</div>;

  const activePersona = getPersona(selectedPersonaId);

  if (mode === 'selector') {
    return (
      <AppLayout>
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-white tracking-tight mb-4">Choose Your Interviewer</h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">Different personas will test you in different ways. Choose the one that matches your preparation goals.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {PERSONAS.map(p => (
            <button 
              key={p.id}
              onClick={() => setSelectedPersonaId(p.id)}
              className={`p-8 rounded-[2.5rem] border-2 text-left transition-all group relative overflow-hidden ${selectedPersonaId === p.id ? `border-brand-500 bg-brand-500/5` : 'border-white/5 bg-dark-card hover:border-white/10'}`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${p.color} opacity-10 blur-3xl`} />
              <div className="text-5xl mb-6">{p.avatar}</div>
              <h3 className="text-xl font-black text-white mb-1">{p.name}</h3>
              <p className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-4">{p.role}</p>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">{p.description}</p>
              
              <div className={`h-1.5 w-full bg-white/5 rounded-full overflow-hidden`}>
                <div className={`h-full bg-gradient-to-r ${p.color} transition-all duration-500 ${selectedPersonaId === p.id ? 'w-full' : 'w-0'}`} />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button 
            onClick={() => setMode('simulator')}
            className="btn-primary px-12 py-4 rounded-full shadow-neon-glow text-lg font-black uppercase tracking-widest"
          >
            Start Interview with {activePersona.name} →
          </button>
        </div>
      </AppLayout>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <AppLayout>
        
        <div className="w-full mb-12 flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Question {currentIndex + 1} of {questions.length}</span>
           <div className="flex gap-1">
             {questions.map((_, i) => (
               <div key={i} className={`w-8 h-1 rounded-full ${i === currentIndex ? 'bg-brand-500' : i < currentIndex ? 'bg-green-500/50' : 'bg-white/10'}`} />
             ))}
           </div>
        </div>

         <div className={`mb-12 relative flex flex-col items-center ${activePersona.theme} p-10 rounded-[3rem] border border-white/5 overflow-hidden`}>
           {/* Background Video/Interviewer */}
           <div className="absolute inset-0 opacity-10 bg-slate-900">
             {isVideoOn ? (
               <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale blur-sm" />
             ) : (
               <div className="w-full h-full bg-slate-800" />
             )}
           </div>

           <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center bg-dark-card shadow-2xl transition-all duration-500 z-10
             ${isListening ? 'border-brand-500 scale-110 shadow-brand-500/30' : 'border-white/10'}`}>
              <span className="text-4xl">{activePersona.avatar}</span>
           </div>
           
           <h2 className="mt-4 text-xl font-black text-white z-10">{activePersona.name}</h2>
           <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] z-10">{activePersona.role}</p>
           
           <div className="mt-6 h-12 flex items-center justify-center z-10 w-full">
             <AudioVisualizer active={isListening} />
           </div>

           {/* Personal Webcam Preview */}
           <div className="absolute top-6 right-6 w-32 h-20 rounded-2xl border border-white/20 bg-slate-900 shadow-2xl overflow-hidden z-20">
             {isVideoOn ? (
               <video 
                 ref={videoRef} 
                 autoPlay 
                 muted 
                 playsInline 
                 className="w-full h-full object-cover transform scale-x-[-1]" 
               />
             ) : (
               <div className="flex items-center justify-center h-full text-[10px] text-gray-500 font-bold uppercase">Camera Off</div>
             )}
           </div>

           {isListening && <div className="absolute -bottom-10 bg-brand-500 text-white text-[8px] font-black uppercase px-3 py-1.5 rounded shadow-lg animate-pulse z-10">Listening...</div>}
        </div>

        <div className="w-full bg-dark-card border border-white/5 p-10 rounded-[3rem] text-center shadow-2xl mb-8 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-30 group-hover:opacity-100 transition-opacity" />
           <p className="text-2xl font-black text-white leading-tight mb-8">
             {currentQ?.question}
           </p>
           <button 
             onClick={startQuestion}
             className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 hover:text-brand-300 transition-colors"
           >
             🔊 Re-play AI Voice
           </button>
        </div>

        <div className="w-full bg-white/[0.02] border border-white/5 p-8 rounded-3xl min-h-[120px] mb-4 flex flex-col items-center justify-center">
           {transcript ? (
             <p className="text-lg text-gray-400 font-medium italic">"{transcript}"</p>
           ) : (
             <p className="text-sm text-gray-600 font-bold uppercase tracking-widest">Your answer will appear here...</p>
           )}
        </div>

        <div className="w-full bg-dark-card border border-brand-500/10 p-6 rounded-3xl mb-8 shadow-xl">
           <div className="flex justify-between items-center mb-4">
             <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
               Live AI Tone Analysis (Transformers.js)
             </h4>
             <span className="text-[10px] font-bold text-gray-500 uppercase">
               {mlStatus === 'initializing' ? `Loading Local ML Model (${Math.round(mlProgress)}%)` : mlStatus === 'ready' ? 'Active (Private & Local)' : mlStatus}
             </span>
           </div>
           
           <div className="relative w-full h-4 bg-dark-bg rounded-full overflow-hidden border border-white/5">
             {sentiment && (
               <div 
                 className={`absolute top-0 left-0 h-full transition-all duration-500 ${sentiment.label === 'POSITIVE' ? 'bg-green-500' : 'bg-red-500'}`}
                 style={{ width: `${sentiment.score * 100}%` }}
               />
             )}
             {!sentiment && mlStatus === 'ready' && (
               <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[8px] text-gray-600 font-bold uppercase">
                 Start speaking to analyze tone...
               </div>
             )}
             {mlStatus === 'initializing' && (
               <div 
                 className="absolute top-0 left-0 h-full bg-brand-500/30 transition-all duration-300"
                 style={{ width: `${mlProgress}%` }}
               />
             )}
           </div>
           {sentiment && (
             <div className="mt-2 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">
               {sentiment.label === 'POSITIVE' ? 'Confident / Positive' : 'Hesitant / Negative'} ({Math.round(sentiment.score * 100)}%)
             </div>
           )}
        </div>

        <div className="flex gap-4 w-full">
           <button 
             onClick={toggleListening}
             className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
               ${isListening ? 'bg-red-500 shadow-red-500/20 text-white' : 'bg-brand-600 shadow-brand-500/20 text-white hover:bg-brand-700'}`}
           >
             {isListening ? '🛑 Stop Recording' : '🎤 Start Answering'}
           </button>
           
           {transcript && !feedback && (
             <button 
               onClick={handleEvaluate}
               disabled={evaluating}
               className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all disabled:opacity-50"
             >
               {evaluating ? '🧠 Evaluating...' : '✨ Get AI Feedback'}
             </button>
           )}

           {feedback && (
             <button 
               onClick={nextQuestion}
               className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-green-700 transition-all"
             >
               Next Question →
             </button>
           )}
        </div>

        {feedback && (
          <div className="w-full mt-12 animate-slide-up">
            <div className="bg-gradient-to-br from-indigo-900/40 to-dark-card border border-indigo-500/20 p-8 rounded-[2.5rem]">
               <div className="flex justify-between items-start mb-6">
                  <h4 className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em]">AI Feedback</h4>
                  <div className="text-2xl font-black text-white">Score: {feedback.score}/10</div>
               </div>
               <p className="text-gray-300 leading-relaxed mb-6 font-medium">
                 <TypewriterText text={feedback.feedback} />
               </p>
               <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 mb-4">
                  <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Top Tip</p>
                  <p className="text-sm text-white font-bold"><TypewriterText text={feedback.improvement} /></p>
               </div>
               {feedback.suggestedFollowUp && (
                 <div className="bg-brand-500/10 p-4 rounded-xl border border-brand-500/20 italic mb-6">
                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">AI Follow-up Question</p>
                    <p className="text-sm text-brand-300 font-bold">"{feedback.suggestedFollowUp}"</p>
                 </div>
               )}
                {feedback.videoMetrics && (
                  <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">Confidence</p>
                      <div className="text-xl font-black text-green-400">{feedback.videoMetrics.confidence}%</div>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">Eye Contact</p>
                      <div className="text-xl font-black text-brand-400">{feedback.videoMetrics.eyeContact}%</div>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">Tone Stability</p>
                      <div className="text-xl font-black text-indigo-400">{feedback.videoMetrics.toneStability}%</div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

    </AppLayout>
  );
}
