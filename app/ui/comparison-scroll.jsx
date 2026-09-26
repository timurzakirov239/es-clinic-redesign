"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "./comparison-scroll.module.css";

const DESKTOP_REVEAL_INTERVAL = 700;
const MOBILE_REVEAL_INTERVAL = 620;

const ScrollPairCard = memo(function ScrollPairCard({
  item, answer, index, revealed, comparing, onCompareToggle,
}) {
  const pairRef = useRef(null);

  const toggle = (event) => {
    event.stopPropagation();
    onCompareToggle(!comparing);
  };

  return (
    <article
      ref={pairRef}
      className={styles.pair}
      data-revealed={revealed}
      data-comparing={comparing}
      data-comparison-pair
      data-pair-index={index}
      style={{
        "--card-index": index,
        "--reveal-order": index < 4 ? index : index - 4,
      }}
      aria-label={`Сравнение ${index + 1}`}
    >
      <div className={styles.stack}>
        <div className={styles.beforeCard} data-before-card>
          <div className={styles.cardHeading}><span>Самостоятельно</span></div>
          <p data-before-text>{item}</p>
        </div>
        <div
          className={styles.afterCard}
          data-after-card
          aria-hidden={!revealed}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && event.propertyName === "transform") {
              pairRef.current?.removeAttribute("data-reveal-animating");
            }
          }}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) {
              pairRef.current?.removeAttribute("data-reveal-animating");
            }
          }}
        >
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
});

export function ScrollComparisonReveal({ before, after, heading }) {
  const sceneRef = useRef(null);
  const [revealed, setRevealed] = useState(() => new Set());
  const [activeComparisons, setActiveComparisons] = useState(() => new Set());
  const pairs = useMemo(
    () => before.map((item, index) => ({ item, answer: after[index], index })),
    [after, before],
  );
  const upperPairs = pairs.slice(0, 4);
  const lowerPairs = pairs.slice(4);

  const toggleComparison = (index, opening) => {
    setActiveComparisons((current) => {
      const next = new Set(current);
      if (opening) next.add(index);
      else next.delete(index);
      return next;
    });
  };

  useLayoutEffect(() => {
    const root = sceneRef.current;
    if (!root) return undefined;

    let frame = 0;
    let measuredWidth = -1;
    let stopped = false;
    const measure = () => {
      frame = 0;
      const width = root.clientWidth;
      if (width === measuredWidth) return;
      measuredWidth = width;
      root.querySelectorAll("[data-comparison-pair]").forEach((pair) => {
        const text = pair.querySelector("[data-before-text]");
        if (!text) return;
        pair.style.setProperty(
          "--before-lift",
          `${Math.ceil(text.offsetTop + text.offsetHeight + 12)}px`,
        );
      });
    };
    const scheduleMeasure = () => {
      if (!stopped && !frame) frame = window.requestAnimationFrame(measure);
    };
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(root);
    const textObserver = new MutationObserver(() => {
      measuredWidth = -1;
      scheduleMeasure();
    });
    textObserver.observe(root, { characterData: true, subtree: true });
    scheduleMeasure();
    document.fonts?.ready.then(() => {
      measuredWidth = -1;
      scheduleMeasure();
    });

    return () => {
      stopped = true;
      resizeObserver.disconnect();
      textObserver.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [before.length]);

  useEffect(() => {
    const root = sceneRef.current;
    if (!root) return undefined;

    const cards = [...root.querySelectorAll("[data-comparison-pair]")];
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 750px)").matches;
    const revealCards = (elements, animate) => {
      if (animate) {
        elements.forEach((element) => element.setAttribute("data-reveal-animating", ""));
      }
      setRevealed((current) => {
        const next = new Set(current);
        elements.forEach((element) => next.add(Number(element.dataset.pairIndex)));
        return next.size === current.size ? current : next;
      });
    };

    if ((!mobile && motion.matches) || !("IntersectionObserver" in window)) {
      revealCards(cards, false);
      window.dispatchEvent(new Event("comparison-scroll-ready"));
      return undefined;
    }

    let revealTimer = 0;
    let observer;
    const mobileQueue = [];
    const mobileQueued = new Set();

    const revealMobileNext = () => {
      let card = mobileQueue.shift();
      while (card) {
        const rect = card.getBoundingClientRect();
        const inViewport = rect.bottom > 0 && rect.top < window.innerHeight;
        if (inViewport) break;
        mobileQueued.delete(Number(card.dataset.pairIndex));
        card = mobileQueue.shift();
      }
      if (!card) {
        revealTimer = 0;
        return;
      }
      revealCards([card], true);
      revealTimer = window.setTimeout(revealMobileNext, MOBILE_REVEAL_INTERVAL);
    };

    const queueMobileCards = (elements) => {
      elements
        .sort((a, b) => Number(a.dataset.pairIndex) - Number(b.dataset.pairIndex))
        .forEach((card) => {
          const index = Number(card.dataset.pairIndex);
          if (mobileQueued.has(index) || card.dataset.revealed === "true") return;
          mobileQueued.add(index);
          mobileQueue.push(card);
        });
      if (!revealTimer && mobileQueue.length) revealMobileNext();
    };

    if (mobile) {
      const revealThreshold = 0.46;
      observer = new IntersectionObserver((entries) => {
        const entering = entries
          .filter((entry) => {
            if (entry.isIntersecting) entry.target.setAttribute("data-comparison-visible", "");
            else entry.target.removeAttribute("data-comparison-visible");
            return entry.isIntersecting
              && entry.intersectionRatio >= revealThreshold
              && entry.target.dataset.revealed !== "true";
          })
          .map((entry) => entry.target);
        if (!entering.length) return;
        queueMobileCards(entering);
      }, {
        threshold: [0, revealThreshold],
        rootMargin: "0px 0px -8% 0px",
      });
      cards.forEach((card) => observer.observe(card));
    } else {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();

        let nextIndex = 0;
        const revealNext = () => {
          const card = cards[nextIndex];
          if (!card) return;
          revealCards([card], true);
          nextIndex += 1;
          if (nextIndex < cards.length) {
            revealTimer = window.setTimeout(revealNext, DESKTOP_REVEAL_INTERVAL);
          }
        };
        revealNext();
      }, { threshold: 0.3 });
      observer.observe(cards[0] ?? root);
    }

    const reduceMotion = () => {
      if (!motion.matches || mobile) return;
      observer.disconnect();
      window.clearTimeout(revealTimer);
      revealCards(cards, false);
    };
    motion.addEventListener("change", reduceMotion);

    // Release the old pre-hydration wheel guard; the comparison no longer
    // captures scroll input after this component is ready.
    window.dispatchEvent(new Event("comparison-scroll-ready"));
    return () => {
      observer.disconnect();
      window.clearTimeout(revealTimer);
      motion.removeEventListener("change", reduceMotion);
    };
  }, [before.length]);

  return (
    <div ref={sceneRef} className={styles.scrollComparison} data-comparison-root>
      <div className={styles.upperScene} data-comparison-scene>
        <div className={styles.stickyView}>
          {heading}
          <div className={`${styles.cards} ${styles.upperCards}`}>
            {upperPairs.map((pair) => (
              <ScrollPairCard
                key={pair.index}
                {...pair}
                revealed={revealed.has(pair.index)}
                comparing={activeComparisons.has(pair.index)}
                onCompareToggle={(opening) => toggleComparison(pair.index, opening)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={`${styles.cards} ${styles.lowerCards}`} data-comparison-lower-scene>
        {lowerPairs.map((pair) => (
          <ScrollPairCard
            key={pair.index}
            {...pair}
            revealed={revealed.has(pair.index)}
            comparing={activeComparisons.has(pair.index)}
            onCompareToggle={(opening) => toggleComparison(pair.index, opening)}
          />
        ))}
      </div>
    </div>
  );
}
