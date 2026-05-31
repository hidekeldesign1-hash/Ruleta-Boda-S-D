"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  CanvasWheel,
  type CanvasWheelHandle,
} from "@/components/ui/canvas-wheel";
import { FloralAccent } from "@/components/ui/floral-accent";
import { ParticipantsList } from "@/components/ui/participants-list";
import {
  formatWinnerLabel,
  getActiveGuests,
  getWheelLabels,
  GUESTS,
  WHEEL_CAPACITY,
  type GuestEntry,
} from "@/config/guests";

interface ConfettiPiece {
  id: number;
  left: string;
  delay: string;
  duration: string;
  color: string;
  size: string;
}

const CONFETTI_COLORS = [
  "#C9A962",
  "#F5E6D3",
  "#FFFFFF",
  "#D4B87A",
  "#E4B8A5",
  "#B8943F",
];

function generateConfetti(count: number): ConfettiPiece[] {
  const array = new Uint32Array(count * 4);
  crypto.getRandomValues(array);

  return Array.from({ length: count }, (_, i) => {
    const base = i * 4;
    const leftPct = (array[base] % 10000) / 100;
    const delaySec = (array[base + 1] % 2000) / 1000;
    const durationSec = 2.5 + (array[base + 2] % 1500) / 1000;
    const colorIdx = array[base + 3] % CONFETTI_COLORS.length;
    const sizePx = 6 + (array[base + 1] % 8);

    return {
      id: i,
      left: `${leftPct}%`,
      delay: `${delaySec}s`,
      duration: `${durationSec}s`,
      color: CONFETTI_COLORS[colorIdx],
      size: `${sizePx}px`,
    };
  });
}

function CelebrationOverlay({ active }: { active: boolean }) {
  const confetti = useMemo(
    () => (active ? generateConfetti(60) : []),
    [active]
  );

  if (!active) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {confetti.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
            borderRadius: piece.id % 3 === 0 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

interface WinnerModalProps {
  winner: string;
  onClose: () => void;
  onSpinAgain: () => void;
}

function WinnerModal({ winner, onClose, onSpinAgain }: WinnerModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="animate-scale-in relative w-full max-w-lg rounded-3xl border border-gold-200/60 bg-white/95 p-10 text-center shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-6 h-px w-16 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-gold-600">
          ¡Felicidades!
        </p>

        <h2
          id="winner-title"
          className="font-display mb-3 text-3xl tracking-tighter text-slate-900 md:text-4xl"
        >
          Ganador del sorteo
        </h2>

        <p className="font-display text-gradient-gold mb-8 text-4xl font-semibold tracking-tighter md:text-5xl">
          {winner}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onSpinAgain}
            className="btn-gold text-base"
          >
            Girar de nuevo
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-medium tracking-tight text-slate-700 shadow-lg transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export function RaffleSection() {
  const wheelLabels = useMemo(() => getWheelLabels(), []);
  const activeGuests = useMemo(() => getActiveGuests(), []);
  const hasNamedGuests = activeGuests.length > 0;

  const [winner, setWinner] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef<CanvasWheelHandle>(null);

  const handleSpin = useCallback(() => {
    if (isSpinning) return;
    setShowModal(false);
    setWinner(null);
    wheelRef.current?.spin();
  }, [isSpinning]);

  const handleSpinStart = useCallback(() => {
    setIsSpinning(true);
  }, []);

  const handleSpinEnd = useCallback((winnerIndex: number) => {
    const entry: GuestEntry = GUESTS[winnerIndex];
    setWinner(formatWinnerLabel(entry));
    setShowModal(true);
    setIsSpinning(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleSpinAgain = useCallback(() => {
    setShowModal(false);
    setWinner(null);
    requestAnimationFrame(() => {
      wheelRef.current?.spin();
    });
  }, []);

  const canSpin = !isSpinning;

  return (
    <section className="flex flex-col items-center px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <header className="mb-8 text-center lg:mb-10">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-gold-600">
          Sorteo en vivo
        </p>
        <h1 className="font-display text-4xl tracking-tighter text-slate-900 md:text-5xl lg:text-6xl">
          Ruleta S&D
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg tracking-tight text-slate-500">
          Rifa especial para nuestra boda. Gracias por su apoyo.
        </p>
      </header>

      <div className="flex w-full max-w-5xl flex-col items-center gap-6 lg:gap-8">
        <div className="relative w-full max-w-[min(92vw,960px)]">
          <FloralAccent className="pointer-events-none absolute -left-6 top-1/2 hidden h-48 w-24 -translate-y-1/2 opacity-70 lg:block xl:-left-14 xl:h-56 xl:w-28" />
          <FloralAccent className="pointer-events-none absolute -right-6 top-1/2 hidden h-48 w-24 -translate-y-1/2 scale-x-[-1] opacity-70 lg:block xl:-right-14 xl:h-56 xl:w-28" />

          <div className="relative rounded-3xl border border-gold-200/40 bg-white p-4 shadow-2xl lg:p-8">
            <CanvasWheel
              ref={wheelRef}
              names={wheelLabels}
              slotCount={WHEEL_CAPACITY}
              spinPool={hasNamedGuests ? activeGuests.map((g) => g.number - 1) : undefined}
              onSpinStart={handleSpinStart}
              onSpinEnd={handleSpinEnd}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSpin}
          disabled={!canSpin}
          className="btn-gold font-display min-w-[280px] text-lg uppercase tracking-[0.2em]"
        >
          {isSpinning ? "Girando…" : "Girar Ruleta"}
        </button>

        {isSpinning && (
          <p className="animate-pulse text-sm tracking-tight text-slate-400">
            La suerte está decidiendo…
          </p>
        )}

        <ParticipantsList />
      </div>

      <CelebrationOverlay active={showModal} />

      {showModal && winner && (
        <WinnerModal
          winner={winner}
          onClose={handleCloseModal}
          onSpinAgain={handleSpinAgain}
        />
      )}
    </section>
  );
}
