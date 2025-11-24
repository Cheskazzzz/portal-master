"use client";

import React, { useRef, useEffect, useState } from "react";
import styles from "../page.module.css";

const images = [
  "/1.png",
  "/2.png",
  "/3.png",
  "/4.png",
  "/5.png",
  "/6.png",
  "/7.png",
  "/8.png",
  "/9.png",
  "/10.png",
];

export default function GalleryPage() {
  return (
    <div className={styles.container}>
      <main className={styles.hero}>
        <section className={styles.left}>
          <h1 className={styles.title}>Gallery</h1>
          <p className={styles.lead}>
            A collection of our completed projects will appear here.
          </p>
        </section>

        <section className={styles.right}>
          <ImageSlider images={images} />
        </section>
      </main>

      <div className={styles["footer-accent"]} />
    </div>
  );
}

function ImageSlider({ images }: { images: string[] }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  // Update active index based on scroll
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const onScroll = () => {
      const index = Math.round(vp.scrollLeft / vp.clientWidth);
      setActive(index);
    };

    vp.addEventListener("scroll", onScroll, { passive: true });
    return () => vp.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (idx: number) => {
    const vp = viewportRef.current;
    if (!vp) return;
    vp.scrollTo({ left: idx * vp.clientWidth, behavior: "smooth" });
  };

  const prev = () => scrollTo(Math.max(0, active - 1));
  const next = () => scrollTo(Math.min(images.length - 1, active + 1));

  // keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <div className={styles.sliderWrap}>
      <button aria-label="Previous" className={styles.prevBtn} onClick={prev}>
        ‹
      </button>

      <div className={styles.sliderViewport} ref={viewportRef}>
        <div className={styles.sliderTrack}>
          {images.map((src, i) => (
            <div
              key={i}
              className={styles.slide}
              style={{
                backgroundImage: `url('${src}')`,
              }}
              role="img"
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <button aria-label="Next" className={styles.nextBtn} onClick={next}>
        ›
      </button>

      <div className={styles.dots}>
        {images.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            className={`${styles.dot} ${i === active ? styles.activeDot : ""}`}
            onClick={() => scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
}

