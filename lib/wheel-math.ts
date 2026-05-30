const TWO_PI = Math.PI * 2;

/**
 * Normalizes an angle to [0, 2π).
 */
export function normalizeAngle(angle: number): number {
  const normalized = angle % TWO_PI;
  return normalized < 0 ? normalized + TWO_PI : normalized;
}

/**
 * Calculates the target rotation (radians) so the pointer at the top
 * lands on the center of the given segment index.
 *
 * Coordinate system: 0 rad = right (3 o'clock), positive = clockwise.
 * Pointer is fixed at top (-π/2).
 */
export function calculateTargetRotation(
  winnerIndex: number,
  segmentCount: number,
  currentRotation: number,
  extraSpins: number
): number {
  const segmentAngle = TWO_PI / segmentCount;
  const segmentCenter = winnerIndex * segmentAngle + segmentAngle / 2;

  // Pointer at top (-π/2) should align with segment center.
  // rotation + segmentCenter ≡ -π/2 (mod 2π)
  const desiredMod = normalizeAngle(-Math.PI / 2 - segmentCenter);

  const currentMod = normalizeAngle(currentRotation);
  let delta = desiredMod - currentMod;
  if (delta <= 0) {
    delta += TWO_PI;
  }

  return currentRotation + extraSpins * TWO_PI + delta;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function getSegmentAngle(segmentCount: number): number {
  return TWO_PI / segmentCount;
}

export { TWO_PI };
