import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent, ReactNode } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./index.css";

const projects = [
  {
    slug: "real-time-chat",
    name: "REAL-TIME CHAT",
    category: "NETWORK SYSTEMS",
    symbol: "✹",
    stack: ["Python", "FastAPI", "WebSockets", "Redis", "PostgreSQL", "React", "TypeScript", "Docker", "Pytest"],
    description:
      "A real-time messaging application built around WebSockets, Redis Pub/Sub, PostgreSQL persistence, and a React frontend.",
    github: "https://github.com/sunnyvk799-pixel/real-time-chat-application",
  },
  {
    slug: "ai-resume-coach",
    name: "AI RESUME COACH",
    category: "GENERATIVE AI",
    symbol: "◉",
    stack: ["Python", "FastAPI", "RAG", "ChromaDB"],
    description:
      "An AI resume analysis project using retrieval-augmented generation and semantic search.",
    github: "https://github.com/sunnyvk799-pixel/ai-resume-coach",
  },
  {
    slug: "smart-agriculture",
    name: "SMART AGRICULTURE",
    category: "MACHINE LEARNING",
    symbol: "✳",
    stack: ["Python", "Flask", "Machine Learning", "OpenWeather API", "Chart.js"],
    description:
      "An agriculture assistant combining weather forecasts with irrigation recommendations.",
    github: "https://github.com/sunnyvk799-pixel/smart-agriculture-assistant",
  },
  {
    slug: "bigbasket-analysis",
    name: "BIGBASKET ANALYSIS",
    category: "DATA ANALYTICS",
    symbol: "◈",
    stack: ["SQL", "Tableau", "Data Analysis"],
    description:
      "A category-performance analysis project using a BigBasket dataset. Check the repository for its exact implementation and tools.",
    github: "https://github.com/sunnyvk799-pixel/bigbasket-category-performance",
  },
  {
    slug: "movie-selector",
    name: "MOVIE SELECTOR",
    category: "APPLICATION DEVELOPMENT",
    symbol: "✦",
    stack: ["See repository"],
    description:
      "An automatic movie selection project. See the source repository for its implementation and technology stack.",
    github: "https://github.com/sunnyvk799-pixel/automatic-movie-selector",
  },
];

const projectCount = projects.length;
const dialStep = 360 / projectCount;

const profileItems = [
  { slug: "education", name: "EDUCATION", category: "ACADEMIC RECORDS", symbol: "✧" },
  { slug: "skills", name: "SKILLS", category: "TECHNICAL DATABASE", symbol: "⌘" },
  { slug: "about", name: "ABOUT / SUMMARY", category: "OPERATOR PROFILE", symbol: "◉" },
  { slug: "certifications", name: "CERTIFICATIONS", category: "LEARNING RECORDS", symbol: "✦" },
  { slug: "engineering-log", name: "ENGINEERING LOG", category: "BUILDING & TESTING", symbol: "⌁" },
  { slug: "contact", name: "CONTACT", category: "OPEN CHANNEL", symbol: "✉" },
];
const profileStep = 360 / profileItems.length;

function pad(value: number) {
  return String(value + 1).padStart(2, "0");
}

function TopNavigation() {
  return (
    <header className="topbar">
      <Link className="brand" to="/" aria-label="Return to home">S<span>/</span>P</Link>
      <nav className="top-links" aria-label="Professional links">
        <a href="https://github.com/sunnyvk799-pixel" target="_blank" rel="noreferrer">GITHUB ↗</a>
        <a href="https://www.linkedin.com/in/siddiq-p/" target="_blank" rel="noreferrer">LINKEDIN ↗</a>
        <a href="/resume.pdf" target="_blank" rel="noreferrer">RESUME ↗</a>
      </nav>
    </header>
  );
}

function ModeSwitch({ mode, onChange }: { mode: "projects" | "profile"; onChange: (mode: "projects" | "profile") => void }) {
  return (
    <div className="mode-switch" role="group" aria-label="Ultimatrix mode">
      <button type="button" className={mode === "projects" ? "active" : ""} aria-pressed={mode === "projects"} onClick={() => onChange("projects")}>PROJECTS</button>
      <button type="button" className={mode === "profile" ? "active" : ""} aria-pressed={mode === "profile"} onClick={() => onChange("profile")}>PROFILE</button>
    </div>
  );
}

function Home() {
  const [mode, setMode] = useState<"projects" | "profile">("projects");
  const [projectSelected, setProjectSelected] = useState(0);
  const [profileSelected, setProfileSelected] = useState(0);
  const [activated, setActivated] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const navigate = useNavigate();
  const items = mode === "projects" ? projects : profileItems;
  const selected = mode === "projects" ? projectSelected : profileSelected;
  const step = mode === "projects" ? dialStep : profileStep;
  const selectedItem = items[selected];

  const choose = useCallback((index: number) => {
    if (mode === "projects") setProjectSelected((index + projects.length) % projects.length);
    else setProfileSelected((index + profileItems.length) % profileItems.length);
    setActivated(false);
  }, [mode]);

  const changeMode = (nextMode: "projects" | "profile") => {
    setMode(nextMode);
    setActivated(false);
  };

  const activate = useCallback(() => {
    setActivated(true);
    const target = mode === "projects"
      ? `/projects/${projects[projectSelected].slug}`
      : `/profile/${profileItems[profileSelected].slug}`;
    window.setTimeout(() => navigate(target), 220);
  }, [mode, navigate, projectSelected, profileSelected]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLElement && event.target.closest("a, button, input, textarea, select")) return;
      if (event.key === "ArrowLeft") choose(selected - 1);
      else if (event.key === "ArrowRight") choose(selected + 1);
      else if (event.key === "Enter") activate();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activate, choose, selected]);

  function onWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      event.preventDefault(); choose(selected + (event.deltaX > 0 ? 1 : -1));
    } else if (event.deltaY !== 0) {
      event.preventDefault(); choose(selected + (event.deltaY > 0 ? 1 : -1));
    }
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    startX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (startX.current !== null) {
      const distance = event.clientX - startX.current;
      if (Math.abs(distance) > 25) choose(selected + (distance < 0 ? 1 : -1));
    }
    startX.current = null;
    setDragging(false);
  }

  return (
    <main className="site">
      <TopNavigation />
      <section className="watch-page">
        <p className="eyebrow">SIDDIQ P. // DEVELOPER PORTFOLIO</p>
        <h1>THE ALIEN <span>ARCHIVE.</span></h1>
        <ModeSwitch mode={mode} onChange={changeMode} />
        <p className="instruction">
          {mode === "projects" ? "PROJECT MODE // SELECT A PROJECT AND ACTIVATE" : "PROFILE MODE // SELECT A RECORD AND ACTIVATE"}
        </p>

        <div className={`watch-stage ${dragging ? "is-dragging" : ""} ${activated ? "is-activating" : ""}`} onWheel={onWheel} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          <div className="watch-strap strap-upper" />
          <div className="watch-strap strap-lower" />
          <div className="watch-case">
            <div className="case-detail case-detail-a" />
            <div className="case-detail case-detail-b" />
            <div className="bezel">
              <div className="dial" style={{ transform: `rotate(${-selected * step}deg)` }}>
                {items.map((item, index) => (
                  <button type="button" key={item.slug} className={`dial-slot ${selected === index ? "selected" : ""}`}
                    style={{ transform: `translate(-50%, -50%) rotate(${index * step}deg) translateY(-108px) rotate(${-index * step}deg)` }}
                    onClick={(event) => { event.stopPropagation(); choose(index); }}
                    onPointerDown={(event) => event.stopPropagation()} aria-label={`Select ${item.name}`} aria-pressed={selected === index}>
                    <span className="slot-number">{pad(index)}</span><span className="slot-symbol">{item.symbol}</span>
                  </button>
                ))}
              </div>
              <div className="center-ring">
                <button type="button" className="center-core" onClick={activate} onPointerDown={(event) => event.stopPropagation()} aria-label={`Activate ${selectedItem.name}`}><span>X</span></button>
              </div>
              <div className="dial-nameplate">
                <span>{mode === "projects" ? "PROJECT" : "PROFILE"} {pad(selected)} / {String(items.length).padStart(2, "0")}</span>
                <strong>{selectedItem.name}</strong><small>{selectedItem.category}</small>
              </div>
            </div>
            <div className="side-button side-left" /><div className="side-button side-right" />
          </div>
        </div>

        <div className="watch-controls">
          <button type="button" onClick={() => choose(selected - 1)} aria-label="Previous option">←</button>
          <div><strong>{mode === "projects" ? "PROJECT" : "PROFILE"} {pad(selected)} / {String(items.length).padStart(2, "0")}</strong><span>SWIPE · SCROLL · ROTATE</span></div>
          <button type="button" onClick={() => choose(selected + 1)} aria-label="Next option">→</button>
        </div>
        <button type="button" className="activate-main" onClick={activate}><span>▶</span> ACTIVATE SELECTED {mode === "projects" ? "PROJECT" : "RECORD"}</button>
        <p className="watch-footnote">PRESS THE CENTER CORE OR ACTIVATE TO OPEN</p>
      </section>
      <footer className="contact-footer">
        <div><span className="footer-label">OPERATOR</span><strong>SIDDIQ P.</strong></div>
        <div><span className="footer-label">CONTACT</span><a href="mailto:sunnyvk799@gmail.com">EMAIL ↗</a></div>
        <div><span className="footer-label">NETWORK</span><a href="https://github.com/sunnyvk799-pixel" target="_blank" rel="noreferrer">GITHUB ↗</a><a href="https://www.linkedin.com/in/siddiq-p/" target="_blank" rel="noreferrer">LINKEDIN ↗</a></div>
        <span className="footer-note">ULTIMATRIX-INSPIRED FAN CONCEPT</span>
      </footer>
    </main>
  );
}

function DetailLayout({ eyebrow, symbol, title, category, children }: { eyebrow: string; symbol: string; title: string; category: string; children: ReactNode }) {
  return <section className="detail-content"><p className="eyebrow">{eyebrow}</p><div className="detail-symbol">{symbol}</div><h1>{title}</h1><p className="detail-category">{category}</p>{children}</section>;
}

function ProjectPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return <main className="site not-found"><TopNavigation /><h1>PROJECT NOT FOUND</h1><Link to="/">← RETURN TO WATCH</Link></main>;
  return <main className="site detail-page"><TopNavigation /><DetailLayout eyebrow={`PROJECT ${pad(projects.indexOf(project))} // ACCESS GRANTED`} symbol={project.symbol} title={project.name} category={project.category}>
    <p className="detail-description">{project.description}</p><h2>TECHNOLOGY MATRIX</h2><div className="detail-stack">{project.stack.map((technology) => <span key={technology}>{technology}</span>)}</div>
    <div className="detail-actions"><a href={project.github} target="_blank" rel="noreferrer">VIEW SOURCE ON GITHUB ↗</a><button type="button" onClick={() => navigate("/")}>← BACK TO ULTIMATRIX</button></div>
  </DetailLayout><DetailFooter /></main>;
}

function ProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const item = profileItems.find((entry) => entry.slug === slug);
  if (!item) return <main className="site not-found"><TopNavigation /><h1>RECORD NOT FOUND</h1><Link to="/">← RETURN TO WATCH</Link></main>;

  let content: ReactNode;
  switch (item.slug) {
    case "education":
      content = <><h2>ACADEMIC RECORD</h2><div className="detail-stack"><span>IIIT Dharwad</span><span>Bachelor's degree</span><span>Electronics and Communication Engineering (ECE)</span></div><p className="detail-description">Degree details are listed as provided; add your exact degree title and graduation year if you want them displayed.</p></>;
      break;
    case "skills":
      content = <><h2>TECHNICAL MATRIX</h2><p className="detail-description">Technologies used across projects and learning work.</p><div className="detail-stack">{["Python", "SQL", "JavaScript", "TypeScript", "React", "FastAPI", "Flask", "REST APIs", "WebSockets", "PostgreSQL", "SQLite", "Redis", "Docker", "Git / GitHub", "Pytest", "GitHub Actions", "Linux basics", "RAG", "ChromaDB", "scikit-learn", "Pandas", "NumPy", "Chart.js"].map((skill) => <span key={skill}>{skill}</span>)}</div></>;
      break;
    case "about":
      content = <><h2>OPERATOR SUMMARY</h2><p className="detail-description">ECE graduate from IIIT Dharwad focused on software engineering, backend development, and systems-oriented projects. Building with Python, APIs, databases, real-time communication, Docker, and applied AI. Interested in writing reliable software and strengthening engineering fundamentals through hands-on projects.</p></>;
      break;
    case "certifications":
      content = <><h2>LEARNING RECORDS</h2><div className="detail-stack"><span>CS50's Introduction to Programming with Python</span><span>DSA + LeetCode for Coding Interviews — Udemy</span><span>AI/ML course — Masai School (one month)</span></div><p className="detail-description">Only list credentials you completed and can verify. Add certificate links or issue dates when available.</p></>;
      break;
    case "engineering-log":
      content = <><h2>BUILD / TEST / IMPROVE</h2><div className="detail-stack"><span>WebSocket messaging</span><span>Redis Pub/Sub</span><span>PostgreSQL persistence</span><span>Docker containerization</span><span>Automated tests with Pytest</span><span>GitHub Actions</span><span>RAG document retrieval</span></div><p className="detail-description">A snapshot of implementation areas explored in your projects. Performance metrics should be added only after measuring and documenting the results.</p></>;
      break;
    default:
      content = <><h2>OPEN CHANNELS</h2><div className="detail-actions"><a href="mailto:sunnyvk799@gmail.com">EMAIL ↗</a><a href="https://github.com/sunnyvk799-pixel" target="_blank" rel="noreferrer">GITHUB ↗</a><a href="https://www.linkedin.com/in/siddiq-p/" target="_blank" rel="noreferrer">LINKEDIN ↗</a><a href="/resume.pdf" target="_blank" rel="noreferrer">OPEN RESUME ↗</a></div></>;
  }
  return <main className="site detail-page"><TopNavigation /><DetailLayout eyebrow={`PROFILE ${pad(profileItems.indexOf(item))} // RECORD ACCESSED`} symbol={item.symbol} title={item.name} category={item.category}>{content}<div className="detail-actions"><button type="button" onClick={() => navigate("/")}>← BACK TO ULTIMATRIX</button></div></DetailLayout><DetailFooter /></main>;
}

function DetailFooter() {
  return <footer className="contact-footer"><div><span className="footer-label">OPERATOR</span><strong>SIDDIQ P.</strong></div><div><span className="footer-label">CONTACT</span><a href="mailto:sunnyvk799@gmail.com">EMAIL ↗</a></div><div><span className="footer-label">NETWORK</span><a href="https://github.com/sunnyvk799-pixel" target="_blank" rel="noreferrer">GITHUB ↗</a><a href="https://www.linkedin.com/in/siddiq-p/" target="_blank" rel="noreferrer">LINKEDIN ↗</a></div><span className="footer-note">ULTIMATRIX-INSPIRED FAN CONCEPT</span></footer>;
}

export default function App() {
  return <BrowserRouter><Routes><Route path="/" element={<Home />} /><Route path="/projects/:slug" element={<ProjectPage />} /><Route path="/profile/:slug" element={<ProfilePage />} /></Routes></BrowserRouter>;
}
