"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./comparison-scroll.module.css";

function ScrollPairCard({ item, answer, index, revealed }) {
  const [comparing, setComparing] = useState(false);
  const [beforeRevealLift, setBeforeRevealLift] = useState(0);
  const beforeRef = useRef(null);
  const beforeTextRef = useRef(null);

  useLayoutEffect(() => {
    const el = beforeRef.current;
    const text = beforeTextRef.current;
    if (!el || !text) return;
    const measure = () => {
      const cardTop = el.getBoundingClientRect().top;
      const textBottom = text.getBoundingClientRect().bottom;
      setBeforeRevealLift(Math.ceil(textBottom - cardTop + 12));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(text);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const toggle = (event) => {
    event.stopPropagation();
    setComparing((value) => !value);
  };

  return (
    <article
      className={styles.pair}
      data-revealed={revealed}
      data-comparing={comparing}
      data-reveal-trigger={index === 0 ? "" : undefined}
      style={{
        "--card-index": index,
        "--before-lift": `${beforeRevealLift}px`,
      }}
      aria-label={`Сравнение ${index + 1}`}
    >
      <div className={styles.stack}>
        <div className={styles.beforeCard} ref={beforeRef}>
          <div className={styles.cardHeading}><span>Самостоятельно</span></div>
          <p ref={beforeTextRef}>{item}</p>
        </div>
        <div className={styles.afterCard} aria-hidden={!revealed}>
          <div className={styles.cardHeading}>
            <Image src="/assets/clover.svg" width={19} height={19} alt="" />
            <span>С ЕС Клиникой</span>
          </div>
          <p>{answer}</p>
          <button
            type="button"
            className={styles.compareToggle}
            aria-label={comparing ? "Свернуть сравнение" : "Показать сравнение"}
            aria-expanded={comparing}
            onClick={toggle}
          >
            <span className={styles.compareToggleIcon} aria-hidden="true">+</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function ScrollComparisonReveal({ before, after, heading }) {
  const sceneRef = useRef(null);
  const revealedRef = useRef(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const pairs = before.map((item, index) => ({ item, answer: after[index], index }));
  const upperPairs = pairs.slice(0, 4);
  const lowerPairs = pairs.slice(4);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;

    const showAll = () => {
      revealedRef.current = before.length;
      setRevealedCount(before.length);
    };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) showAll();

    let timer = 0;
    let count = 0;
    const revealNext = () => {
      count += 1;
      revealedRef.current = count;
      setRevealedCount(count);
      if (count >= before.length) window.clearInterval(timer);
    };
    const revealTrigger = scene.querySelector("[data-reveal-trigger]") || scene;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      if (motion.matches) {
        showAll();
        return;
      }
      revealNext();
      timer = window.setInterval(revealNext, 700);
    }, { threshold: 0.3, rootMargin: "0px" });
    observer.observe(revealTrigger);

    // Release the old pre-hydration wheel guard; the comparison no longer
    // captures scroll input after this component is ready.
    window.dispatchEvent(new Event("comparison-scroll-ready"));
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [upperPairs.length, before.length]);

  return (
    <div className={styles.scrollComparison}>
      <div ref={sceneRef} className={styles.upperScene} data-comparison-scene>
        <div className={styles.stickyView}>
          {heading}
          <div className={`${styles.cards} ${styles.upperCards}`}>
            {upperPairs.map((pair) => (
              <ScrollPairCard
                key={pair.index}
                {...pair}
                revealed={pair.index < revealedCount}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={`${styles.cards} ${styles.lowerCards}`} data-comparison-lower-scene>
        {lowerPairs.map((pair) => (
          <ScrollPairCard key={pair.index} {...pair} revealed={pair.index < revealedCount} />
        ))}
      </div>
    </div>
  );
}
