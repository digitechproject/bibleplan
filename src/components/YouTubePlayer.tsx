'use client';

import React from 'react';

interface YouTubePlayerProps {
  url: string;
}

export default function YouTubePlayer({ url }: YouTubePlayerProps) {
  const videoId = React.useMemo(() => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, [url]);

  if (!videoId) return null;

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-800">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="Lecteur Vidéo YouTube"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}
