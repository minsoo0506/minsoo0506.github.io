export type Instruction = { kind: 'no' | 'nc' | 'coil' | 'wire' | 'end'; address: string };
export type LadderProgram = { cells: (Instruction | null)[][]; branches: string[] };
export type Devices = Record<string, boolean>;
export const ROWS = 6,
  COLS = 6;
export const deviceNames: Record<string, string> = {
  M00000: 'START command',
  M00010: 'Holding relay',
  M00011: 'Auxiliary relay',
  P00020: 'Red tower lamp',
};
export const emptyProgram = (): LadderProgram => ({
  cells: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
  branches: [],
});
export function autoWire(p: LadderProgram): LadderProgram {
  const cells = p.cells.map((row) => row.map((c) => (c ? { ...c } : null)));
  for (let r = 0; r < ROWS; r++) {
    const coil = cells[r].findIndex((c) => c?.kind === 'coil');
    const ends = p.branches
      .map((b) => b.split(':').map(Number))
      .filter(([row]) => row === r || row + 1 === r)
      .map(([, col]) => col);
    const endColumn = cells[r].findIndex((c) => c?.kind === 'end');
    const until = Math.max(coil, endColumn, ...ends, 0);
    for (let c = 0; c < until; c++) if (!cells[r][c]) cells[r][c] = { kind: 'wire', address: '' };
  }
  return { ...p, cells };
}
export function validateProgram(p: LadderProgram): string | null {
  const endRows = p.cells.flatMap((row, r) => row.filter((c) => c?.kind === 'end').map(() => r));
  if (endRows.length !== 1) return 'Place one END instruction below the output rungs.';
  const end = endRows[0];
  if (p.cells[end].some((c) => c && c.kind !== 'end' && c.kind !== 'wire'))
    return `Row ${
      end + 1
    }: END allows horizontal wires only; remove contacts or coils from this row.`;
  if (p.cells.slice(end + 1).some((row) => row.some(Boolean)))
    return 'Move all instructions above END.';
  const seen = new Set<string>();
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const cell = p.cells[r][c];
      if (!cell) continue;
      if (
        ['no', 'nc', 'coil'].includes(cell.kind) &&
        !Object.prototype.hasOwnProperty.call(deviceNames, cell.address)
      )
        return 'Unknown device address.';
      if (cell.kind === 'coil') {
        if (c !== COLS - 1) return 'Place output coils in the rightmost column.';
        if (cell.address === 'M00000') return 'M00000 is reserved for the simulated START input.';
        if (seen.has(cell.address)) return 'Use only one output coil for each device.';
        seen.add(cell.address);
      }
    }
  if (!seen.size) return 'Place at least one output coil.';
  if (
    p.branches.some((b) => {
      const [r, c] = b.split(':').map(Number);
      return r >= end - 1 || c < 1 || c >= COLS;
    })
  )
    return 'Branches must connect logic rows above END.';
  return null;
}
/** Top-to-bottom scan. Internal coils are visible to later rungs in the same scan. */
export function scanLadder(p: LadderProgram, previous: Devices, start: boolean): Devices {
  const devices: Devices = { ...previous, M00000: start };
  for (let r = 0; r < ROWS; r++) {
    if (p.cells[r].some((c) => c?.kind === 'end')) break;
    const coil = p.cells[r][COLS - 1];
    if (coil?.kind !== 'coil') continue;
    const reached = new Set<string>();
    const queue = Array.from({ length: ROWS }, (_, row) => `${row}:0`);
    while (queue.length) {
      const key = queue.shift()!;
      if (reached.has(key)) continue;
      reached.add(key);
      const [row, col] = key.split(':').map(Number);
      const passes = (cell: Instruction | null) =>
        cell?.kind === 'wire' ||
        (cell?.kind === 'no' && !!devices[cell.address]) ||
        (cell?.kind === 'nc' && !devices[cell.address]);
      if (col < COLS - 1 && passes(p.cells[row][col])) queue.push(`${row}:${col + 1}`);
      if (col > 0 && passes(p.cells[row][col - 1])) queue.push(`${row}:${col - 1}`);
      if (p.branches.includes(`${row}:${col}`)) queue.push(`${row + 1}:${col}`);
      if (row > 0 && p.branches.includes(`${row - 1}:${col}`)) queue.push(`${row - 1}:${col}`);
    }
    devices[coil.address] = reached.has(`${r}:${COLS - 1}`);
  }
  return devices;
}
