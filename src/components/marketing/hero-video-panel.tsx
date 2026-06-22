"use client";

import Link from "next/link";
import { useState } from "react";
import { JB_FORK_GUIDE_PATH, JB_FORK_VIDEOS } from "@/lib/guides/jb-fork-guide";
import { JB_TRAY_GUIDE_PATH, JB_TRAY_VIDEOS } from "@/lib/guides/jb-tray-guide";

const HERO_VIDEOS = [
  {
    id: "jb-tray",
    label: "JB Tray",
    guideHref: JB_TRAY_GUIDE_PATH,
    ...JB_TRAY_VIDEOS[0],
  },
  {
    id: "jb-fork",
    label: "JB Fork",
    guideHref: JB_FORK_GUIDE_PATH,
    ...JB_FORK_VIDEOS[0],
  },
] as const;

export function HeroVideoPanel() {
  const [activeId, setActiveId] = useState<(typeof HERO_VIDEOS)[number]["id"]>("jb-tray");
  const active = HERO_VIDEOS.find((v) => v.id === activeId) ?? HERO_VIDEOS[0];

  return (
    <div className="border border-white/15 bg-[#132337]/60">
      <div className="flex border-b border-white/10">
        {HERO_VIDEOS.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => setActiveId(video.id)}
            className={`flex-1 px-4 py-3 text-[13px] font-medium transition-colors ${
              activeId === video.id
                ? "bg-white/10 text-white border-b-2 border-[var(--pd-teal-light)] -mb-px"
                : "text-[#8BB3C8] hover:text-white hover:bg-white/5"
            }`}
          >
            {video.label}
          </button>
        ))}
      </div>

      <div className="relative aspect-video bg-[var(--pd-navy)]">
        <iframe
          key={active.youtubeId}
          src={`https://www.youtube.com/embed/${active.youtubeId}?rel=0`}
          title={active.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-teal-light)] mb-1">
            Clinical demonstration
          </p>
          <p className="text-[15px] font-semibold text-white">{active.title}</p>
          <p className="text-[13px] text-[#8BB3C8] mt-1 leading-relaxed">{active.description}</p>
        </div>
        <Link
          href={active.guideHref}
          className="text-[13px] font-medium text-[var(--pd-teal-light)] hover:text-white shrink-0 transition-colors"
        >
          Full guide →
        </Link>
      </div>
    </div>
  );
}
