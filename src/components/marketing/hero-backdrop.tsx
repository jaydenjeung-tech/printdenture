"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { HERO_IMAGE, HERO_VIDEO } from "@/lib/marketing/copy";

/** Full-bleed clinic loop for the homepage hero. */
export function HeroBackdrop() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const play = () => {
      video.play().catch(() => {});
    };

    play();
    video.addEventListener("loadeddata", play);
    window.addEventListener("touchstart", play, { passive: true });
    window.addEventListener("pointerdown", play);

    return () => {
      video.removeEventListener("loadeddata", play);
      window.removeEventListener("touchstart", play);
      window.removeEventListener("pointerdown", play);
    };
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden>
      <Image
        src={HERO_IMAGE.src}
        alt=""
        fill
        priority
        quality={75}
        sizes="100vw"
        className="object-cover object-center"
      />
      <video
        ref={videoRef}
        className="absolute inset-0 z-10 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src={HERO_VIDEO.src}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden h-[58%] lg:block"
        style={{
          background:
            "linear-gradient(90deg, #F8F7F4 0%, rgba(248,247,244,0.88) 24%, rgba(248,247,244,0.28) 42%, transparent 54%)",
          maskImage: "linear-gradient(to bottom, #000 62%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 62%, transparent 100%)",
        }}
      />
    </div>
  );
}
