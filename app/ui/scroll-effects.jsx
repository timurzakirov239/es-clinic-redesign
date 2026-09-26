"use client";

import { useEffect } from "react";

export function ScrollEffects() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!window.IntersectionObserver || motion.matches) return;
    const page = document.querySelector(".page");
    const animations = new Map();
    const counters = new Map();
    const frames = new Set();
    let stopped = false;
    let processFrame = 0;
    const pendingProcessRows = new Set();
    const elements = [...document.querySelectorAll("main .section [data-edit-kind='text'], main .section [data-edit-kind='photo'], main .section details:not(.process-step), main .process-list > li, main .loyalty [data-edit-kind], .partner-grid > div")]
      .filter(el => !el.closest("#comparison, .review-details-content") && !el.parentElement.closest("[data-edit-kind], details"));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animations.get(entry.target)?.play();
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    for (const el of elements) {
      // Progressive enhancement: keep the initial viewport and SSR content visible.
      const processRow = el.parentElement.classList.contains("process-list");
      if (!processRow && el.getBoundingClientRect().top < window.innerHeight) continue;
      const siblings = [...el.parentElement.children].filter(child => elements.includes(child));
      const delay = Math.min(siblings.indexOf(el) * 90, 450);
      const photo = el.dataset.editKind === "photo";
      // Reveal the timeline from its left edge, so the guide precedes each offset card.
      // Animate a mask rather than width: text and accordion geometry remain stable.
      const keyframes = processRow ? [
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)" },
      ] : [
        { opacity: 0, transform: `translateY(30px)${photo ? " scale(1.05)" : ""}` },
        { opacity: 1, transform: "none" },
      ];
      const animation = el.animate(keyframes, {
        duration: processRow ? 900 : 1000,
        delay: processRow ? 0 : delay,
        easing: "cubic-bezier(.22,1,.36,1)",
        fill: "both",
      });
      animation.pause();
      animation.currentTime = 0;
      animation.onfinish = () => animation.cancel();
      animations.set(el, animation);
      if (processRow) pendingProcessRows.add(el);
      else observer.observe(el);
    }
    // Clip-path hides a row from IntersectionObserver, so use its unchanged
    // layout box to start the reveal only when that particular row is visible.
    const revealVisibleProcessRows = () => {
      if (stopped) return;
      const revealLine = window.innerHeight * 0.98;
      for (const row of pendingProcessRows) {
        const bounds = row.getBoundingClientRect();
        if (bounds.bottom < 0) {
          animations.get(row)?.cancel();
          pendingProcessRows.delete(row);
        } else if (bounds.top <= revealLine && bounds.bottom > 0) {
          animations.get(row)?.play();
          pendingProcessRows.delete(row);
        }
      }
    };
    const scheduleProcessCheck = () => {
      if (processFrame || !pendingProcessRows.size) return;
      processFrame = requestAnimationFrame(() => {
        processFrame = 0;
        revealVisibleProcessRows();
      });
    };
    window.addEventListener("scroll", scheduleProcessCheck, { passive: true, capture: true });
    window.addEventListener("resize", scheduleProcessCheck);
    scheduleProcessCheck();
    const countObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || stopped) continue;
        const el = entry.target;
        countObserver.unobserve(el);
        const original = el.textContent;
        const match = original.match(/^(\d+)(.*)$/);
        if (!match) continue;
        const text = el.firstChild;
        if (text?.nodeType !== Node.TEXT_NODE) continue;
        const previousLabel = el.getAttribute("aria-label");
        el.setAttribute("aria-label", original);
        counters.set(el, { text, original, previousLabel });
        const start = performance.now();
        const tick = now => {
          if (stopped) return;
          const progress = Math.min((now - start) / 1400, 1);
          text.nodeValue = `${Math.round(Number(match[1]) * (1 - Math.pow(1 - progress, 3)))}${match[2]}`;
          if (progress < 1) schedule(tick);
        };
        schedule(tick);
      }
    }, { threshold: 0.3 });
    function schedule(callback) {
      const id = requestAnimationFrame(now => { frames.delete(id); callback(now); });
      frames.add(id);
    }
    document.querySelectorAll(".stats [data-edit-id^='stat-']:not([data-edit-id^='stat-label-'])").forEach(el => countObserver.observe(el));
    const finish = () => {
      stopped = true;
      observer.disconnect();
      countObserver.disconnect();
      window.removeEventListener("scroll", scheduleProcessCheck, true);
      window.removeEventListener("resize", scheduleProcessCheck);
      cancelAnimationFrame(processFrame);
      animations.forEach(animation => animation.cancel());
      frames.forEach(id => cancelAnimationFrame(id));
      frames.clear();
      counters.forEach(({ text, original, previousLabel }, el) => {
        if (text.parentNode === el) text.nodeValue = original;
        if (previousLabel === null) el.removeAttribute("aria-label");
        else el.setAttribute("aria-label", previousLabel);
      });
      counters.clear();
    };
    // Editing must never be obstructed by hidden elements or temporary numbers.
    const editorObserver = new MutationObserver(() => {
      if (page.dataset.editing === "true") finish();
    });
    editorObserver.observe(page, { attributes: true, attributeFilter: ["data-editing"] });
    if (page.dataset.editing === "true") finish();
    motion.addEventListener("change", finish);
    return () => { finish(); editorObserver.disconnect(); motion.removeEventListener("change", finish); };
  }, []);
  return null;
}
