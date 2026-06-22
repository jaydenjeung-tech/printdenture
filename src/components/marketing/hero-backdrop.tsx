/**
 * Hero backdrop — navy base with soft ambient gradients (no photo).
 */
export function HeroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 pd-hero-base" />

      <div
        className="absolute -top-[20%] right-[-10%] w-[min(720px,85vw)] h-[min(720px,70vh)] rounded-full opacity-[0.22] blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, rgba(29, 158, 117, 0.9) 0%, rgba(29, 158, 117, 0.15) 42%, transparent 68%)",
        }}
      />

      <div
        className="absolute bottom-[-25%] left-[-15%] w-[min(520px,70vw)] h-[min(520px,55vh)] rounded-full opacity-[0.12] blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(55, 138, 221, 0.75) 0%, rgba(55, 138, 221, 0.1) 45%, transparent 70%)",
        }}
      />

      <div className="absolute inset-0 pd-hero-vignette" />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

      <div className="absolute top-0 right-0 hidden lg:block w-px h-full bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-transparent" />
    </div>
  );
}
