import { REJECT_TIME } from './factory';
export function productVisual(age: number, outcome?: string) {
  const rejected = outcome === 'rejected' || outcome === 'falseReject';
  const diversion = rejected ? Math.max(0, Math.min(1, (age - REJECT_TIME) / 400)) : 0;
  return {
    progress: Math.min(age, rejected ? REJECT_TIME : 2500) / 3000,
    diversion,
    visible: age >= 0 && age <= 2500 && (!rejected || diversion < 1),
  };
}
