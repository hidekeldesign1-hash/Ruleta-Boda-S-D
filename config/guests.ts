/**
 * Configuración de invitados para la ruleta.
 * Cada casilla (1–100) corresponde exactamente a su número asignado.
 */

export const WHEEL_CAPACITY = 100;

export interface GuestEntry {
  number: number;
  name: string;
}

export const GUESTS: GuestEntry[] = [
  { number: 1, name: "Gael Ruvalcaba" },
  { number: 2, name: "Braulio Pérez" },
  { number: 3, name: "Larissa" },
  { number: 4, name: "Sofía Pinto" },
  { number: 5, name: "Diana Hernández" },
  { number: 6, name: "Ariel" },
  { number: 7, name: "Nayeli" },
  { number: 8, name: "Hugo Ferra" },
  { number: 9, name: "Alberto cortés" },
  { number: 10, name: "Carlos Pérez" },
  { number: 11, name: "Alberto cortés" },
  { number: 12, name: "Santos" },
  { number: 13, name: "Ara Martínez" },
  { number: 14, name: "Benjamín" },
  { number: 15, name: "Astrid Noemí" },
  { number: 16, name: "Bitia Seguro" },
  { number: 17, name: "Daniel Reyes" },
  { number: 18, name: "Hidekel Lara" },
  { number: 19, name: "Frida Castro" },
  { number: 20, name: "Diego Chávez" },
  { number: 21, name: "Adriana Diaz" },
  { number: 22, name: "Carlos Pérez" },
  { number: 23, name: "Alberto cortés" },
  { number: 24, name: "Alberto cortés" },
  { number: 25, name: "Ángel Zamora" },
  { number: 26, name: "Lari González" },
  { number: 27, name: "Axel Santana" },
  { number: 28, name: "Nereo Bravo" },
  { number: 29, name: "Layda" },
  { number: 30, name: "Axel Santana" },
  { number: 31, name: "Jessica Martínez" },
  { number: 32, name: "Diana Hernández" },
  { number: 33, name: "Ara Martínez" },
  { number: 34, name: "Rodrigo Castrejón" },
  { number: 35, name: "Jain Alejandra" },
  { number: 36, name: "Tony Buendía" },
  { number: 37, name: "Natalia Beltrán" },
  { number: 38, name: "Eusebia Téllez" },
  { number: 39, name: "Emi Andrade" },
  { number: 40, name: "Adri Casas" },
  { number: 41, name: "Hugo Barceló" },
  { number: 42, name: "Kenia González" },
  { number: 43, name: "Karen Tec" },
  { number: 44, name: "Santos" },
  { number: 45, name: "Mayte Mendoza" },
  { number: 46, name: "Estefania Ugalde" },
  { number: 47, name: "Julio Dorantes" },
  { number: 48, name: "Daniel Reyes" },
  { number: 49, name: "Ivan Pérez" },
  { number: 50, name: "Dani Arce" },
  { number: 51, name: "Juan Arce" },
  { number: 52, name: "Julián Trejo" },
  { number: 53, name: "Ara Martínez" },
  { number: 54, name: "Hidekel Lara" },
  { number: 55, name: "Jossua Alexander" },
  { number: 56, name: "Emilio Castrejón" },
  { number: 57, name: "Santos" },
  { number: 58, name: "Moisés Uriarte" },
  { number: 59, name: "Arlett y Esther" },
  { number: 60, name: "Rocio Pérez" },
  { number: 61, name: "Santos" },
  { number: 62, name: "Rodrigo Castrejón" },
  { number: 63, name: "Karen Dávila" },
  { number: 64, name: "Dante Hdz" },
  { number: 65, name: "Elizabeth Santos" },
  { number: 66, name: "Alexandra Seguro" },
  { number: 67, name: "Axel Santana" },
  { number: 68, name: "Ammi López" },
  { number: 69, name: "Pedro Valdez" },
  { number: 70, name: "Santos" },
  { number: 71, name: "Marisol" },
  { number: 72, name: "Mery Nicole" },
  { number: 73, name: "Sarai Mérida" },
  { number: 74, name: "Alma Vega" },
  { number: 75, name: "Adriana Diaz" },
  { number: 76, name: "Isabella" },
  { number: 77, name: "Samuel Mon" },
  { number: 78, name: "Elizabeth Santos" },
  { number: 79, name: "Dani Arce" },
  { number: 80, name: "Sandra Seguro" },
  { number: 81, name: "Emilio Castrejon" },
  { number: 82, name: "Iván Chavarría" },
  { number: 83, name: "Alberto cortés" },
  { number: 84, name: "Axel Santana" },
  { number: 85, name: "Emi Andrade" },
  { number: 86, name: "Juan Arce" },
  { number: 87, name: "Beatriz Pérez" },
  { number: 88, name: "Héctor" },
  { number: 89, name: "Elizabeth Santos" },
  { number: 90, name: "Citlali" },
  { number: 91, name: "Axel Santana" },
  { number: 92, name: "Elizabeth Santos" },
  { number: 93, name: "Daniel Zúñiga" },
  { number: 94, name: "Pedro Valdez" },
  { number: 95, name: "Sarai Suñiga" },
  { number: 96, name: "Omar Poli" },
  { number: 97, name: "Juan Trejo" },
  { number: 98, name: "Raúl R" },
  { number: 99, name: "Alberto cortés" },
  { number: 100, name: "Ara Martínez" },
];

/** Formato visible en la ruleta: "01 · María García" o "01" si aún no hay nombre */
export function formatWheelLabel(entry: GuestEntry): string {
  const num = String(entry.number).padStart(2, "0");
  const trimmed = entry.name.trim();
  return trimmed ? `${num} · ${trimmed}` : num;
}

/** Formato del ganador en el modal */
export function formatWinnerLabel(entry: GuestEntry): string {
  const num = String(entry.number).padStart(2, "0");
  const trimmed = entry.name.trim();
  return trimmed ? `#${num} — ${trimmed}` : `Casilla #${num}`;
}

/** Etiquetas listas para el canvas (siempre 100 casillas) */
export function getWheelLabels(): string[] {
  return GUESTS.map(formatWheelLabel);
}

/** Entradas con nombre asignado (para sortear solo invitados reales) */
export function getActiveGuests(): GuestEntry[] {
  return GUESTS.filter((entry) => entry.name.trim().length > 0);
}
