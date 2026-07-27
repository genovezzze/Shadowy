"use client"

import { CSSProperties, useEffect, useRef, useState } from "react"

const FULL_TEXT =
  'Klients "ARIRI Labs" piezvanija ar jautajumu arpus manas atbildibas — paskaidrošana aiznema 40 minutes.'

const ACCENT = "#4ade80"
const ACCENT_SOFT = "rgba(74,222,128,0.18)"
const CARD_W = 480
const CARD_MIN_H = 400

const SCENES = [
  { name: "ievade",      dur: 3.4 },
  { name: "apstrade",   dur: 1.3 },
  { name: "melnraksts", dur: 3.0 },
  { name: "saglabats",  dur: 2.6 },
] as const

type SceneName = (typeof SCENES)[number]["name"]

const TOTAL = SCENES.reduce((s, sc) => s + sc.dur, 0)

function clamp01(v: number) { return Math.max(0, Math.min(1, v)) }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3) }
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function sceneAt(globalT: number): { name: SceneName; lt: number; dur: number } {
  let t = globalT % TOTAL
  for (const sc of SCENES) {
    if (t < sc.dur) return { name: sc.name, lt: t, dur: sc.dur }
    t -= sc.dur
  }
  const last = SCENES[SCENES.length - 1]
  return { name: last.name, lt: last.dur, dur: last.dur }
}

const cardStyle: CSSProperties = {
  width: CARD_W,
  minHeight: CARD_MIN_H,
  position: "relative",
  overflow: "hidden",
  background: "#0f0f10",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: "24px 26px",
  boxSizing: "border-box",
  boxShadow: "0 24px 60px -16px rgba(0,0,0,0.6)",
  fontFamily: "'Inter', system-ui, sans-serif",
}

function InputFace({ typed, showCaret, chipsT }: { typed: string; showCaret: boolean; chipsT: number }) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#f5f5f5", letterSpacing: "-0.01em", lineHeight: 1.25 }}>
        Pastāsti, kas šodien aizņēma papildu laiku
      </div>
      <div style={{ marginTop: 7, fontSize: 12, color: "#8a8a8e", lineHeight: 1.5, maxWidth: 400 }}>
        Apraksti situāciju saviem vārdiem vai ierunā to. Shadowy izveidos melnraksta ierakstus pārskatīšanai
      </div>
      <div style={{ marginTop: 16, background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "13px 15px", minHeight: 68 }}>
        <div style={{ fontSize: 13, color: "#e8e8e8", lineHeight: 1.5 }}>
          {typed}<span style={{ opacity: showCaret ? 1 : 0, color: "#8a8a8e" }}>|</span>
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8a8a8e", fontSize: 11.5 }}>
            🎙0 Ierunāt
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 11, color: "#5f5f63" }}>{typed.length}/4000</span>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#111", fontSize: 12 }}>↑</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 11, opacity: chipsT, transform: `translateY(${(1 - chipsT) * 6}px)`, display: "flex", flexWrap: "wrap", gap: 7 } as CSSProperties}>
        {["💬 Pārtrauca ar jautājumiem", "⏱ Gaidiāju informāciju", "⚡ Negāidīts steidzāms uzdevums"].map((label, i) => (
          <div key={i} style={{ padding: "6px 11px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", color: "#c9c9cc", fontSize: 11 }}>{label}</div>
        ))}
      </div>
    </div>
  )
}

function DraftFace() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f5f5f5" }}>Pārskati izveidotos ierakstus</div>
          <div style={{ marginTop: 3, fontSize: 11, color: "#8a8a8e" }}>Pirms saglabāšanas pārbaudi, vai ieraksti ir pareizi.</div>
        </div>
        <div style={{ padding: "4px 9px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#c9c9cc", fontSize: 10.5, whiteSpace: "nowrap" }}>Iekļauti 1 no 1</div>
      </div>
      <div style={{ marginTop: 12, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ padding: "4px 9px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#a8a8ac", fontSize: 10.5 }}>Melnraksts 1</span>
          <span style={{ padding: "4px 9px", borderRadius: 999, background: ACCENT_SOFT, color: ACCENT, fontSize: 10.5 }}>✓ Iekļauts</span>
        </div>
        <div style={{ marginTop: 9, fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>Skaidroju jautājumu ārpus atbildības</div>
        <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: "4px 10px", fontSize: 10.5, color: "#7f7f84" } as CSSProperties}>
          {["darbs ārpus lomas", "40 min.", "Ārpus lomas", "Klients: ARIRI Labs", "98%"].map((tag, i) => (
            <span key={i}>{tag}</span>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#c7c7ca", lineHeight: 1.5 }}>
          Sniedzu skaidrojumu klienta jautājumā, kas bija ārpus manas atbildības.
        </div>
        <div style={{ marginTop: 10, background: "#141414", borderRadius: 9, padding: "9px 12px" }}>
          <div style={{ fontSize: 9.5, letterSpacing: "0.08em", color: "#6a6a6e", fontWeight: 600 }}>IETEKME UZ DARBU</div>
          <div style={{ marginTop: 4, fontSize: 11.5, color: "#d4d4d6", lineHeight: 1.5 }}>Palīdzēja klientam saņemt atbildi un novērsa papildu neskaidrības.</div>
        </div>
        <div style={{ marginTop: 10, height: 1, background: "rgba(255,255,255,0.08)" }} />
        <div style={{ marginTop: 9, display: "flex", justifyContent: "flex-end", gap: 14, alignItems: "center", fontSize: 11 }}>
          <span style={{ color: "#9a9a9e" }}>✎ Rediģēt</span>
          <span style={{ color: "#e5605a" }}>Dzēst</span>
          <span style={{ padding: "5px 11px", borderRadius: 999, background: "#f2f2f2", color: "#111", fontWeight: 600 }}>✓ Iekļauts</span>
        </div>
      </div>
      <div style={{ marginTop: 10, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11, padding: "10px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9a9a9e", fontSize: 11 }}>
          <span style={{ color: ACCENT }}>🛡️</span> Ar vienu pogu tiks saglabāti visi iekļauti ieraksti.
        </div>
        <div style={{ padding: "7px 12px", borderRadius: 999, background: "#f2f2f2", color: "#111", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>⬇ Saglabāt</div>
      </div>
    </div>
  )
}

function SavedFace() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "30px 24px" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: ACCENT_SOFT, border: `2px solid ${ACCENT}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: ACCENT }}>✓</div>
      <div style={{ marginTop: 14, fontSize: 17, fontWeight: 700, color: "#f5f5f5" }}>Ieraksti saglabāti</div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#8a8a8e", maxWidth: 300, lineHeight: 1.5 }}>Ieraksts pievienots tavam darba žurnālam.</div>
      <div style={{ marginTop: 13, padding: "5px 11px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#a8a8ac", fontSize: 10.5 }}>Skaidroju jautājumu ārpus atbildības · 40 min.</div>
    </div>
  )
}

function SceneIevade({ lt, dur }: { lt: number; dur: number }) {
  const typeSpan = Math.min(2.6, dur * 0.72)
  const n = Math.floor(clamp01(lt / typeSpan) * FULL_TEXT.length)
  const typed = FULL_TEXT.slice(0, n)
  const showCaret = Math.floor(lt * 2) % 2 === 0
  const chipsT = easeOut(clamp01((lt - typeSpan - 0.15) / 0.4))
  return (
    <div style={cardStyle}>
      <InputFace typed={typed} showCaret={showCaret} chipsT={chipsT} />
    </div>
  )
}

function SceneApstrade({ lt, dur }: { lt: number; dur: number }) {
  const fadeIn = easeOut(clamp01(lt / 0.25))
  const fadeOut = 1 - easeOut(clamp01((lt - (dur - 0.3)) / 0.3))
  const overlayOpacity = Math.min(fadeIn, fadeOut)
  const spin = (lt * 260) % 360
  return (
    <div style={cardStyle}>
      <InputFace typed={FULL_TEXT} showCaret={false} chipsT={1} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.72)", borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 11, opacity: overlayOpacity }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.15)", borderTopColor: ACCENT, transform: `rotate(${spin}deg)` }} />
        <div style={{ color: "#d8d8da", fontSize: 12, letterSpacing: "0.02em" }}>Sagatavo melnrakstu…</div>
      </div>
    </div>
  )
}

function SceneMelnraksts({ lt }: { lt: number }) {
  const flipSpan = 1.05
  const flipT = easeInOut(clamp01(lt / flipSpan))
  const rotY = flipT * 180
  if (flipT >= 1) {
    return <div style={cardStyle}><DraftFace /></div>
  }
  return (
    <div style={{ perspective: "1400px" }}>
      <div style={{ width: CARD_W, minHeight: CARD_MIN_H, position: "relative", transformStyle: "preserve-3d", transform: `rotateY(${rotY}deg)` }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: CARD_W, minHeight: CARD_MIN_H, backfaceVisibility: "hidden" }}>
          <div style={cardStyle}><InputFace typed={FULL_TEXT} showCaret={false} chipsT={1} /></div>
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, width: CARD_W, minHeight: CARD_MIN_H, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <div style={cardStyle}><DraftFace /></div>
        </div>
      </div>
    </div>
  )
}

function SceneSaglabats({ lt }: { lt: number }) {
  const crossT = easeInOut(clamp01((lt - 0.62) / 0.5))
  return (
    <div style={cardStyle}>
      <div style={{ opacity: 1 - crossT }}><DraftFace /></div>
      <div style={{ opacity: crossT, pointerEvents: "none" } as CSSProperties}><SavedFace /></div>
    </div>
  )
}

export function AIDraftAnimation() {
  const [time, setTime] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [innerH, setInnerH] = useState(CARD_MIN_H)

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return
      setScale(Math.min(1, containerRef.current.offsetWidth / CARD_W))
    }
    const updateHeight = () => {
      if (!innerRef.current) return
      // The four scenes have different natural heights, so measuring each one
      // made the card resize as the animation cycled. Locking to the tallest
      // height seen keeps it fixed - it can grow into a taller scene once, but
      // never shrinks back.
      const measured = innerRef.current.scrollHeight
      setInnerH((prev) => Math.max(prev, measured))
    }
    updateScale()
    updateHeight()
    const roOuter = new ResizeObserver(updateScale)
    const roInner = new ResizeObserver(updateHeight)
    if (containerRef.current) roOuter.observe(containerRef.current)
    if (innerRef.current) roInner.observe(innerRef.current)
    return () => { roOuter.disconnect(); roInner.disconnect() }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "120px 0px" },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    startRef.current = null
    let lastUpdate = 0
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts
      if (ts - lastUpdate >= 1000 / 30) {
        setTime((ts - startRef.current) / 1000)
        lastUpdate = ts
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isVisible])

  const { name, lt, dur } = sceneAt(time)

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative", height: innerH * scale }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div
          ref={innerRef}
          style={{ flexShrink: 0, transformOrigin: "top center", transform: `scale(${scale})`, willChange: "transform" }}
        >
          {name === "ievade"      && <SceneIevade      lt={lt} dur={dur} />}
          {name === "apstrade"    && <SceneApstrade    lt={lt} dur={dur} />}
          {name === "melnraksts"  && <SceneMelnraksts  lt={lt} />}
          {name === "saglabats"   && <SceneSaglabats   lt={lt} />}
        </div>
      </div>
    </div>
  )
}
