export type FactorySettings = { delay: number; duration: number };
type Product = {
  id: number;
  defect: boolean;
  detected: boolean;
  pulse?: { start: number; end: number };
  outcome?: 'rejected' | 'missed' | 'falseReject' | 'passed';
};
export type FactoryState = {
  elapsed: number;
  products: Product[];
  logs: { time: number; text: string }[];
  rejected: number;
  missed: number;
  falseRejects: number;
  passed: number;
  score: number;
  finished: boolean;
};
export const PRODUCT_INTERVAL = 2000;
export const SENSOR_TIME = 600;
export const REJECT_TIME = 1800;
export const FINISH_TIME = 22000;
export function createFactory(): FactoryState {
  return {
    elapsed: 0,
    products: Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      defect: index % 2 === 0,
      detected: false,
    })),
    logs: [],
    rejected: 0,
    missed: 0,
    falseRejects: 0,
    passed: 0,
    score: 0,
    finished: false,
  };
}
export function advanceFactory(
  previous: FactoryState,
  time: number,
  settings: FactorySettings
): FactoryState {
  const now = Math.max(previous.elapsed, Math.min(FINISH_TIME, time));
  const state = {
    ...previous,
    elapsed: now,
    products: previous.products.map((p) => ({ ...p })),
    logs: [...previous.logs],
  };
  const events: { time: number; text: string }[] = [];
  for (const product of state.products) {
    const sensor = (product.id - 1) * PRODUCT_INTERVAL + SENSOR_TIME;
    if (!product.detected && sensor <= now) {
      product.detected = true;
      events.push({
        time: sensor,
        text: `SENSOR · Product #${product.id} ${product.defect ? 'DEFECT' : 'OK'}`,
      });
      if (product.defect)
        product.pulse = {
          start: sensor + settings.delay,
          end: sensor + settings.delay + settings.duration,
        };
    }
  }
  const pulses = state.products.flatMap((p) => (p.pulse ? [{ ...p.pulse, id: p.id }] : []));
  for (const pulse of pulses) {
    if (pulse.start > previous.elapsed && pulse.start <= now)
      events.push({ time: pulse.start, text: `REJECT ON · Product #${pulse.id}` });
    if (pulse.end > previous.elapsed && pulse.end <= now)
      events.push({ time: pulse.end, text: `REJECT OFF · Product #${pulse.id}` });
  }
  for (const product of state.products) {
    const arrival = (product.id - 1) * PRODUCT_INTERVAL + REJECT_TIME;
    if (!product.outcome && arrival <= now) {
      const kicked = pulses.some((pulse) => pulse.start <= arrival && arrival < pulse.end);
      product.outcome = product.defect
        ? kicked
          ? 'rejected'
          : 'missed'
        : kicked
        ? 'falseReject'
        : 'passed';
      if (product.outcome === 'rejected') {
        state.rejected++;
        state.score += 100;
      }
      if (product.outcome === 'missed') {
        state.missed++;
        state.score -= 80;
      }
      if (product.outcome === 'falseReject') {
        state.falseRejects++;
        state.score -= 100;
      }
      if (product.outcome === 'passed') {
        state.passed++;
        state.score += 20;
      }
      events.push({
        time: arrival,
        text: `RESULT · Product #${product.id} ${product.outcome.toUpperCase()}`,
      });
    }
  }
  state.logs.push(...events.sort((a, b) => a.time - b.time));
  state.finished = now >= FINISH_TIME;
  return state;
}
