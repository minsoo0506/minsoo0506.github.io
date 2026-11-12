import { useEffect, useState } from 'react';
import {
  autoWire,
  COLS,
  deviceNames,
  emptyProgram,
  scanLadder,
  validateProgram,
  type Instruction,
} from '../../lib/ladder';
import { TowerLamp } from './TowerLamp';
type Tool = Instruction['kind'] | 'branch' | 'erase';
const tools: { kind: Tool; label: string }[] = [
  { kind: 'no', label: 'Normally open' },
  { kind: 'nc', label: 'Normally closed' },
  { kind: 'coil', label: 'Output coil' },
  { kind: 'wire', label: 'Horizontal wire' },
  { kind: 'branch', label: 'Branch down' },
  { kind: 'end', label: 'END' },
  { kind: 'erase', label: 'Erase' },
];
function Symbol({ kind }: { kind: Tool }) {
  return (
    <svg viewBox="0 0 100 40" aria-hidden="true">
      {kind === 'end' ? (
        <>
          <rect x="24" y="7" width="52" height="26" fill="none" stroke="currentColor" />
          <text x="50" y="25" fontSize="13" textAnchor="middle" fill="currentColor">
            END
          </text>
        </>
      ) : kind === 'erase' ? (
        <text x="50" y="27" textAnchor="middle" fill="currentColor" fontSize="26">
          ×
        </text>
      ) : (
        <>
          <path
            d={
              kind === 'coil'
                ? 'M0 20H36 M64 20H100 M43 7Q27 20 43 33 M57 7Q73 20 57 33'
                : kind === 'wire'
                ? 'M0 20H100'
                : kind === 'branch'
                ? 'M10 8H70V32H10'
                : 'M0 20H39 M61 20H100 M39 7V33 M61 7V33'
            }
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          {kind === 'nc' && <path d="M33 33L67 7" stroke="currentColor" strokeWidth="2" />}
        </>
      )}
    </svg>
  );
}
export function LadderStage() {
  const [program, setProgram] = useState(emptyProgram);
  const [tool, setTool] = useState<Tool>('no');
  const [address, setAddress] = useState('M00000');
  const [run, setRun] = useState(false);
  const [start, setStart] = useState(false);
  const [devices, setDevices] = useState<Record<string, boolean>>({});
  const [reference, setReference] = useState(true);
  const [message, setMessage] = useState(
    'Build the two-rung holding circuit. Drag instructions onto the grid; add the parallel branch, then Auto wire.'
  );
  useEffect(() => {
    if (!run) return;
    const timer = setInterval(() => setDevices((old) => scanLadder(program, old, start)), 50);
    return () => clearInterval(timer);
  }, [program, run, start]);
  const place = (r: number, c: number, kind: Tool, addr = address) => {
    if (run) return;
    if (kind === 'branch') {
      toggleBranch(r, c + 1);
      return;
    }
    setProgram((old) => ({
      ...old,
      cells: old.cells.map((row, i) =>
        row.map((cell, j) =>
          i === r && j === c ? (kind === 'erase' ? null : { kind, address: addr }) : cell
        )
      ),
    }));
  };
  const toggleBranch = (r: number, c: number) => {
    if (run || r >= program.cells.length - 1 || c >= COLS) return;
    const key = `${r}:${c}`;
    setProgram((p) => ({
      ...p,
      branches: p.branches.includes(key)
        ? p.branches.filter((b) => b !== key)
        : [...p.branches, key],
    }));
  };
  const reset = () => {
    setDevices({});
    setStart(false);
  };
  const compile = () => {
    const error = validateProgram(program);
    if (error) {
      setMessage(`Build error: ${error}`);
      return;
    }
    reset();
    setRun(true);
    setMessage(
      'RUN · press START, then release it. A correctly wired M00010 holding relay keeps the red lamp on until Reset PLC.'
    );
  };
  const drop = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    if (run) return;
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/x-ladder'));
      if (tools.some((t) => t.kind === data.kind) && typeof data.address === 'string')
        place(r, c, data.kind, data.address);
    } catch {
      setMessage('Drag an instruction from the toolbar.');
    }
  };
  const ghosts: Record<string, string> = {
    '0:0': 'M00000 · NO',
    '0:5': 'M00010 · COIL',
    '1:0': 'M00010 · NO',
    '2:0': 'M00010 · NO',
    '2:5': 'P00020 · COIL',
    '3:5': 'END',
  };
  return (
    <div className="stage-lab ladder-stage ladder-v2">
      <div className="plc-shell">
        <div className="plc-title">
          NewProgram · MAIN [LD]<span>{run ? 'ONLINE · RUN' : 'OFFLINE · EDIT'}</span>
        </div>
        <div className="plc-toolbar">
          <button
            onClick={() => {
              setRun(false);
              reset();
              setMessage('EDIT · outputs cleared.');
            }}
          >
            ■ Edit
          </button>
          <button disabled={run} onClick={compile}>
            ▶ Build & Run
          </button>
          <button disabled={run} onClick={() => setProgram(autoWire(program))}>
            Auto wire
          </button>
          <button
            onClick={() => {
              reset();
              setMessage('PLC memory and outputs cleared.');
            }}
          >
            Reset PLC
          </button>
          <button
            disabled={run}
            onClick={() => {
              setProgram(emptyProgram());
              reset();
            }}
          >
            Clear program
          </button>
          <button aria-pressed={reference} onClick={() => setReference(!reference)}>
            Reference
          </button>
        </div>
        <div className="plc-instructions">
          {tools.map((t) => (
            <button
              key={t.kind}
              disabled={run}
              draggable={!run}
              className={tool === t.kind ? 'chosen' : ''}
              onClick={() => setTool(t.kind)}
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  'application/x-ladder',
                  JSON.stringify({ kind: t.kind, address })
                );
                e.dataTransfer.effectAllowed = 'copy';
                setTool(t.kind);
              }}
            >
              <Symbol kind={t.kind} />
              <span>{t.label}</span>
            </button>
          ))}
          <label>
            Device
            <select
              aria-label="Instruction address"
              disabled={run}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            >
              {Object.entries(deviceNames).map(([a, n]) => (
                <option key={a} value={a}>
                  {a} · {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="plc-bench">
          <div className="plc-program">
            <div className="plc-editor-tab">
              NewProgram <span>50 ms scan</span>
            </div>
            <div className="plc-sheet-scroll">
              <div className="plc-sheet">
                {program.cells.map((row, r) => (
                  <div className="plc-grid-row" key={r}>
                    <span className="plc-line-number">{String(r).padStart(3, '0')}</span>
                    {row.map((cell, c) => (
                      <div
                        key={c}
                        className={`plc-grid-cell ${cell ? 'occupied' : ''} ${
                          run &&
                          cell &&
                          ['no', 'nc', 'coil'].includes(cell.kind) &&
                          (cell.kind === 'nc' ? !devices[cell.address] : devices[cell.address])
                            ? 'live'
                            : ''
                        }`}
                        onDragOver={(e) => {
                          if (!run) e.preventDefault();
                        }}
                        onDrop={(e) => drop(e, r, c)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          place(r, c, 'erase');
                        }}
                      >
                        <button
                          disabled={run}
                          aria-label={`Row ${r + 1} column ${c + 1}`}
                          onClick={() => place(r, c, tool)}
                        >
                          {cell ? (
                            <>
                              <small>
                                {['no', 'nc', 'coil'].includes(cell.kind) ? cell.address : ''}
                              </small>
                              <Symbol kind={cell.kind} />
                            </>
                          ) : (
                            <span className="plc-ghost">
                              {reference ? ghosts[`${r}:${c}`] : ''}
                            </span>
                          )}
                        </button>
                        {r < program.cells.length - 1 && c < COLS - 1 && (
                          <button
                            className={`plc-branch-point ${
                              program.branches.includes(`${r}:${c + 1}`) ? 'connected' : ''
                            }`}
                            disabled={run}
                            aria-label={`Branch row ${r + 1} column ${c + 1}`}
                            aria-pressed={program.branches.includes(`${r}:${c + 1}`)}
                            onClick={() => toggleBranch(r, c + 1)}
                            onDragOver={(e) => {
                              if (!run) e.preventDefault();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!run) toggleBranch(r, c + 1);
                            }}
                          >
                            <span />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="plc-device-table">
              <div>
                <b>Device</b>
                <b>Description</b>
                <b>Value</b>
              </div>
              {Object.entries(deviceNames).map(([a, n]) => (
                <div key={a}>
                  <code>{a}</code>
                  <span>{n}</span>
                  <b className={devices[a] ? 'on' : ''}>{devices[a] ? '1' : '0'}</b>
                </div>
              ))}
            </div>
          </div>
          <aside className="plc-field">
            <h3>FIELD OUTPUT</h3>
            <code>P00020</code>
            <TowerLamp on={!!devices.P00020} />
            <strong className={devices.P00020 ? 'lamp-on' : ''}>
              {devices.P00020 ? 'RED · ON' : 'RED · OFF'}
            </strong>
            <button
              disabled={!run}
              className={start ? 'pressed' : ''}
              onClick={() => setStart((s) => !s)}
            >
              {start ? 'Release START' : 'Press START'}
            </button>
            <small>M00000</small>
            <div className="lamp-wiring">
              <span>PLC P00020</span>
              <i />
              <span>RED +24 V</span>
            </div>
          </aside>
        </div>
        <div className="plc-output" role="status">
          {message}
        </div>
        {reference && (
          <div className="plc-reference">
            <b>Reference circuit</b>
            <code>
              Rung 0: (M00000 OR M00010) → M00010
              <br />
              Rung 2: M00010 → P00020
              <br />
              Rung 3: END
            </code>
            <p>
              Join the first two rows after the first contact. Auto wire fills gaps up to a coil or
              branch. Drag to place; right-click to erase. M00000 is a simulated input command. This
              circuit has no STOP contact; Reset PLC clears the latch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
