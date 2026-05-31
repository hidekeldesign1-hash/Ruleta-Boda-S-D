import { GUESTS, type GuestEntry } from "@/config/guests";

function formatNumber(number: number): string {
  return number < 100 ? String(number).padStart(2, "0") : "100";
}

interface ParticipantsListProps {
  participants?: GuestEntry[];
}

export function ParticipantsList({
  participants = GUESTS,
}: ParticipantsListProps) {
  return (
    <div className="w-full rounded-2xl border border-gold-200/40 bg-white/80 p-5 shadow-lg backdrop-blur-md lg:p-6">
      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="h-px w-10 bg-gradient-to-r from-transparent to-gold-300" />
        <h2 className="font-display text-lg tracking-tighter text-slate-900 md:text-xl">
          Lista de Participantes
        </h2>
        <div className="h-px w-10 bg-gradient-to-l from-transparent to-gold-300" />
      </div>

      <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
        {participants.map((participant) => (
          <li
            key={participant.number}
            className="flex min-w-0 items-baseline gap-1.5 rounded-md px-1 py-0.5 text-[11px] leading-tight sm:text-xs md:text-sm"
          >
            <span className="shrink-0 font-semibold tabular-nums text-gold-700">
              {formatNumber(participant.number)}
            </span>
            <span className="truncate text-slate-700">{participant.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
