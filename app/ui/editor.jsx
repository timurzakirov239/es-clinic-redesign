"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { photoSource } from '../data/photo-sources';
const Context = createContext(null);
const STORAGE = "es-clinic-next-document-v1";
const FIXED_STORAGE = "es-clinic-next-fixed-layout-v1";
const gallery = [
  "hero",
  "family",
  "reception",
  "clinic",
  "history",
  "loyalty",
  "tishina",
  "frolov",
  "utin",
];
const fonts = {
  Исходный: "",
  Germes: "var(--font-germes), Arial, sans-serif",
  Aeroport: "var(--font-aeroport), Arial, sans-serif",
  "Times New Roman": '"Times New Roman", serif',
  Georgia: "Georgia, serif",
  Arial: "Arial, sans-serif",
};
const safeSource = (value) =>
  typeof value === "string" &&
  (/^https?:\/\//i.test(value) ||
    /^\/assets\//.test(value) ||
    /^data:image\/(png|jpeg|webp|gif);base64,/i.test(value));
function validate(data) {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    Object.keys(data).length > 500
  )
    throw new Error("Неверный формат файла");
  const result = {};
  for (const [id, item] of Object.entries(data)) {
    if (
      !/^[a-z][a-z0-9-]{0,100}$/.test(id) ||
      !item ||
      typeof item !== "object"
    )
      throw new Error("Неверный элемент");
    const clean = {};
    if (item.layout && typeof item.layout === "object") {
      clean.layout = {};
      for (const [key, min, max] of [
        ["x", -50000, 50000],
        ["y", -50000, 50000],
        ["scale", 10, 300],
        ["width", 10, 2400],
        ["height", 10, 2400],
      ]) {
        const value = item.layout[key];
        if (typeof value === "number" && Number.isFinite(value))
          clean.layout[key] = Math.max(min, Math.min(max, value));
      }
    }
    if (typeof item.text === "string") clean.text = item.text.slice(0, 30000);
    if (item.src) {
      if (!safeSource(item.src)) throw new Error("Недопустимая ссылка на фото");
      clean.src = item.src;
    }
    if (item.style && typeof item.style === "object") {
      clean.style = {};
      for (const key of [
        "fontSize",
        "lineHeight",
        "width",
        "fontWeight",
        "textAlign",
        "fontFamily",
        "color",
      ]) {
        const value = item.style[key];
        if (typeof value !== "string") continue;
        if (
          key === "fontSize" &&
          (!/^\d+(?:\.\d+)?px$/.test(value) || parseFloat(value) < 8 || parseFloat(value) > 160)
        )
          continue;
        if (key === "width" && !/^(?:[1-9]|[1-9]\d|100)%$/.test(value))
          continue;
        if (
          key === "lineHeight" &&
          !(Number(value) >= 0.8 && Number(value) <= 3)
        )
          continue;
        if (
          key === "fontWeight" &&
          !["400", "500", "600", "700"].includes(value)
        )
          continue;
        if (key === "textAlign" && !["left", "center", "right"].includes(value))
          continue;
        if (key === "fontFamily" && !Object.values(fonts).includes(value))
          continue;
        if (key === "color" && !/^#[0-9a-f]{6}$/i.test(value)) continue;
        clean.style[key] = value;
      }
    }
    result[id] = clean;
  }
  // Keep drafts made before the video card received a stable layout id.
  if (result["node-1-4-1"] && !result["video-card"])
    result["video-card"] = result["node-1-4-1"];
  delete result["node-1-4-1"];
  return result;
}
export function EditorProvider({ children }) {
  const [changes, setChanges] = useState({});
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [metrics, setMetrics] = useState(null);
  const registry = useRef(new Map());
  const pageRef = useRef(null);
  // Stable structural paths, independent of text edits and image replacements.
  useEffect(() => {
    const root = pageRef.current;
    const visit = (parent, path = "") => {
      Array.from(parent.children).forEach((element, index) => {
        const key = `${path}-${index}`;
        if (
          element.matches(
            "script,style,dialog,.hero-photo,.editor-launcher,.skip-link",
          ) ||
          element.closest("svg")
        )
          return;
        if (!element.matches("main,section,header,footer")) {
          // Rebuilt hero nodes must not inherit structural patches from older markup.
          // Keep the remaining page paths unchanged, preserving all lower-section drafts.
          const scope = element.closest("[data-layout-scope]")?.dataset.layoutScope;
          const id = element.dataset.editId || element.dataset.layoutId || `${scope || "node"}${key}`;
          element.dataset.layoutId = id;
          if (getComputedStyle(element).display === "inline")
            element.dataset.layoutInline = "true";
          if (!registry.current.has(id))
            registry.current.set(id, {
              type: "element",
              label:
                element.dataset.editorLabel ||
                element.getAttribute("aria-label") ||
                element.getAttribute("alt") ||
                `${element.tagName.toLowerCase()} · ${(element.textContent || "").trim().slice(0, 55)}`,
            });
        }
        if (!element.matches("[data-edit-id],svg")) visit(element, key);
      });
    };
    visit(root);
  }, []);
  useEffect(() => {
    const root = pageRef.current;
    if (!picking) return;
    const choose = (e) => {
      if (e.type === "keydown" && e.key !== "Enter") return;
      const element = e.target.closest("[data-layout-id]");
      if (!element || !root.contains(element)) return;
      e.preventDefault();
      e.stopPropagation();
      select(element.dataset.layoutId);
    };
    root.addEventListener("click", choose, true);
    root.addEventListener("keydown", choose, true);
    const focusable = Array.from(root.querySelectorAll("[data-layout-id]")).map(
      (element) => [element, element.getAttribute("tabindex")],
    );
    focusable.forEach(([element]) => element.setAttribute("tabindex", "0"));
    return () => {
      root.removeEventListener("click", choose, true);
      root.removeEventListener("keydown", choose, true);
      focusable.forEach(([element, value]) =>
        value === null
          ? element.removeAttribute("tabindex")
          : element.setAttribute("tabindex", value),
      );
    };
  }, [picking]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE);
      if (stored) setChanges(validate(JSON.parse(stored)));
    } catch {
      setMessage("Сохранённый черновик не удалось прочитать.");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE, JSON.stringify(changes));
      } catch {
        setMessage(
          "Память браузера заполнена. Экспортируйте черновик, чтобы сохранить изменения.",
        );
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [changes, ready]);
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPicking(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const select = (id) => {
    setSelected(id);
    setPicking(false);
    setOpen(true);
  };
  const update = (patch) =>
    setChanges((prev) => ({
      ...prev,
      [selected]: { ...prev[selected], ...patch },
    }));
  const style = (key, value) =>
    update({ style: { ...changes[selected]?.style, [key]: value } });
  const original = registry.current.get(selected);
  const current = changes[selected] || {};
  const layout = current.layout || {};
  const selectedNode = () => pageRef.current?.querySelector(`[data-layout-id="${selected}"]`);
  const measure = () => {
    const node = selectedNode();
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    let parentScale = 1;
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
      const scale = parseFloat(getComputedStyle(parent).scale);
      if (Number.isFinite(scale)) parentScale *= scale;
    }
    const css = getComputedStyle(node);
    const ownScale = parseFloat(css.scale);
    const totalScale = parentScale * (Number.isFinite(ownScale) ? ownScale : 1);
    const text = original?.type === 'text' || (original?.type === 'element' &&
      !!node.textContent.trim() && !node.querySelector('img,svg,video,button,a,p,h1,h2,h3,h4,details'));
    return { x: rect.left + window.scrollX, y: rect.top + window.scrollY,
      width: rect.width / totalScale, height: rect.height / totalScale,
      fontSize: parseFloat(css.fontSize) * totalScale, parentScale, totalScale, text };
  };
  useLayoutEffect(() => {
    if (!open || !selected) return;
    let frame;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure();
        setMetrics(prev => JSON.stringify(prev) === JSON.stringify(next) ? prev : next);
      });
    };
    refresh();
    const observer = new ResizeObserver(refresh);
    observer.observe(pageRef.current);
    const node = selectedNode();
    if (node) observer.observe(node);
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh);
    };
  }, [open, selected, changes]);
  const setCoordinate = (key, value) => {
    const live = measure();
    if (!live || value === '' || !Number.isFinite(Number(value))) return;
    setLayout({ [key]: Math.max(-50000, Math.min(50000,
      (layout[key] || 0) + (Number(value) - live[key]) / live.parentScale)) });
  };
  const setTextSize = (value) => {
    const live = measure();
    if (!live) return;
    style('fontSize', value === '' ? '' : `${Math.max(8, Math.min(160, Number(value) / live.totalScale))}px`);
  };
  const setLayout = (patch) =>
    setChanges((prev) => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        layout: { ...prev[selected]?.layout, ...patch },
      },
    }));
  const parentElement =
    selected &&
    pageRef.current
      ?.querySelector(`[data-layout-id="${selected}"]`)
      ?.parentElement?.closest("[data-layout-id]");
  const layoutCss = Object.entries(changes)
    .filter(([, value]) => value.layout || value.style?.fontSize)
    .map(([id, value]) => {
      const l = value.layout;
      return `[data-layout-id="${id}"]{${l ? `translate:${l.x || 0}px ${l.y || 0}px;scale:${(l.scale ?? 100) / 100};${l.width ? `width:${l.width}px!important;max-width:none!important;` : ""}${l.height ? `height:${l.height}px!important;min-height:0!important;` : ""}` : ''}${value.style?.fontSize ? `font-size:${value.style.fontSize}!important;` : ''}}[data-layout-id="${id}"][data-layout-inline]{display:inline-block;}`;
    })
    .join("\n");
  const exportDraft = () => {
    const blob = new Blob([JSON.stringify({ version: 1, changes }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "es-clinic-next-draft.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const fixCurrentView = () => {
    try {
      const clean = validate(changes);
      localStorage.setItem(STORAGE, JSON.stringify(clean));
      localStorage.setItem(FIXED_STORAGE, JSON.stringify(clean));
      setMessage("Текущий вид закреплён и будет применяться без скачка.");
    } catch {
      setMessage("Не удалось закрепить текущий вид в этом браузере.");
    }
  };
  const importDraft = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 12_000_000) throw new Error("Файл слишком большой");
      const parsed = JSON.parse(await file.text());
      if (parsed.version !== 1)
        throw new Error("Версия файла не поддерживается");
      const draft = validate(parsed.changes);
      const unknown = Object.keys(draft).filter(
        (id) => !registry.current.has(id),
      );
      if (unknown.length)
        throw new Error("Файл содержит элементы от другой версии страницы");
      setChanges(draft);
      setMessage("Черновик импортирован.");
    } catch (err) {
      setMessage(err.message || "Не удалось импортировать файл");
    }
    e.target.value = "";
  };
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      ) ||
      file.size > 3_000_000
    ) {
      setMessage("Выберите JPG, PNG, WebP или GIF до 3 МБ.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update({ src: reader.result });
    reader.readAsDataURL(file);
  };
  return (
    <Context.Provider
      value={{ changes, picking, select, registry, open, setOpen, setPicking }}
    >
      <style>{layoutCss}</style>
      {open && selected && (
        <style>{`[data-layout-id="${selected}"]{outline:2px solid #b4773a;outline-offset:4px;}`}</style>
      )}
      <div ref={pageRef} className={picking ? "page picking" : "page"} data-editing={open || picking}>
        {children}
      </div>
      {picking && (
        <div className="picker-hint" role="status">
          Выберите любой элемент на странице (кроме фона){" "}
          <button
            onClick={() => {
              setPicking(false);
              setOpen(true);
            }}
          >
            Отмена
          </button>
        </div>
      )}
      {open && (
        <aside className="editor-panel" aria-label="Редактор страницы">
          <div className="editor-title">
            <div>
              <strong>Изменить страницу</strong>
              <small>Локальный прототип · Next.js</small>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Закрыть редактор"
            >
              ×
            </button>
          </div>
          <p className="editor-note">
            Изменения видны только в этом браузере. Исходная версия и
            опубликованный сайт не меняются.
          </p>
          <button
            className="editor-primary"
            onClick={() => {
              setOpen(false);
              setPicking(true);
            }}
          >
            ↖ Выберите элемент
          </button>
          {original ? (
            <div className="editor-fields">
              <small>Элемент: {selected}</small>
              <strong>
                {original.label ||
                  (original.type === "text" ? "Текстовый блок" : "Фотография")}
              </strong>
              {parentElement && (
                <button onClick={() => select(parentElement.dataset.layoutId)}>
                  Выбрать группу выше
                </button>
              )}
              <fieldset className="layout-fields">
                <legend>Положение и размер</legend>
                <p className="editor-note">
                  Координаты левого верхнего угла элемента от левого верхнего
                  угла всей страницы (0, 0), независимо от прокрутки.
                  Перемещение не перестраивает соседние блоки.
                </p>
                <div className="editor-pair">
                  {[
                    ["x", "От левого края страницы, px"],
                    ["y", "От верха страницы, px"],
                  ].map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        aria-label={label}
                        type="number"
                        step="1"
                        value={metrics ? Math.round(metrics[key] * 100) / 100 : ''}
                        onChange={(e) => setCoordinate(key, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
                <div className="layout-arrows">
                  {[
                    ["←", "Влево", "x", -10],
                    ["↑", "Вверх", "y", -10],
                    ["↓", "Вниз", "y", 10],
                    ["→", "Вправо", "x", 10],
                  ].map(([symbol, label, key, delta]) => (
                    <button
                      key={label}
                      aria-label={label}
                      title={`${label} на 10 px`}
                      onClick={() =>
                        setLayout({
                          [key]: Math.max(
                            -50000,
                            Math.min(50000, (layout[key] || 0) + delta / (metrics?.parentScale || 1)),
                          ),
                        })
                      }
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
                {metrics?.text ? <label>
                  Размер текста, px
                  <input aria-label="Размер текста, px" type="number" min="8" max="160" step="1"
                    value={Math.round(metrics.fontSize * 100) / 100}
                    onChange={e => setTextSize(e.target.value)} />
                </label> : <label>
                  Масштаб, %
                  <input
                    aria-label="Масштаб, %"
                    type="number"
                    min="10"
                    max="300"
                    value={layout.scale ?? 100}
                    onChange={(e) =>
                      setLayout({
                        scale: Math.max(
                          10,
                          Math.min(300, Number(e.target.value)),
                        ),
                      })
                    }
                  />
                </label>}
                <div className="editor-pair">
                  {[
                    ["width", "Ширина, px"],
                    ["height", "Высота, px"],
                  ].map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        aria-label={label}
                        type="number"
                        min="10"
                        max="2400"
                        step="1"
                        value={layout[key] ?? (metrics ? Math.round(metrics[key] * 100) / 100 : "")}
                        onChange={(e) =>
                          setLayout({
                            [key]:
                              e.target.value === ""
                                ? undefined
                                : Math.max(
                                    10,
                                    Math.min(2400, Number(e.target.value)),
                                  ),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
                <button onClick={() => update({ layout: {} })}>
                  Сбросить положение и размер
                </button>
              </fieldset>
              {original.type === "text" ? (
                <>
                  <label>
                    Текст
                    <textarea
                      aria-label="Текст"
                      rows={7}
                      value={current.text ?? original.text}
                      onChange={(e) => update({ text: e.target.value })}
                    />
                  </label>
                  <label>
                    Шрифт
                    <select
                      aria-label="Шрифт"
                      value={current.style?.fontFamily || ""}
                      onChange={(e) => style("fontFamily", e.target.value)}
                    >
                      {Object.entries(fonts).map(([label, value]) => (
                        <option key={label} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="editor-pair">
                    <label>
                      Размер, px
                      <input
                        aria-label="Размер, px"
                        type="number"
                        min="8"
                        max="160"
                        placeholder="Исходный"
                        value={metrics ? Math.round(metrics.fontSize * 100) / 100 : ''}
                        onChange={(e) => setTextSize(e.target.value)}
                      />
                    </label>
                    <label>
                      Интервал
                      <input
                        aria-label="Интервал"
                        type="number"
                        min="0.8"
                        max="3"
                        step="0.05"
                        placeholder="Исходный"
                        value={current.style?.lineHeight || ""}
                        onChange={(e) => style("lineHeight", e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="editor-pair">
                    <label>
                      Начертание
                      <select
                        value={current.style?.fontWeight || ""}
                        onChange={(e) => style("fontWeight", e.target.value)}
                      >
                        <option value="">Исходное</option>
                        <option value="400">Обычное</option>
                        <option value="500">Среднее</option>
                        <option value="700">Жирное</option>
                      </select>
                    </label>
                    <label>
                      Выравнивание
                      <select
                        value={current.style?.textAlign || ""}
                        onChange={(e) => style("textAlign", e.target.value)}
                      >
                        <option value="">Исходное</option>
                        <option value="left">Слева</option>
                        <option value="center">По центру</option>
                        <option value="right">Справа</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Цвет
                    <input
                      type="color"
                      value={current.style?.color || "#533e2d"}
                      onChange={(e) => style("color", e.target.value)}
                    />
                  </label>
                </>
              ) : original.type === "photo" ? (
                <>
                  <label>
                    Фотография из библиотеки
                    <select
                      aria-label="Фотография из библиотеки"
                      value={
                        gallery.includes(
                          (current.src || original.src)
                            .split("/")
                            .pop()
                            .replace(".webp", ""),
                        )
                          ? current.src || original.src
                          : ""
                      }
                      onChange={(e) => update({ src: e.target.value })}
                    >
                      <option value="" disabled>
                        Другая фотография
                      </option>
                      {gallery.map((n) => (
                        <option key={n} value={photoSource(n)}>
                          {
                            {
                              hero: "Первый экран",
                              family: "Бабушка с внуком",
                              reception: "Ресепшен",
                              clinic: "Интерьер",
                              history: "Фасад клиники",
                              loyalty: "Семья",
                              tishina: "Дарья Тишина",
                              frolov: "Павел Фролов",
                              utin: "Алексей Утин",
                            }[n]
                          }
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Ссылка на изображение
                    <input
                      type="url"
                      placeholder="https://…"
                      defaultValue={
                        current.src?.startsWith("http") ? current.src : ""
                      }
                      key={selected}
                      onBlur={(e) => {
                        if (!e.target.value) return;
                        if (safeSource(e.target.value))
                          update({ src: e.target.value });
                        else setMessage("Нужна ссылка http:// или https://");
                      }}
                    />
                  </label>
                  <label>
                    Загрузить фотографию (до 3 МБ)
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={upload}
                    />
                  </label>
                </>
              ) : null}
              {original.type !== "element" && (
                <label>
                  Ширина блока: {current.style?.width || "100%"}
                  <input
                    aria-label="Ширина блока"
                    type="range"
                    min="20"
                    max="100"
                    value={parseInt(current.style?.width) || 100}
                    onChange={(e) => style("width", `${e.target.value}%`)}
                  />
                </label>
              )}
              <button
                onClick={() =>
                  setChanges((prev) => {
                    const next = { ...prev };
                    delete next[selected];
                    return next;
                  })
                }
              >
                Вернуть исходный элемент
              </button>
            </div>
          ) : (
            <p className="editor-note">
              Нажмите «Выберите элемент». Панель скроется, и вы сможете выбрать
              блок на всей ширине страницы.
            </p>
          )}
          <div className="editor-actions">
            <button className="editor-fix-view" onClick={fixCurrentView}>
              Зафиксировать вид без скачка
            </button>
            <button onClick={exportDraft}>Экспорт JSON</button>
            <label className="import-label">
              Импорт JSON
              <input
                aria-label="Импорт JSON"
                type="file"
                accept="application/json,.json"
                onChange={importDraft}
              />
            </label>
            <button
              onClick={() => {
                if (
                  window.confirm("Удалить все изменения этой новой версии?")
                ) {
                  localStorage.removeItem(FIXED_STORAGE);
                  setChanges({});
                  setMessage("Восстановлен текст документа.");
                }
              }}
            >
              Сбросить все изменения
            </button>
          </div>
          <p className="editor-note" role="status">
            {message ||
              `${Object.keys(changes).length} изменённых элементов · автосохранение`}
          </p>
        </aside>
      )}
    </Context.Provider>
  );
}

export function Editable({ id, as: Tag = "p", className = "", children }) {
  const { changes, picking, select, registry } = useContext(Context);
  useEffect(() => {
    registry.current.set(id, { type: "text", text: children });
    return () => registry.current.delete(id);
  }, [id, children, registry]);
  const patch = changes[id] || {};
  return (
    <Tag
      data-edit-id={id}
      data-edit-kind="text"
      className={className}
      style={patch.style}
      tabIndex={picking ? 0 : undefined}
      onClick={
        picking
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              select(id);
            }
          : undefined
      }
      onKeyDown={
        picking
          ? (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                select(id);
              }
            }
          : undefined
      }
    >
      {patch.text ?? children}
    </Tag>
  );
}
export function EditablePhoto({
  id,
  src,
  alt,
  className = "",
  priority = false,
}) {
  const { changes, picking, select, registry } = useContext(Context);
  useEffect(() => {
    registry.current.set(id, { type: "photo", src });
    return () => registry.current.delete(id);
  }, [id, src, registry]);
  const patch = changes[id] || {};
  const finalSrc = patch.src || src;
  const custom = !!patch.src && !patch.src.startsWith("/assets/");
  return (
    <div
      data-edit-id={id}
      data-edit-kind="photo"
      className={`photo ${className}`}
      style={patch.style}
      tabIndex={picking && !priority ? 0 : undefined}
      onClick={
        picking && !priority
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              select(id);
            }
          : undefined
      }
      onKeyDown={
        picking
          ? (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                select(id);
              }
            }
          : undefined
      }
    >
      <Image
        src={finalSrc}
        alt={alt}
        fill
        sizes={priority ? "100vw" : "(max-width: 750px) 100vw, 50vw"}
        preload={priority}
        quality={90}
        loading={priority ? undefined : "lazy"}
        unoptimized={custom || finalSrc.startsWith('/assets/doctors-original/') || finalSrc === '/assets/official-hero.png'}
      />
    </div>
  );
}
export function EditorLauncher() {
  const { open, setOpen, setPicking } = useContext(Context);
  return (
    <button
      className="editor-launcher"
      onClick={() => {
        setPicking(false);
        setOpen(!open);
      }}
      aria-expanded={open}
    >
      ✎ Изменить
    </button>
  );
}
