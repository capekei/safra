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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    // Resume if paused
    if (isPaused && speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      
      // Resume progress tracking
      if (utteranceRef.current && !progressIntervalRef.current) {
        const words = utteranceRef.current.text.split(' ').length;
        const wordsPerMinute = 150 * speed;
        const estimatedDuration = (words / wordsPerMinute) * 60 * 1000;
        
        let elapsed = (progress / 100) * estimatedDuration;
        progressIntervalRef.current = setInterval(() => {
          elapsed += 100;
          const newProgress = Math.min((elapsed / estimatedDuration) * 100, 100);
          setProgress(newProgress);
        }, 100);
      }
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(cleanText(text));
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Optimize for natural speech with realistic settings
    utterance.rate = speed * 0.95; // Slightly slower for better clarity
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    // Add natural pauses for better comprehension
    let enhancedText = utterance.text;
    enhancedText = enhancedText.replace(/\./g, '.\u200B '); // Zero-width space for natural pause
    enhancedText = enhancedText.replace(/,/g, ',\u200B ');
    enhancedText = enhancedText.replace(/;/g, ';\u200B ');
    enhancedText = enhancedText.replace(/:/g, ':\u200B ');
    utterance.text = enhancedText;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setProgress(0);
      
      // Estimate duration based on text length and rate
      const words = utterance.text.split(' ').length;
      const wordsPerMinute = 150 * speed;
      const estimatedDuration = (words / wordsPerMinute) * 60 * 1000;
      setDuration(estimatedDuration);
      
      // Update progress
      let elapsed = 0;
      progressIntervalRef.current = setInterval(() => {
        elapsed += 100;
        const newProgress = Math.min((elapsed / estimatedDuration) * 100, 100);
        setProgress(newProgress);
      }, 100);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setTimeout(() => setProgress(0), 500);
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // Set error message based on error type
      if (event.error === 'network') {
        setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
      } else if (event.error === 'canceled' || event.error === 'interrupted') {
        setError(null); // User canceled, not an error
      } else if (event.error === 'not-allowed') {
        setError('Permisos de audio denegados. Habilita el audio en tu navegador.');
      } else {
        setError('No se pudo reproducir el audio. Intenta con otra voz o navegador.');
      }
      setRetryCount(prev => prev + 1);
    };
    
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setError(null);
    utteranceRef.current = null;
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
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
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        if (isPlaying) {
          handlePause();
        } else {
          handlePlay();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  return (
    <>
      <div 
        data-tts-component
        className={cn("bg-gradient-to-br from-primary/5 via-gray-50 to-primary/10 rounded-2xl p-6 shadow-lg border border-primary/20 relative overflow-hidden", className)}
      >
        {/* Animated background effect when playing */}
        {isPlaying && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent animate-pulse" />
          </div>
        )}
        
        <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-3 rounded-full transition-all duration-300",
              isPlaying ? "bg-primary text-white animate-pulse" : "bg-primary/10 text-primary"
            )}>
              <Volume2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Escuchar artículo</h3>
              <p className="text-sm text-gray-600">
                {selectedVoice ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {selectedVoice.name}
                  </span>
                ) : "Voz femenina con acento neutro"}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500">Tiempo estimado</p>
            <p className="text-sm font-semibold text-gray-700">{readingTime} min</p>
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
                disabled={!!error && retryCount >= 3}
                className="rounded-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
              >
                <Play className="h-4 w-4 mr-1" />
                {isPaused ? "Continuar" : "Reproducir"}
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handlePause}
                className="rounded-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
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
              className="rounded-full border-primary/20"
              title="Detener (Ctrl+Space para pausar/reproducir)"
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
            <span className="text-sm font-semibold text-primary w-16 text-right">
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
        {(isPlaying || progress > 0) && (
          <div className="mt-3">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-linear"
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
      
        {!window.speechSynthesis && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center">
              <VolumeX className="h-4 w-4 mr-2" />
              Tu navegador no soporta la síntesis de voz. Prueba con Chrome o Edge para mejor experiencia.
            </p>
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