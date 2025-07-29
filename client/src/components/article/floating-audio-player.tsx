import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingAudioPlayerProps {
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  voiceName?: string;
  className?: string;
}

export function FloatingAudioPlayer({
  isPlaying,
  isPaused,
  progress,
  onPlay,
  onPause,
  onStop,
  voiceName,
  className
}: FloatingAudioPlayerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show player when text-to-speech component is not in view
      const ttsElement = document.querySelector('[data-tts-component]');
      if (ttsElement) {
        const rect = ttsElement.getBoundingClientRect();
        setIsVisible(rect.bottom < 100 || rect.top > window.innerHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || (!isPlaying && !isPaused)) return null;

  if (isMinimized) {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-50",
        className
      )}>
        <Button
          variant="default"
          size="icon"
          className={cn(
            "rounded-full shadow-lg bg-primary hover:bg-primary/90 w-14 h-14 transition-all duration-150",
            isPlaying && "motion-safe:animate-pulse"
          )}
          onClick={() => setIsMinimized(false)}
          aria-label="Expandir reproductor de audio"
        >
          <Volume2 className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-[320px]",
      "animate-in slide-in-from-bottom-5 duration-300",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Volume2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Reproduciendo audio</p>
            {voiceName && (
              <p className="text-xs text-gray-600 truncate max-w-[180px]">{voiceName}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-100 transition-colors duration-150"
            onClick={() => setIsMinimized(true)}
            aria-label="Minimizar reproductor"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{isPaused ? 'Pausado' : isPlaying ? 'Reproduciendo' : 'Detenido'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-150 ease-out",
              isPlaying && "motion-safe:animate-pulse"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-2">
        {!isPlaying || isPaused ? (
          <Button
            variant="default"
            size="icon"
            onClick={onPlay}
            className="rounded-full bg-primary hover:bg-primary/90 h-10 w-10 transition-all duration-150 hover:scale-105"
            aria-label={isPaused ? "Continuar reproducción" : "Iniciar reproducción"}
          >
            <Play className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={onPause}
            className="rounded-full bg-primary hover:bg-primary/90 h-10 w-10 transition-all duration-150 hover:scale-105"
            aria-label="Pausar reproducción"
          >
            <Pause className="h-5 w-5" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={onStop}
          className="rounded-full h-10 w-10 border-primary/20 hover:border-primary/40 transition-all duration-150 hover:scale-105"
          aria-label="Detener reproducción"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}