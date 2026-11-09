import Image from "next/image";

export type MarqueeImage = { src: string; alt: string };

/** Auto-scrolling gallery strip. Pauses on hover; still for reduced motion. */
export default function GalleryMarquee({ images }: { images: MarqueeImage[] }) {
  const doubled = [...images, ...images];
  return (
    <div className="overflow-hidden" aria-hidden="false">
      <div className="animate-marquee flex w-max gap-4 hover:[animation-play-state:paused]">
        {doubled.map((img, i) => (
          <Image
            key={`${img.src}-${i}`}
            src={img.src}
            alt={i < images.length ? img.alt : ""}
            width={360}
            height={270}
            className="h-44 w-64 shrink-0 rounded-2xl object-cover shadow-sm md:h-56 md:w-80"
          />
        ))}
      </div>
    </div>
  );
}
