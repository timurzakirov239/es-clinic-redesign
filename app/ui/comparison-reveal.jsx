"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./comparison-reveal.module.css";

function PairCard({ item, answer, index, revealed, onReveal }) {
  return (
    <article
      className={styles.pair}
      data-pair-index={index}
      data-revealed={revealed}
      style={{ "--card-index": index }}
      tabIndex={0}
      onPointerEnter={event => { if (event.pointerType === "mouse") onReveal(index); }}
      onFocus={() => onReveal(index)}
      onClick={() => onReveal(index)}
      aria-label={`Сравнение ${index + 1}`}
    >
      <div className={styles.stack}>
        <div className={styles.beforeCard}>
          <div className={styles.cardHeading}><span>Самостоятельно</span></div>
          <p>{item}</p>
        </div>
        <div className={styles.afterCard} aria-hidden={!revealed}>
          <div className={styles.cardHeading}>
            <Image src="/assets/clover.svg" width={19} height={19} alt="" />
            <span>С ЕС Клиникой</span>
          </div>
          <p>{answer}</p>
        </div>
      </div>
    </article>
  );
}

export function ComparisonReveal({ before, after }) {
  const [revealed, setRevealed] = useState(() => new Set());
  const pairs = before.map((item, index) => ({ item, answer: after[index], index }));
  const reveal = index => setRevealed(current => current.has(index) ? current : new Set([...current, index]));
  return (
    <div className={styles.comparison}>
      {pairs.map(pair => <PairCard key={pair.index} {...pair} revealed={revealed.has(pair.index)} onReveal={reveal} />)}
    </div>
  );
}
