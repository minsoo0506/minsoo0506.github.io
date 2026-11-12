import { useRef, useState } from 'react';
import { studyModules } from '../../data/embedded-study';
const groups = [
  { title: 'Foundations', ids: ['programming', 'electronics', 'tools'] },
  { title: 'Firmware & Hardware', ids: ['microcontrollers', 'embedded-c', 'rtos', 'hardware'] },
  { title: 'Connected Systems', ids: ['protocols', 'linux', 'iot'] },
];
export function StudyTree({
  completed,
  query,
  onOpen,
}: {
  completed: string[];
  query: string;
  onOpen: (id: string, topic?: number) => void;
}) {
  const [zoom, setZoom] = useState(0.8);
  const [expanded, setExpanded] = useState<string[]>([]);
  const view = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  let cursor = 45;
  const layout = groups.map((group, groupIndex) => {
    const modules = group.ids.map((id, moduleIndex) => {
      const m = studyModules.find((m) => m.id === id)!;
      const open = expanded.includes(id) || !!query.trim();
      const offsets = m.sections.map((_, i) => i * 45 + [0, 5, 2, 8][i % 4]);
      const height = open ? Math.max(64, offsets[offsets.length - 1] + 36) : 64;
      const x = 540 + [0, 48, 18, 64][moduleIndex % 4] + groupIndex * 8;
      const topicX = 950 + [12, 40, 0][moduleIndex % 3];
      const top = cursor;
      cursor += height + [30, 52, 38, 60][moduleIndex % 4];
      return { m, open, top, height, x, topicX, offsets, y: top + height / 2 };
    });
    const y = (modules[0].y + modules[modules.length - 1].y) / 2;
    cursor += [46, 70, 32][groupIndex];
    return { ...group, modules, y, x: 270 + [0, 22, -8][groupIndex] };
  });
  const height = Math.max(720, cursor),
    width = 1340,
    rootY = (layout[0].y + layout[layout.length - 1].y) / 2;
  const changeZoom = (value: number) => {
    const next = Math.min(1.6, Math.max(0.2, value));
    const el = view.current;
    if (el) {
      const cx = (el.scrollLeft + el.clientWidth / 2) / zoom,
        cy = (el.scrollTop + el.clientHeight / 2) / zoom;
      setZoom(next);
      requestAnimationFrame(() => {
        el.scrollLeft = cx * next - el.clientWidth / 2;
        el.scrollTop = cy * next - el.clientHeight / 2;
      });
    } else setZoom(next);
  };
  const curve = (x1: number, y1: number, x2: number, y2: number) =>
    `M${x1} ${y1} C${x1 + (x2 - x1) * 0.55} ${y1}, ${x2 - (x2 - x1) * 0.5} ${y2}, ${x2} ${y2}`;
  return (
    <>
      <div className="tree-toolbar">
        <button aria-label="Zoom out" onClick={() => changeZoom(zoom - 0.1)}>
          −
        </button>
        <output aria-label="Zoom level">{Math.round(zoom * 100)}%</output>
        <button aria-label="Zoom in" onClick={() => changeZoom(zoom + 0.1)}>
          ＋
        </button>
        <button
          onClick={() => {
            if (view.current) {
              setZoom(
                Math.max(
                  0.2,
                  Math.min(
                    1,
                    (view.current.clientWidth - 30) / width,
                    (view.current.clientHeight - 30) / height
                  )
                )
              );
              view.current.scrollTop = 0;
              view.current.scrollLeft = 0;
            }
          }}
        >
          Fit
        </button>
        <button
          onClick={() => {
            setZoom(0.8);
            if (view.current) {
              view.current.scrollLeft = 0;
              view.current.scrollTop = 0;
            }
          }}
        >
          Reset
        </button>
      </div>
      <div
        className="tree-viewport"
        ref={view}
        onPointerDown={(e) => {
          if ((e.target as Element).closest('button,input,a')) return;
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            left: e.currentTarget.scrollLeft,
            top: e.currentTarget.scrollTop,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current) {
            e.currentTarget.scrollLeft = drag.current.left - e.clientX + drag.current.x;
            e.currentTarget.scrollTop = drag.current.top - e.clientY + drag.current.y;
          }
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <div style={{ width: width * zoom, height: height * zoom }}>
          <nav
            className="horizontal-tree"
            aria-label="Roadmap stages"
            style={{ width, height, transform: `scale(${zoom})` }}
          >
            <svg className="tree-links" width={width} height={height} aria-hidden="true">
              <g fill="none" stroke="#d8e0e4" strokeWidth="1.5">
                {layout.map((g, branchIndex) => (
                  <g key={g.title} stroke={['#a8c9bd', '#acc0d6', '#c4b4d6'][branchIndex]}>
                    <path d={curve(210, rootY, g.x, g.y)} />
                    {g.modules.map(({ m, y, open, top, x, topicX, offsets }) => (
                      <g key={m.id}>
                        <path d={curve(g.x + 180, g.y, x, y)} />
                        {open &&
                          m.sections.map((s, i) => (
                            <path
                              key={s.title}
                              d={curve(
                                x + 250,
                                y,
                                topicX + [0, 18, 6][i % 3],
                                top + 18 + offsets[i]
                              )}
                            />
                          ))}
                      </g>
                    ))}
                  </g>
                ))}
              </g>
            </svg>
            <div className="h-tree-root" style={{ left: 30, top: rootY - 25 }}>
              Embedded Systems
            </div>
            {layout.map((g, i) => (
              <section key={g.title} aria-label={g.title}>
                <h2 className={`h-tree-group group-${i}`} style={{ left: g.x, top: g.y - 25 }}>
                  {g.title}
                </h2>
                {g.modules.map(({ m, top, y, open, x, topicX, offsets }) => {
                  const match =
                    !query ||
                    `${m.title} ${m.ko} ${m.sections.map((s) => s.title + ' ' + s.text).join(' ')}`
                      .toLowerCase()
                      .includes(query.toLowerCase());
                  return (
                    <div className={`tree-chapter ${match ? '' : 'dimmed'}`} key={m.id}>
                      <div className="h-tree-chapter" style={{ left: x, top: y - 25 }}>
                        <button
                          className={completed.includes(m.id) ? 'complete' : ''}
                          onClick={() => onOpen(m.id)}
                        >
                          {m.title}
                        </button>
                        <button
                          aria-label={`Toggle ${m.title} lessons`}
                          aria-expanded={open}
                          onClick={() =>
                            setExpanded((e) =>
                              e.includes(m.id) ? e.filter((x) => x !== m.id) : [...e, m.id]
                            )
                          }
                        >
                          {open ? '−' : '+'}
                        </button>
                      </div>
                      {open &&
                        m.sections.map((s, n) => (
                          <button
                            className="h-tree-topic"
                            style={{ left: topicX + [0, 18, 6][n % 3], top: top + offsets[n] }}
                            key={s.title}
                            onClick={() => onOpen(m.id, n)}
                          >
                            {s.title}
                          </button>
                        ))}
                    </div>
                  );
                })}
              </section>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
