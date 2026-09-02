import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Check, Home, Video, Volume2, Globe, Sparkles, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { planAPI } from '../api/services';

export default function ExercisePage() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [nextId, setNextId] = useState(null);
  const [dayCompleted, setDayCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef(null);

  // AI Camera & Voice Coach State
  const [cameraActive, setCameraActive] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('hi'); // en, hi
  const [coachGender, setCoachGender] = useState('female'); // male, female
  const [mimicScore, setMimicScore] = useState(85);
  const [postureAlert, setPostureAlert] = useState('');
  const [caloriesCounter, setCaloriesCounter] = useState(0);
  const [motionIntensity, setMotionIntensity] = useState('Stable');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const lastSpeachTimeRef = useRef(0);

  const speakGuide = useCallback((text, lang, gender) => {
    const now = Date.now();
    // Throttle voice alerts to prevent overlapping speak sounds
    if (now - lastSpeachTimeRef.current < 4000) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      
      // Attempt gender matching
      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = null;
      if (lang === 'hi') {
        matchedVoice = voices.find((v) => v.lang.startsWith('hi'));
      } else {
        matchedVoice = voices.find((v) => 
          gender === 'male' 
            ? v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('google')
            : v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('google')
        );
      }
      if (matchedVoice) utterance.voice = matchedVoice;
      
      utterance.pitch = gender === 'male' ? 0.85 : 1.15;
      utterance.rate = 0.95;
      
      window.speechSynthesis.speak(utterance);
      lastSpeachTimeRef.current = now;
    }
  }, []);

  const applyNavigation = useCallback((data) => {
    setNextId(data.next_exercise_id ?? null);
    setDayCompleted(!!data.day_completed);
    if (data.is_current_completed) setCompleted(true);
  }, []);

  const loadNavigation = useCallback(async (id) => {
    try {
      const { data } = await planAPI.getExerciseNavigation(id);
      applyNavigation(data);
    } catch {
      /* ignore */
    }
  }, [applyNavigation]);

  useEffect(() => {
    setRunning(false);
    setCompleted(false);
    setNextId(null);
    setDayCompleted(false);
    setCameraActive(false);
    setPostureAlert('');
    clearInterval(intervalRef.current);

    planAPI.getExercise(exerciseId).then((r) => {
      setExercise(r.data);
      setTimeLeft(r.data.duration_seconds);
      setCaloriesCounter(r.data.calories_burned);
      setCompleted(!!r.data.is_completed);
      loadNavigation(r.data.id);
    }).catch(() => {});

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [exerciseId, loadNavigation]);

  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const handleComplete = useCallback(async () => {
    if (!exercise || saving) return;
    setRunning(false);
    setSaving(true);
    const duration = Math.max(1, exercise.duration_seconds - timeLeftRef.current);
    try {
      const { data } = await planAPI.completeExercise(exercise.id, duration);
      setCompleted(true);
      setNextId(data.next_exercise_id ?? null);
      setDayCompleted(!!data.day_completed);
      
      // Play completion audio
      const completeTxt = voiceLanguage === 'hi' ? 'बहुत बढ़िया! योग आसन पूरा हुआ!' : 'Excellent! Pose completed successfully!';
      speakGuide(completeTxt, voiceLanguage, coachGender);
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not save progress');
    } finally {
      setSaving(false);
    }
  }, [exercise, saving, voiceLanguage, coachGender, speakGuide]);

  // Manage pose timer ticks
  useEffect(() => {
    if (!running) return undefined;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleComplete();
          return 0;
        }
        
        // Randomly simulate real-time posture check warning alerts while pose is running
        if (cameraActive && t % 10 === 0) {
          const alertsHi = ['Back straight karo', 'Hands upar uthao', 'Relax karein'];
          const alertsEn = ['Keep your back straight', 'Raise your arms up', 'Relax and breathe'];
          const matchPercent = Math.floor(Math.random() * 20) + 78;
          setMimicScore(matchPercent);

          let triggerIdx = Math.floor(Math.random() * 3);
          
          // Trigger speech synthesis
          if (triggerIdx === 0) {
            setPostureAlert(voiceLanguage === 'hi' ? 'कमर सीधी रखें' : 'Keep your back straight');
            speakGuide(voiceLanguage === 'hi' ? 'Back straight karo' : 'Keep your back straight', voiceLanguage, coachGender);
          } else if (triggerIdx === 1) {
            setPostureAlert(voiceLanguage === 'hi' ? 'हाथ ऊपर उठाएं' : 'Raise your hands up');
            speakGuide(voiceLanguage === 'hi' ? 'Hands upar uthao' : 'Raise your hands up', voiceLanguage, coachGender);
          } else {
            setPostureAlert('');
            speakGuide(voiceLanguage === 'hi' ? 'साँस अंदर लें' : 'Inhale and hold', voiceLanguage, coachGender);
          }
        }
        
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, handleComplete, cameraActive, voiceLanguage, coachGender, speakGuide]);

  // MediaPipe / Webcam logic
  const startWebcam = async () => {
    setModelLoading(true);
    setCameraActive(true);
    setPostureAlert('');
    
    // Announce voice coaching startup
    const startTxt = voiceLanguage === 'hi' ? 'योग शुरू करें, साँस अंदर लें' : 'Get ready for pose, breathe in';
    speakGuide(startTxt, voiceLanguage, coachGender);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      // Simulate drawing Guide skeleton overlay on canvas
      setTimeout(() => {
        drawSimulatedSkeleton();
      }, 500);
    } catch (err) {
      console.warn('Webcam not active', err);
    } finally {
      setModelLoading(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const drawSimulatedSkeleton = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId;
    const render = () => {
      if (!streamRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw ghost guiding target skeleton (blue)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(120, 80); ctx.lineTo(120, 180); // Spine
      ctx.moveTo(80, 110); ctx.lineTo(160, 110); // Shoulders
      ctx.moveTo(80, 110); ctx.lineTo(60, 60);   // Left Arm
      ctx.moveTo(160, 110); ctx.lineTo(180, 60); // Right Arm
      ctx.moveTo(90, 180); ctx.lineTo(80, 260);  // Left Leg
      ctx.moveTo(150, 180); ctx.lineTo(160, 260); // Right Leg
      ctx.stroke();

      // Draw user's detected skeleton (green/yellow based on correction alert)
      ctx.strokeStyle = postureAlert ? 'rgba(234, 179, 8, 0.8)' : 'rgba(34, 197, 94, 0.9)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      // Head
      ctx.arc(120, 50, 15, 0, Math.PI * 2);
      // Torso
      ctx.moveTo(120, 65); ctx.lineTo(120, 175);
      // Arms
      ctx.moveTo(85, 100); ctx.lineTo(155, 100);
      ctx.moveTo(85, 100); ctx.lineTo(62, 55 + (postureAlert ? 15 : 0));
      ctx.moveTo(155, 100); ctx.lineTo(178, 55);
      // Legs
      ctx.moveTo(95, 175); ctx.lineTo(82, 255);
      ctx.moveTo(145, 175); ctx.lineTo(158, 255);
      ctx.stroke();

      frameId = requestAnimationFrame(render);
    };
    render();
  };

  const goToNext = () => {
    if (nextId) {
      navigate(`/exercise/${nextId}`, { replace: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (dayCompleted) {
      navigate('/challenge');
    }
  };

  if (!exercise) {
    return (
      <DashboardLayout>
        <div className="skeleton h-96 max-w-2xl mx-auto" />
      </DashboardLayout>
    );
  }

  const progress = ((exercise.duration_seconds - timeLeft) / exercise.duration_seconds) * 100;
  const circumference = 2 * Math.PI * 90;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Main pose console column */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
              <div className="relative">
                <img src={exercise.image_url} alt={exercise.name} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-6 right-6 text-white flex justify-between items-end">
                  <div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-violet-600 uppercase">
                      {exercise.difficulty}
                    </span>
                    <h1 className="text-2xl font-bold mt-2">{exercise.name}</h1>
                    <p className="text-xs text-slate-300 mt-1">
                      Target: {exercise.duration_seconds}s hold • Calorie rate: {exercise.calories_burned} kcal
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Timer radial circle */}
                <div className="flex justify-center">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
                      <circle cx="96" cy="96" r="90" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="8" />
                      <motion.circle
                        cx="96" cy="96" r="90" fill="none"
                        stroke="url(#timerGrad)" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
                        transition={{ duration: 0.3 }}
                      />
                      <defs>
                        <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{timeLeft}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">seconds</span>
                    </div>
                  </div>
                </div>

                {/* Main Action Controllers */}
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  {!completed && (
                    <>
                      <button
                        type="button"
                        onClick={() => setRunning(!running)}
                        className="btn-primary flex items-center justify-center gap-2 px-8"
                        disabled={saving}
                      >
                        {running ? <><Pause className="w-5 h-5" /> Pause Session</> : <><Play className="w-5 h-5" /> Start Pose</>}
                      </button>
                      <button
                        type="button"
                        onClick={handleComplete}
                        className="btn-secondary flex items-center justify-center gap-2 px-8"
                        disabled={saving}
                      >
                        <Check className="w-5 h-5" /> {saving ? 'Saving...' : 'Complete Pose'}
                      </button>
                    </>
                  )}
                  {completed && (
                    <>
                      {nextId ? (
                        <button type="button" onClick={goToNext} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
                          <SkipForward className="w-5 h-5" /> Next Pose
                        </button>
                      ) : dayCompleted ? (
                        <button type="button" onClick={() => navigate('/challenge')} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
                          <Home className="w-5 h-5" /> Session Done — Back to Calendar
                        </button>
                      ) : null}
                    </>
                  )}
                </div>

                {/* Voice Coach Settings */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-violet-500" />
                    <span className="text-xs font-bold text-slate-500">AI Voice Coach:</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVoiceLanguage(voiceLanguage === 'hi' ? 'en' : 'hi')}
                      className="px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 hover:bg-slate-500/5"
                    >
                      <Globe className="w-3.5 h-3.5" /> Language: {voiceLanguage === 'hi' ? 'Hindi / Hindi' : 'English / English'}
                    </button>
                    <select
                      value={coachGender}
                      onChange={(e) => setCoachGender(e.target.value)}
                      className="px-2 py-1 rounded-lg border text-xs font-semibold bg-transparent"
                    >
                      <option value="female">Female Trainer Voice</option>
                      <option value="male">Male Trainer Voice</option>
                    </select>
                  </div>
                </div>

                <AnimatePresence>
                  {completed && (
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center text-teal-500 font-bold mt-2"
                    >
                      ⭐ Great job! Pose complete. Earned +20 XP!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Pose text instructions */}
            <div className="glass-card p-6 space-y-4">
              <Section title="Instructions" content={exercise.instructions} />
              <Section title="Steps" content={exercise.steps} pre />
              <Section title="Benefits" content={exercise.benefits} />
              <Section title="Common Mistakes" content={exercise.common_mistakes} />
            </div>
          </div>

          {/* AI Yoga Trainer Camera Console Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2 text-violet-600 dark:text-violet-400">
                  <Video className="w-5.5 h-5.5" /> AI Pose Detector & Overlay
                </h3>
                {!cameraActive ? (
                  <button onClick={startWebcam} className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Enable AI Camera
                  </button>
                ) : (
                  <button onClick={stopWebcam} className="btn-secondary py-1.5 px-4 text-xs font-bold">
                    Disable Camera
                  </button>
                )}
              </div>

              {cameraActive ? (
                <div className="space-y-4 animate-fadeIn">
                  {/* Camera screen container */}
                  <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                    {modelLoading ? (
                      <p className="text-xs text-slate-400">Loading pose networks...</p>
                    ) : (
                      <>
                        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
                        <canvas ref={canvasRef} width="240" height="300" className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]" />
                      </>
                    )}

                    {/* Alert banner overlay */}
                    {postureAlert && (
                      <div className="absolute top-3 left-3 right-3 py-2 px-3 bg-yellow-500 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md">
                        <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                        <span>Posture Alert: {postureAlert}</span>
                      </div>
                    )}
                  </div>

                  {/* Real-time metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-500/5 rounded-2xl">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Mimic guide score</span>
                      <span className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                        {mimicScore}%
                      </span>
                    </div>

                    <div className="p-4 bg-slate-500/5 rounded-2xl">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Movement Burn Rate</span>
                      <span className="text-2xl font-bold text-orange-500 mt-1">
                        {Math.round(caloriesCounter)} kcal
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 bg-slate-500/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <Video className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="font-semibold text-sm">Webcam Trainer is Inactive</p>
                  <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1">
                    Turn on the webcam to unlock skeleton guides, real-time posture adjustments, and voice alerts.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

function Section({ title, content, pre }) {
  return (
    <div>
      <h3 className="font-semibold text-violet-600 dark:text-violet-400 mb-2">{title}</h3>
      {pre ? (
        <pre className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-sans">{content}</pre>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-400">{content}</p>
      )}
    </div>
  );
}
