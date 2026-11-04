import Link from "next/link";
import { JB_TRAY_GUIDE_PATH, JB_TRAY_VIDEOS } from "@/lib/guides/jb-tray-guide";

const video = {
  guideHref: JB_TRAY_GUIDE_PATH,
  ...JB_TRAY_VIDEOS[0],
};

export function HeroVideoPanel() {
  return (
    <div className="border border-[var(--pd-border)] bg-white">
      <div className="relative aspect-video bg-[var(--pd-navy)]">
        <iframe
          src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
          title={video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[16px] font-semibold text-[var(--pd-navy)]">{video.title}</p>
          <p className="text-[14px] text-[var(--pd-muted)] mt-1 leading-relaxed">{video.description}</p>
        </div>
        <Link
          href={`${video.guideHref}#videos`}
          className="text-[14px] font-medium text-[var(--pd-teal-dark)] hover:text-[var(--pd-navy)] shrink-0 transition-colors"
        >
          All videos →
        </Link>
      </div>
    </div>
  );
}
