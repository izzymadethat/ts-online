"use client";
import { useEffect, useRef, useState } from "react";
import ReactAudioPlayer from "react-audio-player";

export default function AudioPlayer({ source }: { source: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

  useEffect(() => {
    console.log(audioRef);

    const audioElement = audioRef?.current.audioEl.current;
    setCurrentTimestamp(audioElement.currentTime);

    console.log(audioElement.currentTime);
  }, [audioRef.current]);

  function handleListen(e: any) {
    console.log(e.currentTarget.currentTime);
    setCurrentTimestamp;
  }

  return (
    <>
      <ReactAudioPlayer
        ref={audioRef}
        src={source}
        listenInterval={1000}
        onPlay={handleListen}
        controls
      />

      <p>Current time is {currentTimestamp}</p>
    </>
  );
}
