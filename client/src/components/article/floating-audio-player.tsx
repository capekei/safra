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
          className="rounded-full shadow-lg bg-primary hover:bg-primary/90 w-14 h-14"
          onClick={() => setIsMinimized(false)}
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
            className="h-8 w-8"
            onClick={() => setIsMinimized(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-linear"
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
            className="rounded-full bg-primary hover:bg-primary/90 h-10 w-10"
          >
            <Play className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={onPause}
            className="rounded-full bg-primary hover:bg-primary/90 h-10 w-10"
          >
            <Pause className="h-5 w-5" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={onStop}
          className="rounded-full h-10 w-10"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}