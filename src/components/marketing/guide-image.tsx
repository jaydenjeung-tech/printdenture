import Image from "next/image";
import { cn } from "@/lib/utils";

export type GuideImageVariant = "product" | "diagram" | "clinical" | "hero" | "banner";

const VARIANTS: Record<
  GuideImageVariant,
  { aspect: string; inset: string; sizes: string }
> = {
  product: {
    aspect: "aspect-square min-h-[220px]",
    inset: "inset-5 sm:inset-7",
    sizes: "(max-width: 640px) 100vw, 33vw",
  },
  diagram: {
    aspect: "aspect-[4/3] min-h-[240px]",
    inset: "inset-4 sm:inset-6",
    sizes: "(max-width: 768px) 100vw, 50vw",
  },
  clinical: {
    aspect: "aspect-[4/3] min-h-[220px]",
    inset: "inset-3 sm:inset-4",
    sizes: "(max-width: 640px) 100vw, 50vw",
  },
  hero: {
    aspect: "aspect-[4/3] min-h-[260px] sm:min-h-[320px]",
    inset: "inset-6 sm:inset-10",
    sizes: "(max-width: 1024px) 100vw, 50vw",
  },
  banner: {
    aspect: "aspect-[16/10] w-full",
    inset: "inset-0",
    sizes: "(max-width: 1024px) 100vw, 480px",
  },
};

/** Full image visible inside a bordered clinical frame — no aggressive cropping. */
export function GuideImageFrame({
  src,
  alt,
  variant = "product",
  className,
  priority,
  sizes,
}: {
  src: string;
  alt: string;
  variant?: GuideImageVariant;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const config = VARIANTS[variant];

  return (
    <div
      className={cn(
        "relative border border-[var(--pd-border)] bg-white overflow-hidden",
        config.aspect,
        className
      )}
    >
      <div className={cn("absolute", config.inset)}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? config.sizes}
          className="object-contain object-center"
        />
      </div>
    </div>
  );
}

export function GuideImageCard({
  src,
  alt,
  variant = "product",
  label,
  detail,
  title,
  children,
}: {
  src: string;
  alt: string;
  variant?: GuideImageVariant;
  label?: string;
  detail?: string;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-[var(--pd-border)] bg-white overflow-hidden flex flex-col">
      <GuideImageFrame src={src} alt={alt} variant={variant} className="border-0" />
      <div className="p-4 sm:p-5 border-t border-[var(--pd-border)] flex-1">
        {(title || label) && (
          <p className="text-sm font-semibold text-[var(--pd-navy)]">{title ?? label}</p>
        )}
        {detail && (
          <p className="text-[12px] text-[var(--pd-muted)] mt-1 leading-relaxed">{detail}</p>
        )}
        {children}
      </div>
    </div>
  );
}
