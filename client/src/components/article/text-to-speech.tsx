import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  RotateCcw,
  Languages,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingAudioPlayer } from "./floating-audio-player";

interface TextToSpeechProps {
  text: string;
  className?: string;
}

interface Voice {
  voice: SpeechSynthesisVoice;
  lang: string;
  label: string;
}

interface VoiceOption {
  voice: SpeechSynthesisVoice;
  displayName: string;
}

// Utility function to check browser capabilities
const checkBrowserSupport = () => {
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isEdge = /Edg/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  
  return {
    speechSynthesis: 'speechSynthesis' in window,
    pauseResume: isChrome || isEdge || isSafari, // Firefox has limited pause/resume support
    qualityVoices: isChrome || isEdge,
    browserName: isChrome ? 'Chrome' : isEdge ? 'Edge' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : 'Desconocido'
  };
};

export function TextToSpeech({ text, className }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLang, setSelectedLang] = useState("es");
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pausedAt, setPausedAt] = useState(0);
  const [browserSupport] = useState(checkBrowserSupport());
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Language options (Spain Spanish completely excluded)
  const languages = [
    { code: "es", label: "Español" },
    { code: "en-US", label: "English" },
    { code: "fr-FR", label: "Français" },
  ];

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const filteredVoices: Voice[] = [];
      
      languages.forEach(lang => {
        const langCode = lang.code === 'es' ? 'es' : lang.code;
        const langVoices = availableVoices.filter(voice => 
          voice.lang.startsWith(langCode.split('-')[0])
        );
        
        // Score-based voice selection for all languages
        const voiceScores = langVoices.map(v => {
          let score = 0;
          const name = v.name.toLowerCase();
          const langCode = lang.code.split('-')[0];
          
          // Premium/Enhanced voices (highest priority)
          if (v.name.includes('Premium') || v.name.includes('Enhanced') || 
              v.name.includes('Natural') || v.name.includes('Neural') ||
              v.name.includes('WaveNet') || v.name.includes('Standard')) score += 100;
          
          // High-quality providers
          if (v.name.includes('Google')) score += 90;
          if (v.name.includes('Microsoft')) score += 80;
          if (v.name.includes('Amazon')) score += 70;
          if (v.name.includes('Apple')) score += 70;
          
          // Language-specific preferences
          if (langCode === 'es') {
            // Spanish - completely exclude Spain variants
            if (v.lang === 'es-ES' || v.lang.includes('es-ES') || 
                v.name.toLowerCase().includes('spain') ||
                v.name.toLowerCase().includes('castilian')) {
              score = -1000; // Completely exclude Spain Spanish
              return { voice: v, score };
            }
            
            // Prefer US/MX/DO/other Latin American variants
            if (v.lang === 'es-US') score += 60;
            if (v.lang === 'es-MX') score += 50;
            if (v.lang === 'es-DO') score += 55;
            
            // Female voice indicators
            if (name.includes('female') || name.includes('mujer')) score += 40;
            const femaleNames = ['paulina', 'monica', 'laura', 'isabel', 'lucia', 'mia'];
            if (femaleNames.some(fname => name.includes(fname))) score += 30;
          } else if (langCode === 'en') {
            // English - prefer US/GB
            if (v.lang === 'en-US') score += 50;
            if (v.lang === 'en-GB') score += 40;
            
            // Female voice indicators
            if (name.includes('female')) score += 40;
            const femaleNames = ['samantha', 'victoria', 'susan', 'kate', 'karen'];
            if (femaleNames.some(fname => name.includes(fname))) score += 30;
          } else if (langCode === 'fr') {
            // French - prefer FR/CA
            if (v.lang === 'fr-FR') score += 50;
            if (v.lang === 'fr-CA') score += 40;
            
            // Female voice indicators
            if (name.includes('female') || name.includes('femme')) score += 40;
            const femaleNames = ['amelie', 'julie', 'marie', 'audrey', 'celine'];
            if (femaleNames.some(fname => name.includes(fname))) score += 30;
          }
          
          // Avoid male voices
          if (name.includes('male') || name.includes('homme') || name.includes('hombre')) score -= 100;
          
          // Avoid low-quality indicators
          if (name.includes('compact') || name.includes('basic')) score -= 50;
          
          return { voice: v, score };
        });
        
        // Filter out Spain Spanish completely before sorting
        const validVoices = voiceScores.filter(({ score }) => score > -500);
        
        // Sort by score and get the best voices
        validVoices.sort((a, b) => b.score - a.score);
        
        // Add top 3 voices for variety
        const topVoices = validVoices.slice(0, 3);
        topVoices.forEach(({ voice }) => {
          if (voice) {
            filteredVoices.push({
              voice,
              lang: lang.code,
              label: lang.label
            });
          }
        });
      });
      
      setVoices(filteredVoices);
      
      // Set default voice and available voices for current language
      const defaultVoice = filteredVoices.find(v => v.lang === selectedLang);
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.voice);
        
        // Get all voices for current language
        const allVoices = speechSynthesis.getVoices();
        const currentLangVoices = allVoices.filter(voice => 
          voice.lang.startsWith(selectedLang.split('-')[0])
        );
        
        const voiceOptions: VoiceOption[] = currentLangVoices.map(voice => ({
          voice,
          displayName: `${voice.name} (${voice.lang})`
        }));
        
        setAvailableVoices(voiceOptions);
      }
    };

    // Load voices
    loadVoices();
    
    // Chrome loads voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedLang]);

  const cleanText = (htmlText: string) => {
    // Remove HTML tags and clean text for speech
    const div = document.createElement("div");
    div.innerHTML = htmlText;
    return div.textContent || div.innerText || "";
  };

  const handlePlay = () => {
    console.log('🎵 TTS Play clicked:', { isPlaying, isPaused, hasUtterance: !!utteranceRef.current });
    
    // Clear any existing errors
    setError(null);
    
    // Check browser support
    if (!browserSupport.speechSynthesis) {
      setError('Tu navegador no soporta síntesis de voz. Prueba con Chrome, Edge o Safari.');
      return;
    }
    
    // Resume if paused
    if (isPaused && utteranceRef.current) {
      try {
        if (speechSynthesis.paused) {
          console.log('🎵 Resuming paused speech');
          speechSynthesis.resume();
        } else {
          console.log('🎵 Restarting from paused position:', pausedAt + '%');
          // Speech was canceled, restart from paused position
          const words = cleanText(text).split(' ');
          const pausedWords = Math.floor((pausedAt / 100) * words.length);
          const remainingText = words.slice(pausedWords).join(' ');
          
          if (remainingText.trim()) {
            const newUtterance = new SpeechSynthesisUtterance(remainingText);
            if (selectedVoice) newUtterance.voice = selectedVoice;
            newUtterance.rate = speed * 0.95;
            newUtterance.pitch = pitch;
            newUtterance.volume = volume;
            
            setupUtteranceEvents(newUtterance, pausedAt);
            utteranceRef.current = newUtterance;
            speechSynthesis.speak(newUtterance);
          }
        }
        
        setIsPaused(false);
        setIsPlaying(true);
        startProgressTracking();
      } catch (error) {
        console.error('Error resuming speech:', error);
        setError('Error al reanudar la reproducción. Intenta nuevamente.');
      }
      return;
    }

    // Start new speech
    try {
      console.log('🎵 Starting new speech synthesis');
      
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      clearProgressInterval();
      
      // Reset state
      setProgress(0);
      setPausedAt(0);
      
      const cleanedText = cleanText(text);
      if (!cleanedText.trim()) {
        setError('No hay texto para reproducir.');
        return;
      }
      
      console.log('🎵 Text length:', cleanedText.length, 'characters');
      
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      
      // Set voice with fallback
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🎵 Using voice:', selectedVoice.name);
      } else {
        console.log('🎵 No voice selected, using default');
      }
      
      // Optimize settings for better speech
      utterance.rate = Math.max(0.1, Math.min(2.0, speed * 0.95));
      utterance.pitch = Math.max(0.1, Math.min(2.0, pitch));
      utterance.volume = Math.max(0.1, Math.min(1.0, volume));
      
      console.log('🎵 Speech settings:', { rate: utterance.rate, pitch: utterance.pitch, volume: utterance.volume });
      
      // Add natural pauses for better comprehension
      let enhancedText = cleanedText;
      enhancedText = enhancedText.replace(/\./g, '.\u200B ');
      enhancedText = enhancedText.replace(/,/g, ',\u200B ');
      enhancedText = enhancedText.replace(/;/g, ';\u200B ');
      enhancedText = enhancedText.replace(/:/g, ':\u200B ');
      utterance.text = enhancedText;
      
      setupUtteranceEvents(utterance, 0);
      utteranceRef.current = utterance;
      
      // Add a small delay for better reliability
      setTimeout(() => {
        if (utteranceRef.current) {
          console.log('🎵 Speaking utterance');
          speechSynthesis.speak(utteranceRef.current);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error starting speech:', error);
      setError('Error al iniciar la reproducción. Verifica que tu navegador soporte síntesis de voz.');
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    console.log('⏸️ TTS Pause clicked:', { 
      isPlaying, 
      isPaused, 
      speaking: speechSynthesis.speaking, 
      paused: speechSynthesis.paused,
      progress 
    });
    
    try {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        console.log('⏸️ Pausing active speech');
        speechSynthesis.pause();
        setPausedAt(progress);
        setIsPaused(true);
        setIsPlaying(false);
        clearProgressInterval();
      } else if (isPlaying) {
        // Fallback for browsers that don't support pause properly
        console.log('⏸️ Canceling speech (fallback pause)');
        speechSynthesis.cancel();
        setPausedAt(progress);
        setIsPaused(true);
        setIsPlaying(false);
        clearProgressInterval();
      } else {
        console.log('⏸️ Nothing to pause');
      }
    } catch (error) {
      console.error('Error pausing speech:', error);
      setError('Error al pausar la reproducción.');
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setPausedAt(0);
    setError(null);
    utteranceRef.current = null;
    clearProgressInterval();
  };

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const startProgressTracking = () => {
    if (!utteranceRef.current) {
      console.log('⚠️ No utterance ref for progress tracking');
      return;
    }
    
    console.log('📊 Starting progress tracking');
    clearProgressInterval();
    
    const words = utteranceRef.current.text.split(' ').length;
    const wordsPerMinute = 150 * speed;
    const estimatedDuration = (words / wordsPerMinute) * 60 * 1000;
    setDuration(estimatedDuration);
    
    console.log('📊 Progress tracking setup:', { words, wordsPerMinute, estimatedDuration });
    
    startTimeRef.current = Date.now();
    let elapsed = (pausedAt / 100) * estimatedDuration;
    
    progressIntervalRef.current = setInterval(() => {
      // Only update if we're actually playing
      if (!speechSynthesis.speaking || speechSynthesis.paused) {
        return;
      }
      
      elapsed += 100; // Slower updates for better performance
      const newProgress = Math.min((elapsed / estimatedDuration) * 100, 99);
      setProgress(newProgress);
      
      // Stop tracking if we've reached the estimated end
      if (newProgress >= 99) {
        clearProgressInterval();
      }
    }, 100);
  };

  const setupUtteranceEvents = (utterance: SpeechSynthesisUtterance, startProgress: number) => {
    console.log('🎛️ Setting up utterance events');
    
    utterance.onstart = () => {
      console.log('🎵 Speech started');
      setIsPlaying(true);
      setIsPaused(false);
      setError(null);
      setRetryCount(0);
      
      if (startProgress === 0) {
        setProgress(0);
        setPausedAt(0);
      }
      startProgressTracking();
    };
    
    utterance.onend = () => {
      console.log('🎵 Speech ended');
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setPausedAt(0);
      clearProgressInterval();
      
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
      }, 1500);
    };
    
    utterance.onpause = () => {
      console.log('⏸️ Speech paused');
      setIsPaused(true);
      setIsPlaying(false);
      clearProgressInterval();
    };
    
    utterance.onresume = () => {
      console.log('▶️ Speech resumed');
      setIsPaused(false);
      setIsPlaying(true);
      startProgressTracking();
    };
    
    utterance.onerror = (event) => {
      console.error('❌ Speech synthesis error:', event.error, event);
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      clearProgressInterval();
      
      // More specific error handling
      switch (event.error) {
        case 'network':
          setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
          break;
        case 'canceled':
        case 'interrupted':
          // Don't show error for user-initiated cancellations
          setError(null);
          break;
        case 'not-allowed':
          setError('Permisos de audio denegados. Habilita el audio en tu navegador.');
          break;
        case 'synthesis-failed':
          setError('Error de síntesis. Intenta con otra voz o velocidad.');
          break;
        case 'synthesis-unavailable':
          setError('Síntesis de voz no disponible. Intenta recargar la página.');
          break;
        case 'language-unavailable':
          setError('Idioma no disponible. Selecciona otro idioma.');
          break;
        case 'voice-unavailable':
          setError('Voz no disponible. Selecciona otra voz.');
          break;
        default:
          setError(`Error de reproducción: ${event.error}. Intenta con otro navegador.`);
      }
      
      setRetryCount(prev => prev + 1);
    };
    
    // Add boundary event for better progress tracking
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        // Update progress based on character position
        const progressPercent = (event.charIndex / utterance.text.length) * 100;
        setProgress(Math.min(progressPercent, 99)); // Don't go to 100% until onend
      }
    };
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    handlePlay();
  };

  const handlePreviewVoice = () => {
    speechSynthesis.cancel();
    const previewText = selectedLang.startsWith('es') 
      ? "Hola, soy tu asistente de voz con acento latinoamericano. Así es como sueno al leer los artículos." 
      : selectedLang.startsWith('fr')
      ? "Bonjour, je suis votre assistant vocal. C'est ainsi que je sonne en lisant les articles."
      : "Hello, I am your voice assistant. This is how I sound when reading articles.";
    
    const utterance = new SpeechSynthesisUtterance(previewText);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = speed;
    utterance.pitch = pitch;
    utterance.volume = volume;
    speechSynthesis.speak(utterance);
  };

  const handleLanguageChange = (lang: string) => {
    handleStop();
    setSelectedLang(lang);
    const voice = voices.find(v => v.lang === lang);
    if (voice) {
      setSelectedVoice(voice.voice);
    }
  };

  // Calculate reading time
  const words = cleanText(text).split(' ').length;
  const readingTime = Math.ceil(words / (150 * speed));
  
  // Cleanup and keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if focus is not on an input element
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        console.log('⌨️ Keyboard shortcut: Ctrl+Space');
        if (isPlaying) {
          handlePause();
        } else {
          handlePlay();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      try {
        speechSynthesis.cancel();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
      clearProgressInterval();
    };
  }, [isPlaying, isPaused]); // Added isPaused to dependencies

  // Handle page visibility change to maintain state
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        // Page hidden while playing - preserve state
        if (!speechSynthesis.paused && speechSynthesis.speaking) {
          speechSynthesis.pause();
          setPausedAt(progress);
          setIsPaused(true);
          setIsPlaying(false);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, progress]);

  return (
    <>
      <div 
        data-tts-component
        className={cn("bg-gradient-to-br from-[#00ff00]/5 via-white/95 to-[#00ff00]/10 rounded-2xl p-6 shadow-xl border-2 border-[#00ff00]/20 hover:border-[#00ff00]/30 transition-all duration-300 relative overflow-hidden backdrop-blur-sm", className)}
      >
        {/* SafraReport branded animated background effect when playing */}
        {isPlaying && (
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ff00]/30 to-transparent animate-pulse" />
            <div className="absolute -inset-4 bg-[#00ff00]/5 blur-2xl animate-pulse" />
          </div>
        )}
        
        <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-3 rounded-full transition-all duration-300 shadow-lg",
              isPlaying ? "bg-[#00ff00] text-black animate-pulse shadow-[#00ff00]/25" : "bg-[#00ff00]/10 text-[#00ff00] border border-[#00ff00]/20"
            )}>
              <Volume2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">🎧 Escuchar Artículo</h3>
              <p className="text-sm text-gray-600">
                {selectedVoice ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-[#00ff00] rounded-full animate-pulse"></span>
                    <span className="font-medium">{selectedVoice.name}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                    Voz femenina con acento neutro
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="text-right bg-[#00ff00]/5 px-3 py-2 rounded-lg border border-[#00ff00]/20">
            <p className="text-xs font-medium text-gray-600">Tiempo estimado</p>
            <p className="text-lg font-bold text-[#00ff00]">{readingTime} min</p>
          </div>
        </div>
        
          <Select value={selectedLang} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[160px] h-10 border-primary/20">
              <SelectValue>
                {languages.find(l => l.code === selectedLang)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="font-medium">{lang.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-800 flex items-center">
              <VolumeX className="h-4 w-4 mr-2" />
              {error}
            </p>
            {retryCount < 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="text-red-600 hover:text-red-700"
              >
                Reintentar
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Playback controls */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {!isPlaying || isPaused ? (
              <Button
                variant="default"
                size="sm"
                onClick={handlePlay}
                disabled={!!error && retryCount >= 3 || !browserSupport.speechSynthesis}
                className="rounded-full bg-[#00ff00] hover:bg-[#00ff00]/90 text-black font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-[#00ff00]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Play className="h-4 w-4 mr-1" />
                {isPaused ? "Continuar" : "Reproducir"}
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handlePause}
                disabled={!browserSupport.speechSynthesis}
                className="rounded-full bg-[#00ff00] hover:bg-[#00ff00]/90 text-black font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-[#00ff00]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Pause className="h-4 w-4 mr-1" />
                Pausar
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              className="rounded-full border-[#00ff00]/30 hover:border-[#00ff00]/60 hover:bg-[#00ff00]/5 transition-all duration-150"
              title="Detener (Ctrl+Space para pausar/reproducir)"
              aria-label="Detener reproducción"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Velocidad:</span>
            <Slider
              value={[speed]}
              onValueChange={([value]) => setSpeed(value)}
              min={0.5}
              max={2}
              step={0.1}
              className="flex-1"
            />
            <span className="text-sm font-bold text-[#00ff00] w-16 text-right bg-[#00ff00]/10 px-2 py-1 rounded">
              {speed.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Speed control - prominently displayed */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-800">Ajustar velocidad de lectura:</span>
            <div className="flex-1 flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSpeed(Math.max(0.5, speed - 0.1))}
                className="h-8 w-8 rounded-full p-0"
              >
                -
              </Button>
              <Slider
                value={[speed]}
                onValueChange={([value]) => setSpeed(value)}
                min={0.5}
                max={2}
                step={0.1}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSpeed(Math.min(2, speed + 0.1))}
                className="h-8 w-8 rounded-full p-0"
              >
                +
              </Button>
              <span className="text-sm font-bold text-primary w-16 text-center">
                {speed.toFixed(1)}x
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-12">
            <span>Lento</span>
            <span>Normal</span>
            <span>Rápido</span>
          </div>
        </div>

        {/* Progress bar */}
        {(isPlaying || isPaused || progress > 0) && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{isPaused ? 'Pausado' : isPlaying ? 'Reproduciendo...' : 'Completado'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer" 
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const clickX = e.clientX - rect.left;
                   const newProgress = (clickX / rect.width) * 100;
                   setProgress(newProgress);
                   setPausedAt(newProgress);
                   if (isPlaying) {
                     handlePause();
                     setTimeout(() => handlePlay(), 100);
                   }
                 }}
                 title="Clic para saltar a esta posición"
            >
              <div 
                className={cn(
                  "h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-150 ease-out",
                  isPlaying && "motion-safe:animate-pulse"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Advanced controls */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
          >
            <Settings2 className="h-3 w-3 mr-1" />
            {showAdvanced ? "Ocultar" : "Mostrar"} controles avanzados
          </Button>
          
          {showAdvanced && (
            <div className="space-y-3 p-4 bg-white/50 rounded-lg border border-gray-200">
              {/* Voice selector */}
              {availableVoices.length > 1 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Seleccionar voz
                  </label>
                  <div className="flex space-x-2">
                    <Select 
                      value={selectedVoice?.name || ""} 
                      onValueChange={(voiceName) => {
                        const voice = availableVoices.find(v => v.voice.name === voiceName);
                        if (voice) {
                          setSelectedVoice(voice.voice);
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecciona una voz" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVoices.map((option, index) => (
                          <SelectItem key={index} value={option.voice.name}>
                            {option.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviewVoice}
                      className="px-3"
                      title="Escuchar muestra de voz"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Pitch control */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center justify-between">
                  <span>Tono de voz</span>
                  <span className="text-primary font-semibold">{pitch.toFixed(1)}</span>
                </label>
                <Slider
                  value={[pitch]}
                  onValueChange={([value]) => setPitch(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Grave</span>
                  <span>Normal</span>
                  <span>Agudo</span>
                </div>
              </div>
              
              {/* Volume control */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Volumen: {Math.round(volume * 100)}%
                </label>
                <Slider
                  value={[volume]}
                  onValueChange={([value]) => setVolume(value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      
        {/* Enhanced browser compatibility warnings */}
        {!browserSupport.speechSynthesis && (
          <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <VolumeX className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 mb-1">
                  Síntesis de voz no disponible
                </p>
                <p className="text-xs text-red-700">
                  Tu navegador no soporta esta función. Recomendamos usar Chrome, Edge o Safari para la mejor experiencia.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {browserSupport.speechSynthesis && !browserSupport.pauseResume && (
          <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Volume2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 mb-1">
                  Funcionalidad limitada en {browserSupport.browserName}
                </p>
                <p className="text-xs text-amber-700">
                  La pausa/reanudación puede no funcionar correctamente. Usa Chrome o Edge para mejor control.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
            <div className="grid grid-cols-2 gap-2">
              <div>Browser: {browserSupport.browserName}</div>
              <div>Voices: {voices.length}</div>
              <div>Speech API: {browserSupport.speechSynthesis ? '✅' : '❌'}</div>
              <div>Pause/Resume: {browserSupport.pauseResume ? '✅' : '❌'}</div>
            </div>
          </div>
        )}
      </div>
      </div>
      
      {/* Floating audio player */}
      <FloatingAudioPlayer
        isPlaying={isPlaying}
        isPaused={isPaused}
        progress={progress}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        voiceName={selectedVoice?.name}
      />
    </>
  );
}