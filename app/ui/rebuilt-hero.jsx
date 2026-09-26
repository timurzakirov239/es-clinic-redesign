"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Editable } from "./editor";
import { ContactButton } from "./interactive";
import s from "./original-first-screen.module.css";

const doctors = ["tishina", "frolov", "utin", "sorokin", "maksakov"];
const names = ["Дарья Тишина", "Павел Фролов", "Алексей Утин", "Глеб Сорокин", "Сергей Максаков"];
const links = [["approach", "Medical Family Office"], ["responsibility", "Ценности"], ["process", "Как это работает"], ["team", "Наши врачи"], ["contract", "Что входит в годовой контракт"], ["partners", "Партнёры"], ["history", "История"], ["reviews", "Отзывы"], ["faq", "Вопросы и ответы"], ["contacts", "Контакты"]];
const Arrow = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export function RebuiltHero() {
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overScene, setOverScene] = useState(false);
  const [overContract, setOverContract] = useState(false);
  const menuRef = useRef(null);
  const drawerRef = useRef(null);
  useEffect(() => {
    let active = true;
    const reveal = () => { if (active) setReady(true); };
    // Decode the actual CSS background before revealing its text overlay.
    const photo = new window.Image();
    photo.fetchPriority = "high";
    photo.src = "/assets/original-first-screen/hero.webp";
    const fonts = document.fonts
      ? Promise.all([document.fonts.load('16px Aeroport'), document.fonts.load('16px Geologica')])
      : Promise.resolve();
    Promise.all([photo.decode(), fonts]).then(reveal, reveal);
    // A failed/very slow resource must never leave the landing inaccessible.
    const fallback = window.setTimeout(reveal, 4000);
    return () => { active = false; window.clearTimeout(fallback); };
  }, []);
  useEffect(() => {
    const scene = document.querySelector("[data-contract-scene]");
    const contract = document.querySelector("[data-contract-scroll-preview]");
    const scroll = () => {
      setScrolled(window.scrollY > 40);
      if (scene) {
        const rect = scene.getBoundingClientRect();
        setOverScene(rect.top < 93 && rect.bottom > 93);
      }
      if (contract) {
        const rect = contract.getBoundingClientRect();
        setOverContract(window.matchMedia("(max-width: 760px)").matches && rect.top < 74 && rect.bottom > 0);
      }
    };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
    };
  }, []);
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!menu) {
      if (!drawer.open) return;
      const timer = window.setTimeout(() => drawer.close(), 320);
      return () => window.clearTimeout(timer);
    }
    if (!drawer.open) drawer.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menu]);
  return (
    <>
      <noscript><style>{'[data-hero-ready="false"]{opacity:1!important;visibility:visible!important;}'}</style></noscript>
      {/* Keep fixed navigation outside the sticky hero's stacking context. */}
      <header className={`${s.header} ${!scrolled && !menu ? s.dark : ""} ${overScene ? s.sceneHeader : ""} ${overContract && !menu ? s.contractHeader : ""}`} data-hero-ready={ready} data-layout-scope="official-hero-v2">
        <div className={s.headerInner}>
          <div className={s.left}>
            <button className={s.menuButton} ref={menuRef} type="button" aria-label={menu ? "Закрыть меню" : "Открыть меню"} aria-expanded={menu} aria-controls="rebuilt-menu" onClick={() => setMenu(!menu)}><span className={s.burger}><span/><span/><span/></span></button>
            <Editable id="rebuilt-address" as="span" className={s.address}>Москва, Барыковский переулок, д. 4, стр. 3</Editable>
          </div>
          <a className={s.brand} href="#home" aria-label="ЕС Клиника – на главную"><Image src="/assets/official-hero-shield.svg" width={35} height={40} alt="" /></a>
          <div className={s.right}>
            <details className={s.mobileContact}>
              <summary aria-label="Связаться с клиникой"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5C6.75 3.5 2.5 7.02 2.5 11.35c0 2.06.99 3.93 2.6 5.3-.12 1.2-.55 2.28-1.25 3.15 1.5-.18 2.83-.66 3.86-1.32 1.36.53 2.88.82 4.29.82 5.25 0 9.5-3.52 9.5-7.85S17.25 3.5 12 3.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="8.4" cy="11.3" r="1.05" fill="currentColor"/><circle cx="12" cy="11.3" r="1.05" fill="currentColor"/><circle cx="15.6" cy="11.3" r="1.05" fill="currentColor"/></svg></summary>
              <div className={s.contactMenu}><a href="https://telegram.me/esclinic_bot" target="_blank" rel="noopener noreferrer">Telegram</a><a href="https://wa.me/79671330849" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="tel:+74958681857">Позвонить</a></div>
            </details>
            <a className={s.phone} href="tel:+74958681857">+7 (495) 868-18-57</a>
            <a className={s.social} href="https://telegram.me/esclinic_bot" target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.27 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" /></svg></a>
            <a className={s.social} data-editor-anchor="whatsapp" href="https://wa.me/79671330849" target="_blank" rel="noopener noreferrer" aria-label="Написать в WhatsApp"><Image src="/assets/official-hero-whatsapp.svg" width={20} height={20} alt="" /></a>
          </div>
        </div>
      </header>
      <dialog ref={drawerRef} id="rebuilt-menu" className={s.drawer} data-expanded={menu} aria-label="Меню ЕС Клиники" onCancel={event => { event.preventDefault(); setMenu(false); }} onClose={() => { setMenu(false); menuRef.current?.focus(); }} onClick={event => { if (event.target === event.currentTarget) setMenu(false); }}>
        <div className={s.drawerPanel}>
          <button className={s.drawerClose} type="button" aria-label="Закрыть меню" onClick={() => setMenu(false)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button>
          <Image className={s.drawerCross} src="/assets/clover.svg" width={360} height={360} alt="" aria-hidden="true" />
          <nav className={s.drawerNav} aria-label="Разделы лендинга">
            {links.map(([id, name]) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>{name}</a>)}
            <a href="/legal" onClick={() => setMenu(false)}>Документы ↗</a>
          </nav>
          <div className={s.drawerContacts}>
            <a className={s.drawerPhone} href="tel:+74958681857">+7 (495) 868-18-57</a>
            <p>Москва, Барыковский<br />переулок, д. 4, стр. 3</p>
            <div className={s.drawerSocials}>
              <a href="https://telegram.me/esclinic_bot" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m3 10 17-6-3 16-5-4-3 3 1-5 7-7-10 6z" /></svg></a>
              <a href="https://wa.me/79671330849" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><Image src="/assets/official-hero-whatsapp.svg" width={20} height={20} alt="" /></a>
            </div>
          </div>
          <div className={s.drawerBottom}>ЕС Клиника – забота о здоровье семьи</div>
        </div>
      </dialog>
    <div className={s.overlapShell}>
    <section className={s.screen} data-hero-ready={ready} aria-label="ЕС Клиника – Медицинский Family Office" data-hero-version="rebuilt" data-layout-scope="official-hero-v2">
      <div className={s.inner}>
        <div className={s.content}>
          <Editable id="rebuilt-eyebrow" as="div" className={s.eyebrow}>{"Медицинский\nFamily Office"}</Editable>
          <h1 className={s.title}><Image src="/assets/official-hero-logo.svg" width={1000} height={116} alt="ЕС Клиника" priority /></h1>
          <div className={s.tagrow}>
            <div className={s.tagline}><Editable id="rebuilt-tagline-1">Системное управление здоровьем семьи.</Editable><Editable id="rebuilt-tagline-2">Непрерывно. Проактивно. Конфиденциально</Editable></div>
            <ContactButton label="Получить консультацию" hero className={s.cta} />
          </div>
        </div>
        <div className={s.mobileMark} aria-hidden="true"><Image src="/assets/clover.svg" width={26} height={26} alt="" /></div>
        <div className={s.mobilePhoto} aria-hidden="true" />
        <div className={s.card}>
          <div className={s.avatars}>
            {doctors.map((doctor, index) => <a key={doctor} href="#team" aria-label={names[index]} data-doc={index} className={s.avatar}><Image src={`/assets/official-avatar-${doctor}.webp`} width={50} height={50} unoptimized alt="" /></a>)}
            <a href="#team" aria-label="Вся команда" className={s.more}><Arrow /></a>
          </div>
          <Editable id="rebuilt-team-description">Постоянная медицинская команда, которая берёт заботу о вашем здоровье на себя</Editable>
        </div>
      </div>
    </section>
    </div>
    </>
  );
}
