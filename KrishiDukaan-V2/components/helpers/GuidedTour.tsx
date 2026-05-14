'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

export interface TourStep {
  selector: string;
  title: string;
  body: string;
  side?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  /** Optional navigation hint — invoked just before showing this step */
  beforeShow?: () => void;
}

interface GuidedTourProps {
  steps: TourStep[];
  storageKey?: string;
  /** If true, run unconditionally — ignores localStorage. */
  forceOpen?: boolean;
  /** Delay before the first step appears (ms). Lets the app settle. */
  startDelay?: number;
  onFinish?: () => void;
}

const DEFAULT_KEY = 'kd_onboarding_complete';
const PADDING = 8;
const POPOVER_OFFSET = 14;

function isCompleted(key: string) {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function markCompleted(key: string) {
  try {
    window.localStorage.setItem(key, 'true');
  } catch {
    /* noop */
  }
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function resolveSide(
  rect: Rect | null,
  requested: TourStep['side'],
  popoverHeight: number,
  popoverWidth: number
): 'top' | 'bottom' | 'left' | 'right' | 'center' {
  if (!rect) return 'center';
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (requested && requested !== 'auto') {
    return requested;
  }

  if (rect.top - popoverHeight - POPOVER_OFFSET > 16) return 'top';
  if (rect.top + rect.height + popoverHeight + POPOVER_OFFSET < vh - 16) return 'bottom';
  if (rect.left - popoverWidth - POPOVER_OFFSET > 16) return 'left';
  if (rect.left + rect.width + popoverWidth + POPOVER_OFFSET < vw - 16) return 'right';
  return 'bottom';
}

function popoverPosition(
  rect: Rect | null,
  side: 'top' | 'bottom' | 'left' | 'right' | 'center',
  popoverWidth: number,
  popoverHeight: number
): { top: number; left: number } {
  if (!rect || side === 'center') {
    return {
      top: window.innerHeight / 2 - popoverHeight / 2,
      left: window.innerWidth / 2 - popoverWidth / 2,
    };
  }

  let top = 0;
  let left = 0;
  switch (side) {
    case 'top':
      top = rect.top - popoverHeight - POPOVER_OFFSET;
      left = rect.left + rect.width / 2 - popoverWidth / 2;
      break;
    case 'bottom':
      top = rect.top + rect.height + POPOVER_OFFSET;
      left = rect.left + rect.width / 2 - popoverWidth / 2;
      break;
    case 'left':
      top = rect.top + rect.height / 2 - popoverHeight / 2;
      left = rect.left - popoverWidth - POPOVER_OFFSET;
      break;
    case 'right':
      top = rect.top + rect.height / 2 - popoverHeight / 2;
      left = rect.left + rect.width + POPOVER_OFFSET;
      break;
  }

  left = Math.max(12, Math.min(left, window.innerWidth - popoverWidth - 12));
  top = Math.max(12, Math.min(top, window.innerHeight - popoverHeight - 12));
  return { top, left };
}

export function GuidedTour({
  steps,
  storageKey = DEFAULT_KEY,
  forceOpen,
  startDelay = 800,
  onFinish,
}: GuidedTourProps) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [popSize, setPopSize] = useState({ w: 320, h: 180 });

  const step = steps[index];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!forceOpen && isCompleted(storageKey)) return;
    const t = window.setTimeout(() => setActive(true), startDelay);
    return () => window.clearTimeout(t);
  }, [mounted, forceOpen, storageKey, startDelay]);

  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useLayoutEffect(() => {
    if (!active || !step) return;
    step.beforeShow?.();
    measure();
    if (popoverRef.current) {
      const pr = popoverRef.current.getBoundingClientRect();
      setPopSize({ w: pr.width, h: pr.height });
    }
    const onScroll = () => measure();
    const onResize = () => measure();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    const interval = window.setInterval(measure, 250);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      window.clearInterval(interval);
    };
  }, [active, step, measure]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const finish = useCallback(() => {
    setActive(false);
    if (!forceOpen) markCompleted(storageKey);
    onFinish?.();
  }, [forceOpen, storageKey, onFinish]);

  const next = useCallback(() => {
    if (index >= steps.length - 1) {
      finish();
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, steps.length, finish]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const side = useMemo(
    () => resolveSide(rect, step?.side, popSize.h, popSize.w),
    [rect, step, popSize]
  );

  const popPos = useMemo(
    () => popoverPosition(rect, side, popSize.w, popSize.h),
    [rect, side, popSize]
  );

  if (!mounted || !active || !step) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="kd-tour"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}
      >
        {/* Dim overlay with cut-out via 4 panels around the target */}
        {rect ? (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: Math.max(0, rect.top - PADDING),
                background: 'rgba(15, 30, 15, 0.55)',
                pointerEvents: 'auto',
              }}
              onClick={finish}
            />
            <div
              style={{
                position: 'fixed',
                top: rect.top + rect.height + PADDING,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 30, 15, 0.55)',
                pointerEvents: 'auto',
              }}
              onClick={finish}
            />
            <div
              style={{
                position: 'fixed',
                top: Math.max(0, rect.top - PADDING),
                left: 0,
                width: Math.max(0, rect.left - PADDING),
                height: rect.height + PADDING * 2,
                background: 'rgba(15, 30, 15, 0.55)',
                pointerEvents: 'auto',
              }}
              onClick={finish}
            />
            <div
              style={{
                position: 'fixed',
                top: Math.max(0, rect.top - PADDING),
                left: rect.left + rect.width + PADDING,
                right: 0,
                height: rect.height + PADDING * 2,
                background: 'rgba(15, 30, 15, 0.55)',
                pointerEvents: 'auto',
              }}
              onClick={finish}
            />
            {/* Highlight ring */}
            <motion.div
              layoutId="kd-tour-ring"
              style={{
                position: 'fixed',
                top: rect.top - PADDING,
                left: rect.left - PADDING,
                width: rect.width + PADDING * 2,
                height: rect.height + PADDING * 2,
                borderRadius: 18,
                boxShadow: '0 0 0 3px #2d5a27, 0 12px 40px rgba(0,0,0,0.25)',
                pointerEvents: 'none',
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            />
          </>
        ) : (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 30, 15, 0.55)',
              pointerEvents: 'auto',
            }}
            onClick={finish}
          />
        )}

        {/* Popover */}
        <motion.div
          ref={popoverRef}
          key={`step-${index}`}
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: popPos.top,
            left: popPos.left,
            width: 320,
            maxWidth: 'calc(100vw - 24px)',
            pointerEvents: 'auto',
            zIndex: 9999,
          }}
          className="bg-white rounded-3xl shadow-ambient border border-surface-container-highest p-5"
          role="dialog"
          aria-modal="true"
          aria-label={step.title}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              Step {index + 1} of {steps.length}
            </span>
            <button
              onClick={finish}
              aria-label="Skip onboarding"
              className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
            >
              Skip
            </button>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1.5 leading-tight">{step.title}</h3>
          <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-4">
            {step.body}
          </p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-5 bg-primary' : 'w-1.5 bg-surface-container-highest'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {index > 0 ? (
                <button
                  onClick={prev}
                  className="text-xs font-bold text-on-surface-variant hover:text-on-surface px-3 py-2 rounded-xl hover:bg-surface-container-low transition-colors"
                >
                  Back
                </button>
              ) : null}
              <button
                onClick={next}
                className="text-xs font-bold text-white bg-primary hover:bg-primary-container px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                {index === steps.length - 1 ? 'Got it' : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default GuidedTour;
