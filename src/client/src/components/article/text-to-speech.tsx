interface TextToSpeechProps {
  text: string;
}

export function TextToSpeech({ text }: TextToSpeechProps) {
  return (
    <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">
      🔊 Listen
    </button>
  );
}