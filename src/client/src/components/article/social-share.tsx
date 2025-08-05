interface SocialShareProps {
  title: string;
  url: string;
}

export function SocialShare({ title, url }: SocialShareProps) {
  return (
    <div className="flex gap-2">
      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
        Share
      </button>
    </div>
  );
}