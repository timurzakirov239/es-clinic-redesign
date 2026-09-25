"use client";

import { useEffect, useId, useRef, useState } from "react";
import copy from "../data/copy.json";
import styles from "./contract-scroll-story.module.css";

const groups = [
  { title: 62, items: [[63, 64, 65], [66], [67], [68], [69, 70]] },
  { title: 71, items: [[72, 73], [74, 75], [76, 77], [78, 79]] },
  { title: 80, items: [[81, 82, 83], [84, 85]] },
];

const REVEAL_STAGGER_MS = 130;
const REVEAL_THRESHOLD = 0.2;
const REVEAL_ROOT_MARGIN = "0px 0px -10% 0px";

function Service({ ids }) {
  const [first, ...rest] = ids;
  const [heading, ...inlineBody] = copy[first].split("\n");
  return (
    <article className={styles.service}>
      <h4>{heading}</h4>
      {inlineBody.map((line, index) => <p key={`inline-${index}`}>{line}</p>)}
      {rest.map((id) => <p key={id}>{copy[id]}</p>)}
    </article>
  );
}

function groupTitle(group, index) {
  return `${index + 1}. ${copy[group.title].replace(/^\d+\.\s*/, "").replace(/\s*\n\s*/g, " ")}`;
}

function ContractGroup({ group, index }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const title = groupTitle(group, index);

  return (
    <article
      className={styles.panel}
      data-contract-panel={index + 1}
      data-expanded={expanded}
    >
      <button
        className={styles.panelHeading}
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((value) => !value)}
      >
        <h3>{title}</h3>
        <span className={styles.panelExpand} aria-hidden="true">+</span>
      </button>
      <div className={styles.panelDetails} id={contentId} aria-hidden={!expanded} inert={!expanded}>
        <div className={styles.panelDetailsInner}>
          <div className={styles.services}>
            {group.items.map((ids) => <Service ids={ids} key={ids[0]} />)}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ContractScrollStory({ intro }) {
  const groupsRef = useRef(null);

  // Reveal the three static panels once the block scrolls into view —
  // triggered by intersection with the viewport, not by scroll distance.
  useEffect(() => {
    const container = groupsRef.current;
    if (!container) return;
    const panels = [...container.querySelectorAll(`.${styles.staticPanel}`)];
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const reveal = (panel) => { panel.dataset.visible = "true"; };
    const revealAll = () => panels.forEach(reveal);

    if (motion.matches) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const panel = entry.target;
          const index = panels.indexOf(panel);
          panel.style.setProperty("--reveal-delay", `${Math.max(0, index) * REVEAL_STAGGER_MS}ms`);
          reveal(panel);
          observer.unobserve(panel);
        });
      },
      { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN }
    );
    panels.forEach((panel) => observer.observe(panel));

    const onMotionChange = () => {
      if (motion.matches) {
        observer.disconnect();
        revealAll();
      }
    };
    motion.addEventListener("change", onMotionChange);

    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div className={styles.journey} data-contract-scroll-preview>
      <div className={styles.content}>
        <div className={styles.intro}>{intro}</div>
        <div className={styles.groups} ref={groupsRef}>
          {groups.map((group, index) => (
            <article className={`${styles.panel} ${styles.staticPanel}`} data-visible="false" key={group.title}>
              <div className={`${styles.panelHeading} ${styles.staticHeading}`}>
                <h3>{groupTitle(group, index)}</h3>
              </div>
              <div className={styles.services}>
                {group.items.map((ids) => <Service ids={ids} key={ids[0]} />)}
              </div>
            </article>
          ))}
        </div>
        <div className={styles.mobileGroups}>
          {groups.map((group, index) => <ContractGroup group={group} index={index} key={group.title} />)}
        </div>
      </div>
    </div>
  );
}