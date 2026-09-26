import Image from "next/image";
import { ScrollComparisonReveal } from "./ui/comparison-scroll";
import { ContractScrollStory } from "./ui/contract-scroll-story";
import { ScrollEffects } from "./ui/scroll-effects";
import { RebuiltHero } from "./ui/rebuilt-hero";
import { ContactWidget } from "./ui/contact-widget";
import copy from "./data/copy.json";
import faqs from "./data/faqs.json";
import partners from "./data/partners.json";
import { photoSource } from './data/photo-sources';
import {
  EditorProvider,
  Editable,
  EditablePhoto,
  EditorLauncher,
} from "./ui/editor";
import { VideoCard, ContactButton, ConsultationLeadForm, ReviewDetails, SiteHeader, ProcessStep } from "./ui/interactive";

const Text = ({ n, as = "p", className = "" }) => (
  <Editable id={`copy-${n}`} as={as} className={className}>
    {copy[n]}
  </Editable>
);
const comparisonOrder = [0, 5, 2, 3, 4, 1, 6];
const Photo = ({ name, alt, className = "" }) => (
  <EditablePhoto
    id={`photo-${name}`}
    src={photoSource(name)}
    alt={alt}
    className={className}
  />
);
const Mark = () => (
  <Image src="/assets/clover.svg" width={30} height={30} alt="" />
);
const decorativeCloverPath =
  "M19.3612 7.84705C18.3914 7.85021 17.514 8.23688 16.8657 8.85893V8.85578C15.5491 10.0683 13.9246 10.6095 12.1741 10.8491C12.3863 9.08694 12.8959 7.44882 14.1064 6.11541H14.1032C14.7211 5.46289 15.1015 4.58236 15.0983 3.61252C15.091 1.60978 13.4623 -0.00733028 11.4595 2.49919e-05C9.45681 0.00738027 7.8397 1.63605 7.84705 3.63879C7.85021 4.60863 8.23688 5.48601 8.85893 6.13433H8.85578C10.0694 7.45092 10.6095 9.07538 10.8491 10.8259C9.08694 10.6137 7.44882 10.1041 6.11541 8.89361V8.89676C5.46289 8.27891 4.58236 7.89854 3.61252 7.90169C1.60978 7.90905 -0.00733028 9.53772 2.49919e-05 11.5405C0.00738027 13.5432 1.63605 15.1603 3.63879 15.1529C4.60863 15.1498 5.48601 14.7631 6.13433 14.1411V14.1442C7.45092 12.9317 9.07539 12.3905 10.8259 12.1509C10.6137 13.9131 10.1041 15.5512 8.89361 16.8846H8.89676C8.27891 17.5371 7.89854 18.4176 7.90169 19.3875C7.90905 21.3902 9.53772 23.0073 11.5405 23C13.5432 22.9926 15.1603 21.364 15.1529 19.3612C15.1498 18.3914 14.7631 17.514 14.1411 16.8657H14.1442C12.9317 15.5491 12.3905 13.9246 12.1509 12.1741C13.9131 12.3863 15.5522 12.8959 16.8846 14.1064V14.1032C17.5371 14.7211 18.4176 15.1015 19.3875 15.0983C21.3902 15.091 23.0073 13.4623 23 11.4595C22.9916 9.45681 21.3629 7.8397 19.3612 7.84705Z";
const DecorativeClover = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 23 23"
    aria-hidden="true"
    focusable="false"
  >
    <path d={decorativeCloverPath} />
  </svg>
);
const GlassClover = () => (
  <svg
    className="system-clover-outline"
    viewBox="0 0 23 23"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="system-clover-edge-hi" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="1" />
        <stop offset=".42" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="system-clover-edge-lo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset=".58" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity=".9" />
      </linearGradient>
      <filter
        id="system-clover-glass-distortion"
        x="-15%"
        y="-15%"
        width="130%"
        height="130%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.011 0.011"
          numOctaves="2"
          seed="4"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="1.1" result="softNoise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="10"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
    <path
      d={decorativeCloverPath}
      fill="none"
      stroke="url(#system-clover-edge-hi)"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d={decorativeCloverPath}
      fill="none"
      stroke="url(#system-clover-edge-lo)"
      strokeWidth="1.3"
      vectorEffect="non-scaling-stroke"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);
const stages = [
  [20, null],
  [22, 23],
  [24, 25],
  [26, 27],
  [28, 29],
  [30, 31],
  [32, 33],
  [34, 35],
];
const doctors = [
  { image: "tishina", name: 55, url: "/doctor-tishina" },
  { image: "frolov", name: 56, url: "/doctor-frolov" },
  { image: "utin", name: 57, role: 58, url: "/vrachi" },
];
const partnerLogoIndex = {
  "Мать и дитя": 0, "Чайка": 1, "K+31": 3,
  "Docdeti": 4, "ФГБУ НМИЦК Чазова": 5, "Сеченовский Университет": 6,
  "Морозовская детская больница": 7, "Коммунарка": 8, "Три сестры": 9,
  "ЕМС": 10, "GMS": 11, "Hadassah": 12,
};

export function ScrollVersionLanding() {
  const rebuilt = true;
  return (
    <EditorProvider>
      <a className="skip" href="#approach">
        Перейти к содержимому
      </a>
      {!rebuilt && <SiteHeader />}
      <main id="home">
        {rebuilt ? <RebuiltHero /> : <section
          className="hero"
          aria-label="ЕС Клиника – Медицинский Family Office"
        >
          <EditablePhoto
            id="photo-hero-official"
            src="/assets/official-hero.png"
            alt="Бородатый врач консультирует семью в ЕС Клинике"
            className="hero-photo"
            priority
          />
          <div className="hero-deco" aria-hidden="true"><Image src="/assets/official-hero-deco.svg" fill alt="" /></div>
          <div className="hero-mobile-clover" aria-hidden="true"><Mark /></div>
          <div className="hero-content">
            <Editable id="hero-official-eyebrow" className="hero-eyebrow">{"Медицинский\nFamily Office"}</Editable>
            <h1>
              <Image
                src="/assets/official-hero-logo.svg"
                alt="ЕС Клиника"
                width={815}
                height={94}
                className="hero-logo"
                priority
              />
            </h1>
            <div className="hero-tagrow">
              <div className="hero-tagline">
                <Editable id="hero-official-line-1">Системное управление здоровьем семьи.</Editable>
                <Editable id="hero-official-line-2">Непрерывно. Проактивно. Конфиденциально</Editable>
              </div>
              <ContactButton label={copy[6]} hero />
            </div>
          </div>
          <div className="hero-card">
            <div className="avatars">
              {["tishina", "frolov", "utin", "sorokin", "maksakov"].map((d) => (
                <a
                  key={d}
                  href="#team"
                  aria-label="Перейти к медицинской команде"
                >
                  <Image
                    src={`/assets/official-avatar-${d}.${d === "utin" ? "jpg" : "png"}`}
                    unoptimized
                    width={54}
                    height={54}
                    alt=""
                  />
                </a>
              ))}
              <a href="#team" aria-label="Вся команда">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
            <Text n={5} />
          </div>
        </section>}
        <section className="section split intro" id="approach">
          <div>
            <div className="intro-title">
              <Mark />
              <Text n={8} as="h2" />
            </div>
            <Text n={9} className="lead" />
            <Text n={10} />
            <div className="capacity">
              <Mark />
              <Text n={11} />
            </div>
          </div>
          <VideoCard />
        </section>
        <section className="family-showcase-section" aria-label="Семья дома">
          <EditablePhoto
            id="photo-family-showcase"
            src="/assets/official-family-showcase.png"
            alt="Семья проводит время вместе дома"
            className="family-showcase"
          />
        </section>
        <section className="section split system" id="system">
          <span
            className="system-clover system-clover-glass"
            data-layout-id="system-clover-glass-right"
            data-editor-label="Клевер с размытием"
            aria-hidden="true"
          >
            <GlassClover />
          </span>
          <DecorativeClover className="system-clover system-clover-soft" />
          <div className="system-copy">
            <div className="intro-title">
              <Mark />
              <Text n={13} as="h2" />
            </div>
            <Text n={14} className="lead" />
            <Text n={15} className="system-lower-copy" />
          </div>
          <Photo name="family" alt="Бабушка целует внука" />
        </section>
        <section className="section consultation-lead" id="application">
          <EditablePhoto
            id="photo-consultation-lead"
            src="/assets/official-reception-form.png"
            alt="Сотрудницы ресепшена ЕС Клиники"
            className="consultation-lead-photo"
          />
          <ConsultationLeadForm />
        </section>
        <section className="section split responsibility" id="responsibility">
          <div>
            <div className="responsibility-statement">
              <Mark />
              <Text n={16} className="statement" />
            </div>
            <Text n={17} className="lead" />
          </div>
          <Photo
            name="reception"
            alt="Светлый холл и стойка ресепшена ЕС Клиники"
          />
        </section>

        <section className="section" id="process">
          <div className="section-heading">
            <Text n={18} as="h2" />
            <Mark />
          </div>
          <ol className="process-list">
            {stages.map(([title, body]) => {
              const heading = <Editable id={`copy-${title}`} as="h3">{copy[title].replace(/^\d+\s+/, "")}</Editable>;
              return (
                <li key={title}>
                  <ProcessStep heading={heading}>
                    {body ? <Text n={body} /> : (
                      <Editable id="process-contract-description" as="p">Обсуждаем потребности вашей семьи и условия годового сопровождения. Заключаем контракт – с этого начинается работа вашей постоянной медицинской команды.</Editable>
                    )}
                  </ProcessStep>
                </li>
              );
            })}
          </ol>
        </section>
        <section className="section comparison" id="comparison" aria-label="Сравнение сопровождения с ЕС Клиникой и без неё">
          <ScrollComparisonReveal
            heading={(
              <div className="intro-title">
                <Mark />
                <Editable id="comparison-title" as="h2">Внедрить единую систему управления здоровьем</Editable>
              </div>
            )}
            before={comparisonOrder.map((sourceIndex) => <Text key={sourceIndex} n={39 + sourceIndex * 2} as="span" />)}
            after={comparisonOrder.map((sourceIndex) => <Text key={sourceIndex} n={40 + sourceIndex * 2} as="span" />)}
          />
        </section>
        <section className="section team" id="team">
          <div className="intro-title">
            <Mark />
            <Text n={53} as="h2" />
          </div>
          <Text n={54} className="team-intro lead" />
          <div className="doctors">
            {doctors.map((d) => (
              <article key={d.image}>
                <Photo name={d.image} alt={copy[d.name].split("\n")[0]} />
                <Text n={d.name} className="doctor-caption" />
                {d.role && <Text n={d.role} />}
                <a
                  href={d.url}
                  className="text-link"
                >
                  О враче ↗
                </a>
              </article>
            ))}
          </div>
          <a
            className="button"
            href="/vrachi"
          >
            {copy[59]} ↗
          </a>
        </section>
        <section className="section contract" id="contract">
          <ContractScrollStory intro={(
            <div className="contract-intro">
              <Text n={60} as="h2" />
              <Text n={61} className="lead" />
            </div>
          )} />
        </section>
        <section className="section partners" id="partners">
          <Text n={86} as="h2" />
          <div className="partner-grid">
            {partners.map((p) => (
              <div key={p.asset}>
                <Image
                  src={`/assets/partners-mono/partner-${partnerLogoIndex[p.name]}.webp`}
                  width={180}
                  height={80}
                  sizes="(max-width: 600px) 40vw, 180px"
                  alt={p.name}
                  className="partner-logo"
                />
              </div>
            ))}
          </div>
        </section>
        <section className="section split" id="history">
          <div>
            <div className="intro-title">
              <Mark />
              <Text n={88} as="h2" />
            </div>
            <div className="stats">
              {[
                ["20 лет", "премиальной выездной медицины"],
                ["300+", "экспертов"],
                ["100+", "партнёров"],
                ["380", "активных клиентов"],
              ].map(([n, label], i) => (
                <div key={i}>
                  <Editable id={`stat-${i}`} as="strong">
                    {n}
                  </Editable>
                  <Editable id={`stat-label-${i}`}>{label}</Editable>
                </div>
              ))}
            </div>
          </div>
          <Photo name="history" alt="Фасад ЕС Клиники с надписью «Основана в 2006»" />
        </section>
        <section className="loyalty">
          <Photo name="loyalty" alt="Семья – несколько поколений вместе" />
          <div>
            <Text n={90} as="h2" />
          </div>
        </section>
        <section className="section testimonial" id="reviews">
          <div className="intro-title">
            <Mark />
            <Text n={92} as="h2" />
          </div>
          <div className="reviews-grid">
            <article className="review-card">
              <div className="review-author">
              <div className="review-author-title">
                <Text n={93} as="h3" />
              </div>
              <Text n={94} />
              </div>
              <blockquote>
              <Text n={95} className="lead" />
              <ReviewDetails>
                {[96, 97, 98].map((n) => (
                  <Text n={n} key={n} />
                ))}
              </ReviewDetails>
              </blockquote>
            </article>
            <article className="review-card">
              <div className="review-author">
              <div className="review-author-title">
                <Editable id="review-shumov-name" as="h3">Кристиан Шумов</Editable>
              </div>
              <Editable id="review-shumov-role">Основатель Центра протезирования и реабилитации «Динамика»</Editable>
              </div>
              <blockquote>
              <Editable id="review-shumov-intro" className="lead">«Я правда уже не представляю свою жизнь без ЕС Клиники.</Editable>
              <ReviewDetails>
                <Editable id="review-shumov-1">Особенно это почувствовал в ситуации с одной премиальной Клиникой: возникла задержка, но команда ЕС быстро подключилась и помогла всё решить. И в какой-то момент я поймал себя на мысли: «Как вообще я раньше жил без вас?»</Editable>
                <Editable id="review-shumov-2">За последнее время было уже много таких ситуаций – от организации взаимодействия с другими клиниками до вопросов с лекарствами. Мне очень нравится, что я могу просто передать задачу команде и знать, что её доведут до результата.</Editable>
                <Editable id="review-shumov-3">Огромное спасибо за вашу работу и за то, сколько медицинских вопросов вы снимаете с меня»</Editable>
              </ReviewDetails>
              </blockquote>
            </article>
          </div>
        </section>
        <section className="section faq" id="faq">
          <Text n={99} as="h2" />
          {faqs.map((faq, i) => (
            <ProcessStep key={i} variant="faq" heading={
                <Editable id={`faq-${i}-question`} as="span">
                  {faq.question}
                </Editable>
            }>
                {faq.paragraphs.map((p, j) => (
                  <Editable id={`faq-${i}-${j}`} key={j}>
                    {p}
                  </Editable>
                ))}
            </ProcessStep>
          ))}
        </section>
        <section className="section split final-cta" id="consultation">
          <div>
            <div className="intro-title">
              <Mark />
              <Text n={102} as="h2" />
            </div>
            <Text n={103} />
            <Text n={104} />
            <ContactButton label={copy[105]} />
          </div>
          <Photo name="clinic" alt="Стойка ресепшена и партнёры ЕС Клиники" />
        </section>
      </main>
      <div className="footer-stage">
        <section className="prefooter-photo" aria-label="Здание ЕС Клиники">
          <Image
            src="/assets/official-footer-building.webp"
            alt="Фасад здания ЕС Клиники"
            fill
            sizes="100vw"
            loading="eager"
            unoptimized
          />
        </section>
        <footer id="contacts">
          <div className="footer-brand">
            <Image src="/assets/official-hero-shield.svg" width={48} height={58} alt="" />
            <strong>ЕС Клиника</strong>
            <span>Основана в 2006 году</span>
          </div>
          <div className="footer-columns">
            <section>
              <h2>Контакты</h2>
              <a href="tel:+74958681857">+7 (495) 868-18-57</a>
              <a href="mailto:office@es-job.ru">office@es-job.ru</a>
              <p>Москва, Барыковский переулок, д. 4, стр. 3</p>
              <div className="footer-socials" aria-label="Социальные сети ЕС Клиники">
                <a href="https://telegram.me/es_family_office" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 11.3 15.8-6.1c.7-.3 1.3.2 1.1 1l-2.7 12.7c-.1.7-.8.9-1.4.6l-4.1-3-2 1.9c-.2.2-.4.4-.8.4l.3-4.2 7.7-7c.3-.3-.1-.5-.5-.2l-9.5 6-4.1-1.3c-.9-.3-.9-.9.2-1.3Z" /></svg>
                </a>
                <a href="https://www.instagram.com/es_family_office" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.7" /><circle cx="17.4" cy="6.8" r="1" className="fill-icon" /></svg>
                </a>
                <a href="https://www.youtube.com/channel/UCtx2IBeNXIxW6e-_a9GKG4A" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 7.1c-.2-.9-.9-1.6-1.8-1.8C16.8 5 12 5 12 5s-4.8 0-6.4.3c-.9.2-1.6.9-1.8 1.8A18.4 18.4 0 0 0 3.5 12c0 1.6.1 3.3.3 4.9.2.9.9 1.6 1.8 1.8 1.6.3 6.4.3 6.4.3s4.8 0 6.4-.3c.9-.2 1.6-.9 1.8-1.8.2-1.6.3-3.3.3-4.9s-.1-3.3-.3-4.9Z" /><path d="m10 15.2 5-3.2-5-3.2v6.4Z" className="play-icon" /></svg>
                </a>
                <a href="https://wa.me/79671330849" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                </a>
              </div>
            </section>
            <nav aria-label="Навигация в подвале сайта">
              <h2>Меню</h2>
              <a href="#approach">Medical Family Office</a>
              <a href="#responsibility">Ценности</a>
              <a href="#history">История</a>
              <a href="#comparison">Для кого мы работаем</a>
              <a href="#contract">Что входит в годовой контракт</a>
              <a href="#team">Наши врачи</a>
              <a href="/career">Карьера</a>
              <a href="/partners">Партнёрам</a>
            </nav>
            <section>
              <h2>Документы</h2>
              <a href="/legal">Правовые документы</a>
              <a href="/consent-data">Согласие на обработку персональных данных</a>
              <a href="/privacy">Политика конфиденциальности</a>
              <a href="/payment">Онлайн-оплата</a>
            </section>
          </div>
          <div className="footer-bottom">
            <p>*Instagram признана экстремистской организацией, деятельность которой запрещена в РФ</p>
            <a href="/">Версия для слабовидящих</a>
            <span>ООО «ЕС-КЛИНИКА»</span>
          </div>
        </footer>
      </div>
      <EditorLauncher />
      <ScrollEffects />
      <ContactWidget />
    </EditorProvider>
  );
}


