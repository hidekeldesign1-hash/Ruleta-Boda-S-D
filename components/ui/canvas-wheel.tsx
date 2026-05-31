"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { getSecureRandomInt, getSecureRandomIntRange } from "@/lib/crypto-random";
import {
  calculateTargetRotation,
  easeOutCubic,
  getSegmentAngle,
  TWO_PI,
} from "@/lib/wheel-math";

const SPIN_DURATION_MS = 5500;

const COLORS = {
  cream: "#FDFBF7",
  creamAlt: "#F7F3EB",
  goldLight: "#F9F295",
  goldMid: "#D4AF37",
  goldDark: "#9A7832",
  goldStroke: "#C9A962",
  goldText: "#A8893E",
  bronze: "#8B6914",
  marbleBase: "#F5F2EC",
};

export interface CanvasWheelHandle {
  spin: () => void;
}

interface CanvasWheelProps {
  names: string[];
  slotCount?: number;
  spinPool?: number[];
  onSpinEnd: (winnerIndex: number) => void;
  onSpinStart?: () => void;
  disabled?: boolean;
}

interface WheelCache {
  canvas: HTMLCanvasElement;
  size: number;
  namesKey: string;
  slotCount: number;
}

/** Limita píxeles en iPad/móvil para mantener 60fps */
function getEffectiveDpr(): number {
  const raw = window.devicePixelRatio || 1;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isTablet = window.matchMedia("(max-width: 1024px)").matches;

  if (isCoarsePointer || isTablet) {
    return Math.min(raw, 1.5);
  }

  return Math.min(raw, 2);
}

function formatSegmentNumber(index: number): string {
  const number = index + 1;
  return number < 100 ? String(number).padStart(2, "0") : "100";
}

interface SegmentLabel {
  number: string;
  name: string;
}

function parseSegmentLabel(raw: string, index: number): SegmentLabel {
  const separator = raw.indexOf(" · ");
  if (separator !== -1) {
    return {
      number: raw.slice(0, separator).trim(),
      name: raw.slice(separator + 3).trim(),
    };
  }
  return {
    number: formatSegmentNumber(index),
    name: raw.trim(),
  };
}

function getLabelMetrics(segmentCount: number, radius: number) {
  const segmentAngle = getSegmentAngle(segmentCount);
  const hubRadius = radius * 0.12;
  const labelOuter = radius * 0.955;
  const labelInner = hubRadius * 1.5;
  const bandHeight = labelOuter - labelInner;

  if (segmentCount >= 80) {
    return {
      segmentAngle,
      hubRadius,
      labelInner,
      numberRadius: labelOuter - 4,
      numberFontSize: 7,
      nameFontSize: 5,
    };
  }

  if (segmentCount >= 40) {
    return {
      segmentAngle,
      hubRadius,
      labelInner,
      numberRadius: labelOuter - 6,
      numberFontSize: 8,
      nameFontSize: 5.5,
    };
  }

  return {
    segmentAngle,
    hubRadius,
    labelInner,
    numberRadius: labelOuter - 8,
    numberFontSize: 11,
    nameFontSize: 7,
  };
}

function drawRadialLabel(
  ctx: CanvasRenderingContext2D,
  midAngle: number,
  labelRadius: number,
  text: string,
  font: string,
  color: string
): number {
  ctx.save();
  ctx.rotate(midAngle);
  ctx.translate(labelRadius, 0);
  ctx.rotate(Math.PI);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 0);
  const width = ctx.measureText(text).width;
  ctx.restore();
  return width;
}

function drawRadialFullName(
  ctx: CanvasRenderingContext2D,
  midAngle: number,
  startRadius: number,
  minRadius: number,
  name: string,
  fontSize: number,
  color: string
) {
  const font = `500 ${fontSize}px var(--font-inter), system-ui, sans-serif`;
  const charStep = fontSize * 1.08;
  const spaceStep = fontSize * 0.5;

  ctx.font = font;
  let radius = startRadius;

  ctx.save();
  ctx.rotate(midAngle);

  for (const char of name) {
    const step = char === " " ? spaceStep : charStep;
    radius -= step;

    if (radius < minRadius) break;
    if (char === " ") continue;

    ctx.save();
    ctx.translate(radius, 0);
    ctx.rotate(Math.PI);
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

function drawSegmentLabels(
  ctx: CanvasRenderingContext2D,
  index: number,
  rawLabel: string,
  startAngle: number,
  endAngle: number,
  radius: number,
  segmentCount: number
) {
  const { number, name } = parseSegmentLabel(rawLabel, index);
  const metrics = getLabelMetrics(segmentCount, radius);
  const midAngle = startAngle + metrics.segmentAngle / 2;
  const numberFont = `700 ${metrics.numberFontSize}px var(--font-playfair), Georgia, serif`;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.clip();

  const numberWidth = drawRadialLabel(
    ctx,
    midAngle,
    metrics.numberRadius,
    number,
    numberFont,
    COLORS.goldText
  );

  if (name) {
    const nameStartRadius =
      metrics.numberRadius - numberWidth / 2 - metrics.nameFontSize * 1.2;

    drawRadialFullName(
      ctx,
      midAngle,
      nameStartRadius,
      metrics.labelInner,
      name,
      metrics.nameFontSize,
      "#7A6544"
    );
  }

  ctx.restore();
}

function createMarblePattern(): HTMLCanvasElement {
  const size = 64;
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = size;
  patternCanvas.height = size;
  const ctx = patternCanvas.getContext("2d");
  if (!ctx) return patternCanvas;

  ctx.fillStyle = COLORS.marbleBase;
  ctx.fillRect(0, 0, size, size);

  const veins: [number, number, number, number, number, number][] = [
    [0, 20, 30, 5, 64, 25],
    [10, 64, 40, 30, 55, 0],
    [64, 40, 20, 64, 0, 50],
    [30, 0, 64, 20, 50, 64],
    [0, 45, 25, 64, 64, 35],
  ];

  for (const [x1, y1, cx1, cy1, x2, y2] of veins) {
    ctx.strokeStyle = "rgba(170, 160, 148, 0.18)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx1 + 8, cy1 - 6, x2, y2);
    ctx.stroke();
  }

  return patternCanvas;
}

function drawMarbleFill(
  ctx: CanvasRenderingContext2D,
  pattern: CanvasPattern | null,
  radius: number
) {
  ctx.fillStyle = pattern ?? COLORS.marbleBase;
  ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
}

function drawGoldDivider(
  ctx: CanvasRenderingContext2D,
  angle: number,
  radius: number
) {
  ctx.save();
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(radius, 0);
  ctx.strokeStyle = COLORS.goldStroke;
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.restore();
}

function drawWeddingRings(ctx: CanvasRenderingContext2D, scale: number) {
  ctx.save();
  ctx.strokeStyle = COLORS.bronze;
  ctx.lineWidth = 1.4 * scale;
  ctx.globalAlpha = 0.85;

  const ringRadius = 5.5 * scale;
  const offset = 3.2 * scale;

  ctx.beginPath();
  ctx.arc(-offset, 0, ringRadius, 0, TWO_PI);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(offset, 0, ringRadius, 0, TWO_PI);
  ctx.stroke();

  ctx.restore();
}

function drawCenterHub(ctx: CanvasRenderingContext2D, hubRadius: number) {
  ctx.save();
  ctx.shadowColor = "rgba(120, 90, 30, 0.35)";
  ctx.shadowBlur = hubRadius * 0.4;
  ctx.shadowOffsetY = hubRadius * 0.15;

  ctx.beginPath();
  ctx.arc(0, 0, hubRadius, 0, TWO_PI);
  const domeGradient = ctx.createRadialGradient(
    -hubRadius * 0.35,
    -hubRadius * 0.35,
    hubRadius * 0.1,
    0,
    0,
    hubRadius
  );
  domeGradient.addColorStop(0, COLORS.goldLight);
  domeGradient.addColorStop(0.45, COLORS.goldMid);
  domeGradient.addColorStop(1, COLORS.goldDark);
  ctx.fillStyle = domeGradient;
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#B8943F";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawWeddingRings(ctx, hubRadius / 14);

  ctx.beginPath();
  ctx.arc(0, 0, hubRadius * 0.92, 0, TWO_PI);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.restore();
}

function drawOuterGoldRing(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number
) {
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, TWO_PI);
  ctx.strokeStyle = COLORS.goldMid;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center, center, radius + 2, 0, TWO_PI);
  ctx.strokeStyle = COLORS.goldLight;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawOrnatePointer(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  lite: boolean
) {
  const tipY = center - radius - 10;
  const bodyHeight = 36;
  const halfWidth = 16;

  ctx.save();

  if (!lite) {
    ctx.shadowColor = "rgba(120, 90, 30, 0.3)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
  }

  ctx.beginPath();
  ctx.moveTo(center, tipY + bodyHeight);
  ctx.lineTo(center - halfWidth, tipY + 8);
  ctx.quadraticCurveTo(center - halfWidth * 0.6, tipY, center, tipY);
  ctx.quadraticCurveTo(
    center + halfWidth * 0.6,
    tipY,
    center + halfWidth,
    tipY + 8
  );
  ctx.closePath();

  const pointerGradient = ctx.createLinearGradient(
    center,
    tipY,
    center,
    tipY + bodyHeight
  );
  pointerGradient.addColorStop(0, COLORS.goldLight);
  pointerGradient.addColorStop(0.5, COLORS.goldMid);
  pointerGradient.addColorStop(1, COLORS.goldDark);
  ctx.fillStyle = pointerGradient;
  ctx.fill();
  ctx.strokeStyle = COLORS.goldDark;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.shadowColor = "transparent";

  ctx.beginPath();
  ctx.ellipse(center, tipY + bodyHeight * 0.55, 5, 7, 0, 0, TWO_PI);
  ctx.fillStyle = COLORS.marbleBase;
  ctx.fill();
  ctx.strokeStyle = COLORS.goldStroke;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.restore();
}

function buildWheelCache(
  size: number,
  names: string[],
  segmentCount: number,
  marblePattern: CanvasPattern | null
): HTMLCanvasElement {
  const cache = document.createElement("canvas");
  cache.width = size;
  cache.height = size;

  const ctx = cache.getContext("2d");
  if (!ctx) return cache;

  const center = size / 2;
  const radius = center - 36;
  const segmentAngle = getSegmentAngle(segmentCount);
  const hubRadius = radius * 0.12;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, size, size);

  ctx.save();
  ctx.translate(center, center);

  for (let i = 0; i < segmentCount; i++) {
    const startAngle = i * segmentAngle;
    const endAngle = startAngle + segmentAngle;
    const isMarble = i % 2 === 1;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();

    if (isMarble) {
      ctx.save();
      ctx.clip();
      drawMarbleFill(ctx, marblePattern, radius);
      ctx.restore();
    } else {
      ctx.fillStyle = i % 4 === 0 ? COLORS.cream : COLORS.creamAlt;
      ctx.fill();
    }

    drawGoldDivider(ctx, startAngle, radius);

    if (names[i]) {
      drawSegmentLabels(ctx, i, names[i], startAngle, endAngle, radius, segmentCount);
    }
  }

  drawGoldDivider(ctx, segmentCount * segmentAngle, radius);
  drawCenterHub(ctx, hubRadius);
  ctx.restore();

  return cache;
}

export const CanvasWheel = forwardRef<CanvasWheelHandle, CanvasWheelProps>(
  function CanvasWheel(
    {
      names,
      slotCount,
      spinPool,
      onSpinEnd,
      onSpinStart,
      disabled = false,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rotationRef = useRef(0);
    const animFrameRef = useRef<number | null>(null);
    const isSpinningRef = useRef(false);
    const namesRef = useRef(names);
    const spinPoolRef = useRef(spinPool);
    const slotCountRef = useRef(slotCount ?? names.length);
    const onSpinEndRef = useRef(onSpinEnd);
    const onSpinStartRef = useRef(onSpinStart);
    const marblePatternRef = useRef<CanvasPattern | null>(null);
    const wheelCacheRef = useRef<WheelCache | null>(null);
    const sizeRef = useRef(600);
    const canvasSizeRef = useRef({ size: 0, dpr: 0 });

    namesRef.current = names;
    spinPoolRef.current = spinPool;
    slotCountRef.current = slotCount ?? names.length;
    onSpinEndRef.current = onSpinEnd;
    onSpinStartRef.current = onSpinStart;

    const getNamesKey = useCallback((list: string[]) => list.join("\n"), []);

    const ensureMarblePattern = useCallback((ctx: CanvasRenderingContext2D) => {
      if (!marblePatternRef.current) {
        const marbleCanvas = createMarblePattern();
        marblePatternRef.current = ctx.createPattern(marbleCanvas, "repeat");
      }
      return marblePatternRef.current;
    }, []);

    const ensureWheelCache = useCallback(
      (ctx: CanvasRenderingContext2D, size: number) => {
        const namesKey = getNamesKey(namesRef.current);
        const segmentCount = slotCountRef.current;
        const cached = wheelCacheRef.current;

        if (
          cached &&
          cached.size === size &&
          cached.namesKey === namesKey &&
          cached.slotCount === segmentCount
        ) {
          return cached.canvas;
        }

        const marblePattern = ensureMarblePattern(ctx);
        const canvas = buildWheelCache(
          size,
          namesRef.current,
          segmentCount,
          marblePattern
        );

        wheelCacheRef.current = {
          canvas,
          size,
          namesKey,
          slotCount: segmentCount,
        };

        return canvas;
      },
      [ensureMarblePattern, getNamesKey]
    );

    const setupCanvasSize = useCallback(
      (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, size: number, dpr: number) => {
        const pixelSize = Math.round(size * dpr);
        const prev = canvasSizeRef.current;

        if (prev.size !== size || prev.dpr !== dpr) {
          canvas.width = pixelSize;
          canvas.height = pixelSize;
          canvasSizeRef.current = { size, dpr };
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      },
      []
    );

    const drawWheel = useCallback(
      (rotation: number, lite = false) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = sizeRef.current;
        if (size <= 0) return;

        const dpr = getEffectiveDpr();
        const center = size / 2;
        const radius = center - 36;

        setupCanvasSize(canvas, ctx, size, dpr);

        const wheelCache = ensureWheelCache(ctx, size);

        ctx.clearRect(0, 0, size, size);

        ctx.beginPath();
        ctx.arc(center, center, radius + 14, 0, TWO_PI);
        ctx.fillStyle = "rgba(180, 150, 90, 0.08)";
        ctx.fill();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(rotation);
        ctx.drawImage(wheelCache, -center, -center, size, size);
        ctx.restore();

        drawOuterGoldRing(ctx, center, radius);
        drawOrnatePointer(ctx, center, radius, lite);
      },
      [ensureWheelCache, setupCanvasSize]
    );

    const spin = useCallback(() => {
      const segmentCount = slotCountRef.current;
      if (disabled || isSpinningRef.current || segmentCount === 0) {
        return;
      }

      isSpinningRef.current = true;
      onSpinStartRef.current?.();

      const pool =
        spinPoolRef.current ??
        Array.from({ length: segmentCount }, (_, index) => index);

      if (pool.length === 0) {
        isSpinningRef.current = false;
        return;
      }

      const poolPick = getSecureRandomInt(pool.length);
      const winnerIndex = pool[poolPick];
      const extraSpins = getSecureRandomIntRange(5, 8);
      const startRotation = rotationRef.current;
      const targetRotation = calculateTargetRotation(
        winnerIndex,
        segmentCount,
        startRotation,
        extraSpins
      );

      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / SPIN_DURATION_MS, 1);
        const eased = easeOutCubic(progress);

        rotationRef.current =
          startRotation + (targetRotation - startRotation) * eased;
        drawWheel(rotationRef.current, true);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          rotationRef.current = targetRotation;
          drawWheel(rotationRef.current, false);
          isSpinningRef.current = false;
          animFrameRef.current = null;
          onSpinEndRef.current(winnerIndex);
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    }, [disabled, drawWheel]);

    useImperativeHandle(ref, () => ({ spin }), [spin]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const updateSize = () => {
        const rect = container.getBoundingClientRect();
        const nextSize = Math.floor(Math.min(rect.width, rect.height));

        if (nextSize < 280) return;

        sizeRef.current = Math.min(nextSize, 920);
        wheelCacheRef.current = null;
        drawWheel(rotationRef.current, isSpinningRef.current);
      };

      updateSize();

      const observer = new ResizeObserver(updateSize);
      observer.observe(container);

      return () => observer.disconnect();
    }, [drawWheel]);

    useEffect(() => {
      if (!isSpinningRef.current) {
        wheelCacheRef.current = null;
        drawWheel(rotationRef.current, false);
      }
    }, [names, slotCount, drawWheel]);

    useEffect(() => {
      return () => {
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
        }
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="relative mx-auto aspect-square w-full max-h-[min(85vw,920px)]"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full touch-none drop-shadow-xl"
          aria-label="Ruleta premium con 100 casillas"
        />
      </div>
    );
  }
);
