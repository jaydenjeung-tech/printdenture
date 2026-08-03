import Image from "next/image";
import { HERO_IMAGE } from "@/lib/marketing/copy";

/**
 * Full-bleed clinical photo — Pexels free license (commercial OK).
 */
export function HeroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src={HERO_IMAGE.src}
        alt=""
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover object-[55%_30%] pd-hero-kenburns"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(5,22,34,0.92) 0%, rgba(5,22,34,0.72) 32%, rgba(5,22,34,0.28) 58%, rgba(5,22,34,0.15) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[36%]"
        style={{
          background:
            "linear-gradient(to top, rgba(5,22,34,0.8) 0%, rgba(5,22,34,0.2) 60%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-24"
        style={{
          background: "linear-gradient(to bottom, rgba(5,22,34,0.5) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
