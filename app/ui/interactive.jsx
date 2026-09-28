"use client";
import { Children, cloneElement, createContext, useContext, useId, useRef, useState, useEffect, useLayoutEffect } from "react";
import Image from "next/image";
import { Editable } from "./editor";

export function ProcessStep({ heading, children, variant = "process" }) {
  const detailsRef = useRef(null);
  const contentRef = useRef(null);
  const animationRef = useRef(null);
  const targetOpen = useRef(false);
  useEffect(() => () => animationRef.current?.cancel(), []);
  const toggle = (event) => {
    event.preventDefault();
    const details = detailsRef.current;
    const content = contentRef.current;
    const from = details.open ? content.getBoundingClientRect().height : 0;
    const opacity = details.open ? Number(getComputedStyle(content).opacity) : 0;
    animationRef.current?.cancel();
    targetOpen.current = !targetOpen.current;
    const opening = targetOpen.current;
    details.open = true;
    details.dataset.expanded = String(opening);
    const to = opening ? content.scrollHeight : 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      details.open = opening;
      return;
    }
    const animation = content.animate(
      [{ height: `${from}px`, opacity }, { height: `${to}px`, opacity: opening ? 1 : 0 }],
      { duration: 650, easing: "cubic-bezier(.42, 0, .58, 1)", fill: "both" },
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      details.open = opening;
      animation.cancel();
      animationRef.current = null;
    };
  };
  return (
    <details className={`${variant}-step`} ref={detailsRef}>
      <summary onClick={toggle}>
        {heading}
        <span className={variant === "process" ? "process-expand" : "faq-expand"} aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 2v10M2 7h10" /></svg></span>
      </summary>
      <div className={variant === "process" ? "process-content" : "faq-content"} ref={contentRef}><div className={variant === "contract" ? "contract-answer" : variant === "process" ? "process-description" : "faq-answer"}>{children}</div></div>
    </details>
  );
}

const ReviewDisclosureContext = createContext(null);

export function ReviewDetails({ reviewId, intro, children }) {
  const disclosure = useContext(ReviewDisclosureContext);
  const [localOpen, setLocalOpen] = useState(false);
  const open = disclosure && reviewId ? disclosure.openReviews.has(reviewId) : localOpen;
  const contentId = useId();
  const toggle = () => {
    if (disclosure && reviewId) disclosure.toggleReview(reviewId);
    else setLocalOpen((value) => !value);
  };

  return (
    <div className="review-details" data-expanded={open}>
      <div className="review-details-content" id={contentId} aria-hidden={!open} inert={!open}>
        <div className="review-details-content-inner">
          <div className="review-details-copy">{intro}{children}</div>
        </div>
      </div>
      <button className="review-toggle" type="button" aria-expanded={open} aria-controls={contentId}
        aria-label={open ? "Свернуть отзыв" : "Читать отзыв полностью"}
        onClick={toggle}>
        <span className="review-toggle-label" aria-hidden="true">
          <span className="review-read">Читать отзыв полностью</span>
          <span className="review-close">Свернуть отзыв</span>
        </span>
        <span className="review-expand" aria-hidden="true">+</span>
      </button>
    </div>
  );
}

export function ReviewsCarousel({ children }) {
  const railRef = useRef(null);
  const dragRef = useRef(null);
  const didDragRef = useRef(false);
  const suppressClickRef = useRef(false);
  const cycleWidthRef = useRef(0);
  const animationFrameRef = useRef(0);
  const [stopped, setStopped] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [openReviews, setOpenReviews] = useState(() => new Set());
  const cards = Children.toArray(children);
  const toggleReview = (reviewId) => {
    setOpenReviews((previous) => {
      const next = new Set(previous);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  };

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 751px)");
    const updateDesktopMode = () => setIsDesktop(desktopQuery.matches);
    updateDesktopMode();
    desktopQuery.addEventListener("change", updateDesktopMode);
    return () => desktopQuery.removeEventListener("change", updateDesktopMode);
  }, []);

  const measureCycle = () => {
    const rail = railRef.current;
    if (!rail || cards.length < 2) return 0;
    const card = rail.querySelector(".review-card");
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
    const cardWidth = card?.getBoundingClientRect().width || rail.clientWidth;
    // Include the flex gap after the last card: it separates one loop from the next.
    return cardWidth * cards.length + gap * cards.length;
  };

  const normalizePosition = (rail) => {
    const cycleWidth = cycleWidthRef.current;
    if (!cycleWidth) return;
    const offset = rail.scrollLeft - cycleWidth;
    if (offset < 0 || offset >= cycleWidth) {
      rail.scrollLeft = cycleWidth + ((offset % cycleWidth) + cycleWidth) % cycleWidth;
    }
  };

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail || !isDesktop || cards.length < 2) return undefined;

    const updateCycle = () => {
      const nextCycleWidth = measureCycle();
      if (!nextCycleWidth) return;
      const previousWidth = cycleWidthRef.current;
      cycleWidthRef.current = nextCycleWidth;
      rail.scrollLeft = previousWidth
        ? nextCycleWidth + ((rail.scrollLeft - previousWidth) / previousWidth) * nextCycleWidth
        : nextCycleWidth;
      normalizePosition(rail);
    };

    updateCycle();
    const observer = new ResizeObserver(updateCycle);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [cards.length, isDesktop]);

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail || !isDesktop) return;
    rail.querySelectorAll(".review-card-loop-clone button, .review-card-loop-clone a, .review-card-loop-clone input, .review-card-loop-clone select, .review-card-loop-clone textarea, .review-card-loop-clone [contenteditable='true']")
      .forEach((control) => { control.tabIndex = -1; });
  }, [cards.length, isDesktop]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !isDesktop) {
      setIsInView(false);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(rail);
    return () => observer.disconnect();
  }, [isDesktop]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !isDesktop || !isInView || stopped || cards.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let lastFrame = 0;
    const startTimer = window.setTimeout(() => {
      const animate = (time) => {
        if (!railRef.current) return;
        if (lastFrame) {
          railRef.current.scrollLeft += Math.max(time - lastFrame, 0) * 0.045;
          normalizePosition(railRef.current);
        }
        lastFrame = time;
        animationFrameRef.current = window.requestAnimationFrame(animate);
      };
      animationFrameRef.current = window.requestAnimationFrame(animate);
    }, 500);

    const resetFrameTime = () => {
      lastFrame = 0;
    };
    document.addEventListener("visibilitychange", resetFrameTime);

    return () => {
      window.clearTimeout(startTimer);
      window.cancelAnimationFrame(animationFrameRef.current);
      document.removeEventListener("visibilitychange", resetFrameTime);
    };
  }, [cards.length, isDesktop, isInView, stopped]);

  const finishPointer = (event) => {
    const rail = railRef.current;
    if (!rail) return;

    if (dragRef.current) {
      suppressClickRef.current = didDragRef.current;
      if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
      dragRef.current = null;
      didDragRef.current = false;
    }
  };

  return (
    <ReviewDisclosureContext.Provider value={{ openReviews, toggleReview }}>
    <div
      className="reviews-carousel"
      ref={railRef}
      role="region"
      tabIndex={0}
      aria-label="Отзывы пациентов"
      aria-roledescription="карусель"
      onWheel={(event) => {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) setStopped(true);
      }}
      onKeyUp={() => setStopped(true)}
      onClick={() => setStopped(true)}
      onPointerDown={(event) => {
        didDragRef.current = false;
        suppressClickRef.current = false;
        if (event.target.closest("button, a, input, textarea, select, [contenteditable='true']")) return;
        if (event.pointerType === "mouse") {
          if (event.button !== 0) return;
          setStopped(true);
          dragRef.current = { x: event.clientX, y: event.clientY, scrollLeft: event.currentTarget.scrollLeft, pointerType: "mouse" };
          event.currentTarget.setPointerCapture(event.pointerId);
          return;
        }
        if (event.pointerType === "touch" || event.pointerType === "pen") {
          dragRef.current = { x: event.clientX, y: event.clientY, scrollLeft: event.currentTarget.scrollLeft, pointerType: event.pointerType };
        }
      }}
      onPointerMove={(event) => {
        if (!dragRef.current) return;
        const distance = event.clientX - dragRef.current.x;
        const verticalDistance = event.clientY - dragRef.current.y;
        if (!didDragRef.current && Math.max(Math.abs(distance), Math.abs(verticalDistance)) > 8) {
          if (dragRef.current.pointerType !== "mouse" && Math.abs(verticalDistance) >= Math.abs(distance)) {
            dragRef.current = null;
            return;
          }
          didDragRef.current = true;
          setStopped(true);
        }
        if (didDragRef.current) event.currentTarget.scrollLeft = dragRef.current.scrollLeft - distance;
      }}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onClickCapture={(event) => {
        if (!suppressClickRef.current) return;
        suppressClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      onScroll={(event) => normalizePosition(event.currentTarget)}
    >
      {isDesktop && cards.map((card, index) => cloneElement(card, {
        key: `review-loop-before-${index}`,
        className: `${card.props.className || ""} review-card-loop-clone`.trim(),
        "aria-hidden": true,
      }))}
      {cards}
      {isDesktop && cards.map((card, index) => cloneElement(card, {
        key: `review-loop-after-${index}`,
        className: `${card.props.className || ""} review-card-loop-clone`.trim(),
        "aria-hidden": true,
      }))}
    </div>
    </ReviewDisclosureContext.Provider>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);
  return (
    <header className={`header reference-header${scrolled || menuOpen ? " scrolled" : ""}`}>
      <div className="header-left">
        <button ref={menuButton} className="menu-button" aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={menuOpen} aria-controls="header-menu" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
        <span className="header-address">Москва, Барыковский переулок, д. 4, стр. 3</span>
      </div>
      <a className="header-brand" href="#home" aria-label="ЕС Клиника – на главную">
        <Image className="header-shield" src="/assets/official-hero-shield.svg" width={35} height={40} alt="" />
      </a>
      <div className="header-actions">
        <a className="header-phone" href="tel:+74958681857">+7 (495) 868-18-57</a>
        <a className="header-telegram" href="https://telegram.me/esclinic_bot" target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.27 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" /></svg></a>
        <a className="header-telegram header-whatsapp" href="https://wa.me/79671330849" target="_blank" rel="noopener noreferrer" aria-label="Написать в WhatsApp"><Image src="/assets/official-hero-whatsapp.svg" width={20} height={20} alt="" /></a>
        <a className="header-mobile-phone" href="tel:+74958681857" aria-label="Позвонить в ЕС Клинику"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 3h4l2 6-2 2a14 14 0 0 0 5 5l2-2 6 2v4C11 22 2 13 4 3Z" /></svg></a>
        <details className="header-mobile-contact">
          <summary aria-label="Связаться с клиникой"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5C6.75 3.5 2.5 7.02 2.5 11.35c0 2.06.99 3.93 2.6 5.3-.12 1.2-.55 2.28-1.25 3.15 1.5-.18 2.83-.66 3.86-1.32 1.36.53 2.88.82 4.29.82 5.25 0 9.5-3.52 9.5-7.85S17.25 3.5 12 3.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="8.4" cy="11.3" r="1.05" fill="currentColor" /><circle cx="12" cy="11.3" r="1.05" fill="currentColor" /><circle cx="15.6" cy="11.3" r="1.05" fill="currentColor" /></svg></summary>
          <div className="header-contact-menu"><a href="https://telegram.me/esclinic_bot" target="_blank" rel="noopener noreferrer">Telegram</a><a href="https://wa.me/79671330849" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="tel:+74958681857">Позвонить</a></div>
        </details>
      </div>
      <nav id="header-menu" className="header-dropdown" aria-label="Основная навигация" hidden={!menuOpen}>
        {[["#approach", "Наш подход"], ["#process", "Как это работает"], ["#team", "Врачи"], ["#contract", "Сопровождение"], ["#contacts", "Контакты"]].map(([href, label]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
      </nav>
    </header>
  );
}

export function VideoCard() {
  const videoRef = useRef(null);
  const frameCallbackRef = useRef(null);
  const [mode, setMode] = useState("idle");
  const [posterVisible, setPosterVisible] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 750px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const showFirstVideoFrame = (video) => {
    if (frameCallbackRef.current !== null && video.cancelVideoFrameCallback) {
      video.cancelVideoFrameCallback(frameCallbackRef.current);
    }
    if (video.requestVideoFrameCallback) {
      frameCallbackRef.current = video.requestVideoFrameCallback(() => {
        frameCallbackRef.current = null;
        setPosterVisible(false);
      });
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => setPosterVisible(false)));
    }
  };

  const playPreview = () => {
    if (mode === "engaged") return;
    const video = videoRef.current;
    video.muted = true;
    setMode("preview");
    video.play().then(() => showFirstVideoFrame(video)).catch(() => {});
  };

  const stopPreview = () => {
    if (mode !== "preview") return;
    videoRef.current?.pause();
    setMode("idle");
  };

  const enableSound = () => {
    const video = videoRef.current;
    video.muted = false;
    setMode("engaged");
    video.play().then(() => showFirstVideoFrame(video)).catch(() => {});
  };

  const togglePlayback = () => {
    if (mode !== "engaged") return;
    const video = videoRef.current;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    const card = video?.closest(".video-card");
    if (!video || !card) return;

    if (document.fullscreenElement === card || video.webkitDisplayingFullscreen) {
      if (document.exitFullscreen) await document.exitFullscreen().catch(() => {});
      else video.webkitExitFullscreen?.();
      return;
    }

    if (card.requestFullscreen) {
      try {
        await card.requestFullscreen();
        return;
      } catch {}
    }
    video.webkitEnterFullscreen?.();
  };

  const seekVideo = (event) => {
    const video = videoRef.current;
    if (!video) return;
    const time = Number(event.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    if (!Number.isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const card = video.closest(".video-card");
    const updateFullscreen = () => {
      setFullscreen(document.fullscreenElement === card || Boolean(video.webkitDisplayingFullscreen));
    };
    document.addEventListener("fullscreenchange", updateFullscreen);
    video.addEventListener("webkitbeginfullscreen", updateFullscreen);
    video.addEventListener("webkitendfullscreen", updateFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreen);
      video.removeEventListener("webkitbeginfullscreen", updateFullscreen);
      video.removeEventListener("webkitendfullscreen", updateFullscreen);
    };
  }, []);

  useEffect(() => () => {
    const video = videoRef.current;
    if (frameCallbackRef.current !== null && video?.cancelVideoFrameCallback) {
      video.cancelVideoFrameCallback(frameCallbackRef.current);
    }
  }, []);

  return (
    <div
      className="video-card"
      data-layout-id="video-card"
      data-mode={mode}
      onMouseEnter={playPreview}
      onMouseLeave={stopPreview}
    >
      <video
        ref={videoRef}
        src="/assets/daria-tishina-web.mp4"
        controls={false}
        playsInline
        preload="none"
        aria-label={mobile && mode === "engaged"
          ? `${playing ? "Приостановить" : "Продолжить"} видео с Дарьей Тишиной`
          : "Дарья Тишина о Медицинском Family Office"}
        role={mobile && mode === "engaged" ? "button" : undefined}
        tabIndex={mobile && mode === "engaged" ? 0 : undefined}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onClick={togglePlayback}
        onKeyDown={(event) => {
          if (!mobile || mode !== "engaged" || (event.key !== "Enter" && event.key !== " ")) return;
          event.preventDefault();
          togglePlayback();
        }}
      />
      <Image
        className={`video-poster${posterVisible ? "" : " is-hidden"}`}
        src="/assets/daria-poster.webp"
        unoptimized
        alt="Дарья Сергеевна Тишина"
        fill
        sizes="(max-width: 750px) 90vw, 403px"
      />
      <div className={`video-shade${posterVisible ? "" : " is-hidden"}`} aria-hidden="true" />
      {mode === "engaged" && (
        <div className="video-controls" role="group" aria-label="Управление видео">
          <div className="video-controls-seek">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={seekVideo}
              aria-label="Позиция видео"
              disabled={!duration}
            />
            <span aria-live="off">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <div className="video-controls-buttons">
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={playing ? "Приостановить видео" : "Продолжить видео"}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zM15 5h3v14h-3z" fill="currentColor" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor" /></svg>
              )}
            </button>
            <div className="video-controls-right">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Включить звук" : "Выключить звук"}
                >
                  {muted ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Z" fill="currentColor" /><path d="m16 9 5 6m0-6-5 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Z" fill="currentColor" /><path d="M15 9a4.5 4.5 0 0 1 0 6m2.5-9a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  )}
                </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Выйти из полноэкранного режима" : "На весь экран"}
              >
                {fullscreen ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4m11-5v5h5M9 20v-5H4m11 5v-5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {mode !== "engaged" && (
          <button
            className="video-play"
            onClick={enableSound}
            aria-label="Смотреть видео с Дарьей Тишиной"
          >
            <span aria-hidden="true">▶</span>
          </button>
      )}
      <div className={`video-caption${posterVisible ? "" : " is-hidden"}`}>
        Дарья Тишина<span>Медицинский директор ЕС Клиники</span>
      </div>
    </div>
  );
}
export function ConsultationLeadForm() {
  const [status, setStatus] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setStatus("Форма заполнена. Для отправки заявки напишите нам в Telegram или позвоните по номеру +7 (495) 868-18-57.");
  };
  return (
    <div className="consultation-lead-form">
      <div className="consultation-lead-inner">
        <Editable id="consultation-lead-title" as="h2" className="consultation-lead-title">
          Оставьте заявку — мы расскажем, как устроено системное ведение здоровья семьи
        </Editable>
        <form onSubmit={submit}>
          <input className="consultation-lead-field" type="text" name="name" placeholder="Ваше имя" autoComplete="name" maxLength="60" required />
          <input className="consultation-lead-field" type="tel" name="phone" placeholder="Ваш номер телефона" autoComplete="tel" inputMode="tel" required />
          <label className="consultation-lead-agree">
            <input className="consultation-lead-checkbox" type="checkbox" name="agree" required />
            <span className="consultation-lead-checkmark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l5 5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          <span>Подтверждаю, что согласен <a href="/consent-data">с условиями использования персональных данных</a> и с <a href="/legal">пользовательским соглашением</a></span>
          </label>
          <button className="consultation-lead-submit" type="submit">Получить консультацию<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        </form>
        {status && <p className="consultation-lead-status" role="status">{status}</p>}
        <p className="consultation-lead-or">Или напишите нам в мессенджер</p>
        <div className="consultation-lead-messengers">
          <a href="https://telegram.me/esclinic_bot" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.27 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" /></svg></a>
          <a href="https://wa.me/79671330849" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-1.76-.89-2.92-1.59-4.08-3.59-.31-.53.31-.49.89-1.63.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.05 21.79h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26C2.17 6.44 6.6 2.01 12.06 2.01c2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.89-9.89 9.89Z" /></svg></a>
        </div>
      </div>
    </div>
  );
}
export function ContactButton({ label, hero = false, className = "button" }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const close = (e) => {
      if (e.target === dialog) dialog.close();
    };
    dialog.addEventListener("click", close);
    return () => dialog.removeEventListener("click", close);
  }, []);
  return (
    <>
      <button className={className} onClick={() => ref.current.showModal()}>
        {label}
        {hero ? <svg className="contact-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> : <span aria-hidden="true">↗</span>}
      </button>
      <dialog ref={ref} className="contact-dialog">
        <div>
          <button
            className="dialog-close"
            aria-label="Закрыть"
            onClick={() => ref.current.close()}
          >
            ×
          </button>
          <h2>Познакомимся?</h2>
          <p>Обсудите сопровождение вашей семьи с командой ЕС Клиники.</p>
          <a className="button" href="tel:+74958681857">
            +7 (495) 868-18-57 ↗
          </a>
          <a
            className="text-link"
            href="https://telegram.me/esclinic_bot"
            target="_blank"
            rel="noopener noreferrer"
          >
            Написать в Telegram ↗
          </a>
          <small>
            В локальном прототипе заявки не отправляются. Ссылки ведут в
            реальные каналы клиники.
          </small>
        </div>
      </dialog>
    </>
  );
}
