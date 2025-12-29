// src/Components/SplashScreen.jsx
import React, { useEffect, useRef } from "react";

function SplashScreen({ onVideoEnd }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener("ended", onVideoEnd);
    }
    return () => {
      if (video) video.removeEventListener("ended", onVideoEnd);
    };
  }, [onVideoEnd]);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src="/intro.mp4" // put your video in public folder
        autoPlay
        muted
        className="w-full h-full object-cover"
      />
    </div>
  );
} 

export default SplashScreen;
