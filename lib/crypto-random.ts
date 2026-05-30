const MAX_UINT32 = 0x100000000;

/**
 * Returns a cryptographically secure random integer in [0, max).
 * Uses rejection sampling to avoid modulo bias.
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 0 || !Number.isInteger(max)) {
    throw new RangeError("max must be a positive integer");
  }

  const array = new Uint32Array(1);
  const limit = Math.floor(MAX_UINT32 / max) * max;

  let value: number;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);

  return value % max;
}

/**
 * Returns a cryptographically secure random float in [min, max).
 */
export function getSecureRandomFloat(min: number, max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const normalized = array[0] / MAX_UINT32;
  return min + normalized * (max - min);
}

/**
 * Returns a cryptographically secure random integer in [min, max] (inclusive).
 */
export function getSecureRandomIntRange(min: number, max: number): number {
  if (min > max) {
    throw new RangeError("min must be less than or equal to max");
  }
  return min + getSecureRandomInt(max - min + 1);
}
