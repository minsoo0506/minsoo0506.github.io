import { useEffect, useState } from 'react';
import { studyModules } from '../../data/embedded-study';
import { embeddedDetails } from '../../data/embedded-details';
import './embedded-study.css';
import { StudyTree } from './StudyTree';
import { workshops } from '../../data/embedded-workshops';
import { referenceLessons } from '../../data/embedded-reference-lessons';
import { lessonDetails } from '../../data/embedded-lessons';
const STORAGE = 'embedded-study-progress-v1';
function loadCompleted(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE) ?? '[]');
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (id): id is string =>
                typeof id === 'string' && studyModules.some((module) => module.id === id)
            )
          ),
        ]
      : [];
  } catch {
    return [];
  }
}
export function EmbeddedStudyWindow() {
  const [selected, setSelected] = useState<string | null>(null);
  const [topic, setTopic] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [completed, setCompleted] = useState(loadCompleted);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const index = studyModules.findIndex((module) => module.id === selected);
  const current = index >= 0 ? studyModules[index] : null;
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(completed));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [completed]);
  const toggleComplete = () => {
    if (!selected) return;
    setCompleted((previous) =>
      previous.includes(selected)
        ? previous.filter((id) => id !== selected)
        : [...previous, selected]
    );
  };
  return (
    <div className="study-window study-roadmap">
      {!current ? (
        <div className="study-map-layout">
          <div className="study-map-search">
            <input
              type="search"
              aria-label="Search topics"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {query && (
            <div className="study-search-results">
              {studyModules
                .filter((m) =>
                  `${m.title} ${m.ko} ${m.sections.map((s) => s.title + ' ' + s.text).join(' ')}`
                    .toLowerCase()
                    .includes(query.toLowerCase())
                )
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelected(m.id);
                      setTopic(null);
                    }}
                  >
                    {m.title} ↗
                  </button>
                ))}
            </div>
          )}
          <StudyTree
            query={query}
            completed={completed}
            onOpen={(id, lesson) => {
              setSelected(id);
              setTopic(lesson ?? null);
            }}
          />
        </div>
      ) : (
        <main className="study-article study-detail" key={`${current.id}-${topic}`}>
          <button className="roadmap-back" onClick={() => setSelected(null)}>
            ← Back to roadmap
          </button>
          <div className="study-breadcrumb">
            STAGE {String(index + 1).padStart(2, '0')} / {current.ko}
            <span>{current.sections.length} TOPICS</span>
          </div>
          <h2>{topic === null ? current.title : current.sections[topic].title}</h2>
          <div className="study-ko">{current.ko}</div>
          <p className="study-intro">
            {topic === null ? current.summary : current.sections[topic].text}
          </p>
          <nav className="article-toc" aria-label="Chapter contents">
            <button onClick={() => setTopic(null)} className={topic === null ? 'active' : ''}>
              Chapter overview
            </button>
            {current.sections.map((s, i) => (
              <button
                key={s.title}
                className={topic === i ? 'active' : ''}
                onClick={() => setTopic(i)}
              >
                {String(i + 1).padStart(2, '0')} {s.title}
              </button>
            ))}
          </nav>
          {topic !== null && (
            <section className="lesson-reading">
              <span className="study-section-head">LESSON {topic + 1} / 원리부터 적용까지</span>
              {(lessonDetails[current.id]?.[topic] ?? []).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>
          )}

          <div className="study-divider" />
          <div className="study-section-head">
            IN DEPTH <span>원리와 실무</span>
          </div>
          <div className="study-deep">
            {(embeddedDetails[current.id] ?? []).map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
          <div className="study-reference-lessons">
            {(referenceLessons[current.id] ?? [])
              .filter((section) => topic === null || section.topics.includes(topic))
              .map((section) => (
                <section key={section.title}>
                  <h3>{section.title}</h3>
                  {section.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  <div className="study-worked-note">
                    <b>예제로 따라가기</b>
                    <p>{section.example}</p>
                  </div>
                  <a href={section.source.url} target="_blank" rel="noopener noreferrer">
                    {section.source.label} ↗
                  </a>
                </section>
              ))}
          </div>
          {current.code && (
            <section className="study-code">
              <div>
                <span>EXAMPLE CODE</span>
                <span>{current.language ?? 'C'}</span>
              </div>
              <p>{current.codeNote}</p>
              <pre>
                <code>{current.code}</code>
              </pre>
            </section>
          )}
          <section className="study-workshop">
            <span className="study-section-head">WORKED EXAMPLE / 단계별로 풀어보기</span>
            <h3>{workshops[current.id].title}</h3>
            <p>{workshops[current.id].setup}</p>
            <ol>
              {workshops[current.id].steps.map((step, i) => (
                <li key={i}>
                  <span>0{i + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
            <details>
              <summary>{workshops[current.id].question}</summary>
              <p>{workshops[current.id].answer}</p>
            </details>
          </section>
          <section className="study-practice">
            <span>✦ &nbsp; TRY IT YOURSELF</span>
            <p>{current.exercise}</p>
          </section>
          {current.links && (
            <div className="study-links">
              <b>더 읽기</b>
              {current.links.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
          <div className="study-actions">
            <button onClick={toggleComplete} className="study-complete">
              {completed.includes(current.id) ? '✓ Completed · Undo' : '✓ Mark as complete'}
            </button>
            <div>
              <button
                disabled={index === 0}
                onClick={() => {
                  setSelected(studyModules[index - 1].id);
                  setTopic(null);
                }}
              >
                ← Previous
              </button>
              <button
                disabled={index === studyModules.length - 1}
                onClick={() => {
                  setSelected(studyModules[index + 1].id);
                  setTopic(null);
                }}
              >
                Next →
              </button>
            </div>
          </div>
          {!storageAvailable && (
            <p className="study-save-warning">
              브라우저 저장소를 사용할 수 없어 진행도가 이번 창에서만 유지됩니다.
            </p>
          )}
          <p className="study-disclaimer">
            실제 보드 설정·전기적 한계·API는 해당 장치와 도구의 공식 문서를 확인하세요.{' '}
            <a
              href="https://media.licdn.com/dms/image/v2/D5622AQFa4C9rhX0KwQ/feedshare-image-high-res/B56Z6DxZ4KH0Ac-/0/1780327227171?e=2147483647&v=beta&t=HPDCNSAXk2ABwDPdtryEepFbExWAKyOpnJkCBZv-wxc"
              target="_blank"
              rel="noopener noreferrer"
            >
              참고 로드맵 ↗
            </a>
          </p>
        </main>
      )}
    </div>
  );
}
