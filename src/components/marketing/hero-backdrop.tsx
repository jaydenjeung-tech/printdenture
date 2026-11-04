import Image from "next/image";
import { HERO_IMAGE, HERO_VIDEO } from "@/lib/marketing/copy";

/** Full-bleed clinic loop for the homepage hero. Still photo shows if motion is reduced. */
export function HeroBackdrop() {
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
        className="absolute inset-0 h-full w-full object-cover object-center motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        poster={HERO_IMAGE.src}
        preload="auto"
      >
        <source src={HERO_VIDEO.src} type="video/mp4" />
      </video>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[58%] lg:block"
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
