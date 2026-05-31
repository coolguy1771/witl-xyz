"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getJobSpinnerTag, getOkTag, JOB_DONE_TAG, JOB_SPINNER_MS } from "./boot-animation";
import { bootConsoleFontClassName } from "./boot-font";
import { BOOT_STORAGE_KEY, CLIENT_IP_PLACEHOLDER, SYSTEMD_BOOT_LINES, type BootLine } from "./systemd-boot-lines";

const DEFAULT_LINE_DELAY = 140;
const FADE_OUT_MS = 180;
const CURSOR_BLINK_MS = 530;
const BOOT_PACE = 1.4;
const MOBILE_BOOT_PACE = 1.1;
const BOOT_START_DELAY = 250;
const BOOT_FINISH_DELAY = 700;
const TYPEWRITER_CHAR_MS = 35;
const PROMPT_WAIT_MS = 500;
const ENTER_KEY_DELAY_MS = 160;
const PROMPT_CURSOR_WAIT_MS = 200;

function getBootPace(): number {
  if (typeof window === "undefined") {
    return BOOT_PACE;
  }

  return window.matchMedia("(max-width: 640px)").matches ? MOBILE_BOOT_PACE : BOOT_PACE;
}

function getLineDelay(line: BootLine): number {
  return line.delayMs ?? DEFAULT_LINE_DELAY;
}

interface BootLineRowProps {
  line: BootLine;
  isActiveJob: boolean;
  jobSpinnerFrame: number;
}

function BootLineRow({ line, isActiveJob, jobSpinnerFrame }: BootLineRowProps) {
  if (line.kind === "ok") {
    return (
      <div className="systemd-boot-line">
        <span className="systemd-boot-tag systemd-boot-tag-ok">{getOkTag()}</span>
        <span className="systemd-boot-line-text">{line.text}</span>
      </div>
    );
  }

  if (line.kind === "job") {
    const tag = isActiveJob ? getJobSpinnerTag(jobSpinnerFrame) : JOB_DONE_TAG;

    return (
      <div className="systemd-boot-line">
        <span className="systemd-boot-tag systemd-boot-tag-job">{tag}</span>
        <span className="systemd-boot-line-text">{line.text}</span>
      </div>
    );
  }

  if (line.kind === "kernel") {
    return <div className="systemd-boot-line systemd-boot-line-kernel">{line.text}</div>;
  }

  if (line.kind === "banner") {
    return <div className="systemd-boot-line systemd-boot-line-banner">{line.text}</div>;
  }

  if (line.kind === "warn") {
    return <div className="systemd-boot-line systemd-boot-line-warn">{line.text}</div>;
  }

  return (
    <div className="systemd-boot-line systemd-boot-line-plain systemd-boot-prompt-line">
      {line.text || "\u00A0"}
    </div>
  );
}

function BootCursor({ visible }: { visible: boolean }) {
  return (
    <span className={`systemd-boot-cursor${visible ? " systemd-boot-cursor-visible" : ""}`} aria-hidden="true">
      {"\u2588"}
    </span>
  );
}

interface TypingBootLineProps {
  prefix: string;
  input: string;
  charDelayMs: number;
  cursorWaitMs: number;
  showCursor: boolean;
  onComplete: () => void;
}

function TypingBootLine({
  prefix,
  input,
  charDelayMs,
  cursorWaitMs,
  showCursor,
  onComplete,
}: TypingBootLineProps) {
  const [typed, setTyped] = useState("");
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    setTyped("");
    let index = 0;
    let timeoutId = 0;

    const finishTyping = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      timeoutId = window.setTimeout(onComplete, ENTER_KEY_DELAY_MS);
    };

    const typeNext = () => {
      index += 1;
      setTyped(input.slice(0, index));

      if (index >= input.length) {
        finishTyping();
        return;
      }

      timeoutId = window.setTimeout(typeNext, charDelayMs);
    };

    const startTyping = () => {
      if (input.length === 0) {
        finishTyping();
        return;
      }

      timeoutId = window.setTimeout(typeNext, charDelayMs);
    };

    timeoutId = window.setTimeout(startTyping, cursorWaitMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [input, charDelayMs, cursorWaitMs, onComplete]);

  return (
    <div className="systemd-boot-line systemd-boot-line-plain systemd-boot-prompt-line">
      {prefix}
      {typed}
      <BootCursor visible={showCursor} />
    </div>
  );
}

interface PromptBootLineProps {
  prefix: string;
  showCursor: boolean;
  waitMs: number;
  onComplete: () => void;
}

function PromptBootLine({ prefix, showCursor, waitMs, onComplete }: PromptBootLineProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onComplete, waitMs);
    return () => window.clearTimeout(timeoutId);
  }, [waitMs, onComplete]);

  return (
    <div className="systemd-boot-line systemd-boot-line-plain systemd-boot-prompt-line">
      {prefix}
      <BootCursor visible={showCursor} />
    </div>
  );
}

export function SystemdBootScreen() {
  const [active, setActive] = useState<boolean | null>(null);
  const [visibleLines, setVisibleLines] = useState<BootLine[]>([]);
  const [pendingLine, setPendingLine] = useState<BootLine | null>(null);
  const [fading, setFading] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [jobSpinnerFrame, setJobSpinnerFrame] = useState(0);
  const [clientIp, setClientIp] = useState(CLIENT_IP_PLACEHOLDER);
  const scrollRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const bootPaceRef = useRef(BOOT_PACE);
  const lineIndexRef = useRef(0);
  const revealTimeoutRef = useRef(0);
  const reduceMotionRef = useRef(false);
  const pendingLineRef = useRef<BootLine | null>(null);

  const finishBoot = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    window.clearTimeout(revealTimeoutRef.current);

    try {
      sessionStorage.setItem(BOOT_STORAGE_KEY, "1");
    } catch {
      // Ignore storage failures; boot screen still dismisses.
    }

    setPendingLine(null);
    setFading(true);
    document.body.classList.remove("systemd-boot-active");
    window.setTimeout(() => setActive(false), FADE_OUT_MS);
  }, []);

  const scheduleReveal = useCallback((delayMs: number) => {
    window.clearTimeout(revealTimeoutRef.current);
    revealTimeoutRef.current = window.setTimeout(() => {
      revealTimeoutRef.current = 0;
      revealNextRef.current();
    }, delayMs);
  }, []);

  const revealNextRef = useRef<() => void>(() => {});

  const commitLine = useCallback((line: BootLine) => {
    lineIndexRef.current += 1;
    setVisibleLines((prev) => [...prev, line]);
  }, []);

  const revealNext = useCallback(() => {
    if (lineIndexRef.current >= SYSTEMD_BOOT_LINES.length) {
      window.setTimeout(finishBoot, BOOT_FINISH_DELAY);
      return;
    }

    const line = SYSTEMD_BOOT_LINES[lineIndexRef.current];

    if (line.reveal === "typewriter" || line.reveal === "prompt") {
      setPendingLine(line);
      return;
    }

    commitLine(line);
    scheduleReveal(getLineDelay(line) * bootPaceRef.current);
  }, [commitLine, finishBoot, scheduleReveal]);

  revealNextRef.current = revealNext;

  const handlePendingComplete = useCallback(() => {
    const line = pendingLineRef.current;
    if (!line) return;

    commitLine(line);
    setPendingLine(null);
    pendingLineRef.current = null;
    scheduleReveal(getLineDelay(line) * bootPaceRef.current);
  }, [commitLine, scheduleReveal]);

  useEffect(() => {
    pendingLineRef.current = pendingLine;
  }, [pendingLine]);

  useLayoutEffect(() => {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    try {
      if (sessionStorage.getItem(BOOT_STORAGE_KEY) || reduceMotionRef.current) {
        setActive(false);
        return;
      }
    } catch {
      setActive(false);
      return;
    }

    setActive(true);
    bootPaceRef.current = getBootPace();
    document.body.classList.add("systemd-boot-active");
  }, []);

  useEffect(() => {
    return () => {
      document.body.classList.remove("systemd-boot-active");
      window.clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ip")
      .then((r) => r.json() as Promise<{ ip: string }>)
      .then(({ ip }) => { if (!cancelled) setClientIp(ip); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (active !== true) return;

    lineIndexRef.current = 0;
    setVisibleLines([]);
    setPendingLine(null);
    scheduleReveal(BOOT_START_DELAY);

    return () => {
      window.clearTimeout(revealTimeoutRef.current);
    };
  }, [active, scheduleReveal]);

  useEffect(() => {
    if (active !== true) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      event.preventDefault();
      finishBoot();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, finishBoot]);

  const handleOverlayPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "touch") return;
      finishBoot();
    },
    [finishBoot],
  );

  useEffect(() => {
    if (active !== true) return;

    const intervalId = window.setInterval(() => {
      setShowCursor((prev) => !prev);
    }, CURSOR_BLINK_MS);

    return () => window.clearInterval(intervalId);
  }, [active]);

  useEffect(() => {
    const lastLine = visibleLines.at(-1);
    const waitingOnJob = !pendingLine && lastLine?.kind === "job";

    if (!waitingOnJob || active !== true) {
      setJobSpinnerFrame(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setJobSpinnerFrame((frame) => frame + 1);
    }, JOB_SPINNER_MS);

    return () => window.clearInterval(intervalId);
  }, [active, pendingLine, visibleLines]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [visibleLines, pendingLine, jobSpinnerFrame]);

  if (active === false) return null;

  if (active === null) {
    return <div className={`systemd-boot-overlay ${bootConsoleFontClassName}`} aria-hidden="true" />;
  }

  const lastLine = visibleLines.at(-1);
  const activeJobIndex = visibleLines.findLastIndex((line) => line.kind === "job");
  const typewriterDelay = TYPEWRITER_CHAR_MS * bootPaceRef.current;
  const promptWait = PROMPT_WAIT_MS * bootPaceRef.current;
  const cursorWait = PROMPT_CURSOR_WAIT_MS * bootPaceRef.current;

  return (
    <div
      className={`systemd-boot-overlay ${bootConsoleFontClassName}${fading ? " systemd-boot-overlay-exit" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Red Hat Enterprise Linux boot sequence"
      aria-live="polite"
      onPointerUp={handleOverlayPointerUp}
    >
      <div className="systemd-boot-screen">
        <div ref={scrollRef} className="systemd-boot-log">
          {visibleLines.map((line, index) => (
            <BootLineRow
              key={`${index}-${line.text}`}
              line={line.text.includes(CLIENT_IP_PLACEHOLDER) ? { ...line, text: line.text.replace(CLIENT_IP_PLACEHOLDER, clientIp) } : line}
              isActiveJob={!pendingLine && index === activeJobIndex && lastLine?.kind === "job"}
              jobSpinnerFrame={jobSpinnerFrame}
            />
          ))}
          {pendingLine?.reveal === "typewriter" && (
            <TypingBootLine
              prefix={pendingLine.promptPrefix ?? ""}
              input={
                pendingLine.promptInput ??
                (pendingLine.promptPrefix
                  ? pendingLine.text.slice(pendingLine.promptPrefix.length)
                  : pendingLine.text)
              }
              charDelayMs={typewriterDelay}
              cursorWaitMs={cursorWait}
              showCursor={showCursor}
              onComplete={handlePendingComplete}
            />
          )}
          {pendingLine?.reveal === "prompt" && (
            <PromptBootLine
              prefix={pendingLine.promptPrefix ?? pendingLine.text}
              showCursor={showCursor}
              waitMs={promptWait}
              onComplete={handlePendingComplete}
            />
          )}
        </div>
        <button type="button" className="systemd-boot-skip-sr" onClick={finishBoot}>
          Skip boot sequence
        </button>
      </div>
    </div>
  );
}
