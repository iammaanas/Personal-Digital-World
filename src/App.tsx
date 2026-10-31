import { useEffect, useState } from "react";
import AtlasExperience from "./AtlasExperience";
import "./styles.css";

type Project = {
  number: string;
  name: string;
  type: string;
  description: string;
  tags: string[];
  href: string;
  visual: string;
};

const projects: Project[] = [
  {
    number: "01",
    name: "Attendance Tracker",
    type: "Productivity · Web app",
    description: "A clearer way to understand class attendance, weekly schedules, and the decisions that affect them.",
    tags: ["React", "Data", "Utility"],
    href: "https://iammaanas.github.io/Attendance-tracker/",
    visual: "attendance",
  },
  {
    number: "02",
    name: "Breakfree Journeys",
    type: "Travel · Digital experience",
    description: "A travel-focused project exploring how planning, places, and storytelling can live together.",
    tags: ["Travel", "Design", "Web"],
    href: "https://iammaanas.github.io/Breakfree/",
    visual: "journeys",
  },
  {
    number: "03",
    name: "Gecko Biomimicry",
    type: "Research · Biomimicry",
    description: "Exploring how gecko feet inspire adhesion technologies, translating a remarkable natural mechanism into ideas for human-designed materials and surfaces.",
    tags: ["Biomimicry", "Bio-inspired design", "Research"],
    href: "https://iammaanas.github.io/Gecko/",
    visual: "gecko",
  },
];

const destinations = [
  { id: "workshop", number: "01", title: "The Workshop", kicker: "MADE, TESTED, REFINED", text: "Projects, experiments, code, and ideas that have made it out of the notes app and into the world.", symbol: "↗", tone: "coral" },
  { id: "mind", number: "02", title: "The Mind", kicker: "THINKING IN PUBLIC", text: "Learning trails, curiosities, useful concepts, and the connections that make separate interests click.", symbol: "✳", tone: "lilac" },
  { id: "atlas", number: "03", title: "The Atlas", kicker: "PLACES & POSSIBILITY", text: "A home for maps, destinations, field notes, and the urge to understand what lies beyond the familiar.", symbol: "⌖", tone: "teal" },
  { id: "archives", number: "04", title: "The Archives", kicker: "WORTH KEEPING", text: "References, media, resources, and small discoveries that deserve somewhere better than a forgotten bookmark.", symbol: "▤", tone: "gold" },
];

function ArrowIcon() {
  return <span aria-hidden="true" className="arrow-icon">↗</span>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [atlasOpen, setAtlasOpen] = useState(false);

  useEffect(() => {
    const sections = ["home", "about", "workshop", "mind", "atlas", "archives"];
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const openAtlas = () => {
    setMenuOpen(false);
    setAtlasOpen(true);
  };

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="site-shell">
      <div className="grain" aria-hidden="true" />
      <header className="site-header">
        <a className="wordmark" href="#home" onClick={event => { event.preventDefault(); scrollTo("home"); }}>
          <span className="wordmark-glyph">P<span>·</span>DW</span>
          <span className="wordmark-caption">PERSONAL DIGITAL WORLD</span>
        </a>
        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Main navigation">
          {[["about", "About"], ["workshop", "Workshop"], ["mind", "Mind"], ["atlas", "Atlas"], ["archives", "Archives"]].map(([id, label]) => (
            <a key={id} href={`#${id}`} className={activeSection === id ? "active" : ""} onClick={event => { event.preventDefault(); id === "atlas" ? openAtlas() : scrollTo(id); }}>{label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" onClick={() => setTheme(current => current === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title="Toggle theme">{theme === "dark" ? "☼" : "◐"}</button>
          <button className="menu-toggle" onClick={() => setMenuOpen(current => !current)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>{menuOpen ? "×" : "☰"}</button>
        </div>
      </header>

      <main>
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> A PERSONAL UNIVERSE, UNDER CONSTRUCTION</div>
            <h1>A place for<br />everything that<br /><em>makes you, you.</em></h1>
            <p className="hero-description">Projects in progress. Ideas worth following. Places worth finding. A digital world that brings all the loose ends together.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => scrollTo("workshop")}>EXPLORE THE WORLD <ArrowIcon /></button>
              <button className="text-button" onClick={() => scrollTo("about")}>WHAT IS THIS? <span>↓</span></button>
            </div>
            <div className="hero-meta"><span>BUILT WITH CURIOSITY</span><span>EST. 2026</span></div>
          </div>
          <div className="hero-art" aria-label="Abstract illustration of connected ideas and destinations" role="img">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-orbit orbit-three" />
            <div className="art-cross cross-one" /><div className="art-cross cross-two" />
            <div className="art-core"><span>PDW</span><i /></div>
            <div className="art-node node-workshop"><b>01</b><span>MAKE</span></div>
            <div className="art-node node-mind"><b>02</b><span>THINK</span></div>
            <div className="art-node node-atlas"><b>03</b><span>WANDER</span></div>
            <div className="art-node node-archives"><b>04</b><span>KEEP</span></div>
            <div className="art-stamp">A DIGITAL<br />FIELD GUIDE<br /><span>VOL. 01</span></div>
            <svg className="art-lines" viewBox="0 0 600 650" aria-hidden="true"><path d="M300 315 C220 220 140 165 90 180" /><path d="M300 315 C390 210 465 160 500 180" /><path d="M300 315 C205 410 150 485 100 480" /><path d="M300 315 C410 420 470 480 505 470" /></svg>
            <div className="art-caption">EVERYTHING CONNECTS, EVENTUALLY.</div>
          </div>
          <button className="scroll-cue" onClick={() => scrollTo("about")} aria-label="Scroll to introduction"><span /> SCROLL TO EXPLORE <b>↓</b></button>
        </section>

        <section className="intro-section section-wrap" id="about">
          <div className="section-index"><span>01 / THE IDEA</span><span>AN OPEN SYSTEM</span></div>
          <div className="intro-grid">
            <h2>Not another<br /><em>link in bio.</em></h2>
            <div className="intro-copy">
              <p className="lead-copy">Think of this as a home for your digital life — not a folder of links, but a set of places with a reason to exist.</p>
              <p>Personal Digital World is an evolving collection of projects, ideas, maps, and things worth remembering. It is personal by design and useful by default. The layout is simple: scroll, explore, follow what catches your attention.</p>
              <button className="inline-link" onClick={() => scrollTo("workshop")}>MEET THE DESTINATIONS <ArrowIcon /></button>
            </div>
          </div>
          <div className="principle-strip"><div><b>01</b><span>MAKE THINGS</span></div><div><b>02</b><span>FOLLOW CURIOSITY</span></div><div><b>03</b><span>GO SOMEWHERE</span></div><div><b>04</b><span>KEEP THE GOOD STUFF</span></div></div>
        </section>

        <section className="destinations-section section-wrap" id="destinations">
          <div className="section-index"><span>02 / THE WORLD</span><span>FOUR WAYS IN</span></div>
          <div className="section-heading-row"><h2>Choose your<br /><em>own rabbit hole.</em></h2><p>Different corners of the same mind.<br />Each one can grow at its own pace.</p></div>
          <div className="destination-grid">
            {destinations.map((item, index) => (
              <button key={item.id} className={`destination-card ${item.tone}`} onClick={() => item.id === "atlas" ? openAtlas() : scrollTo(item.id)}>
                <div className="destination-top"><span>{item.number} / 04</span><span className="destination-symbol">{item.symbol}</span></div>
                <div className="destination-art" aria-hidden="true"><span className="destination-art-ring ring-a" /><span className="destination-art-ring ring-b" /><span className="destination-art-shape">{index === 0 ? "✳" : index === 1 ? "◌" : index === 2 ? "⌖" : "▤"}</span></div>
                <div className="destination-bottom"><span className="eyebrow">{item.kicker}</span><h3>{item.title}</h3><p>{item.text}</p><span className="card-link">EXPLORE SECTION <ArrowIcon /></span></div>
              </button>
            ))}
          </div>
        </section>

        <section className="workshop-section section-wrap" id="workshop">
          <div className="section-index"><span>03 / THE WORKSHOP</span><span>SELECTED BUILDS</span></div>
          <div className="section-heading-row"><h2>Things made<br /><em>real-ish.</em></h2><p>Projects, experiments, side quests.<br />Some finished. Some still figuring it out.</p></div>
          <div className="project-list">
            {projects.map(project => (
              <article className="project-row" key={project.number}>
                <a className={`project-visual ${project.visual}`} href={project.href} target="_blank" rel="noreferrer" aria-label={`Open ${project.name}`}>
                  {project.visual === "attendance" ? <div className="mini-calendar"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div> : project.visual === "journeys" ? <div className="mini-landscape"><i /><b /><span /></div> : <div className="mini-gecko"><span>BIOMIMICRY / 03</span><i>⌁</i><b>ADHESION<br />INSPIRED BY NATURE</b></div>}
                  <span className="visual-open"><ArrowIcon /></span>
                </a>
                <div className="project-content"><span className="project-number">{project.number} — {project.type}</span><h3>{project.name}</h3><p>{project.description}</p><div className="tag-row">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
                <a className="project-open" href={project.href} target="_blank" rel="noreferrer" aria-label={`Open ${project.name}`}><ArrowIcon /></a>
              </article>
            ))}
          </div>
          <a className="all-projects-link" href="https://github.com/iammaanas" target="_blank" rel="noreferrer">MORE EXPERIMENTS ON GITHUB <ArrowIcon /></a>
        </section>

        <section className="mind-section section-wrap" id="mind">
          <div className="section-index"><span>04 / THE MIND</span><span>ALWAYS LEARNING</span></div>
          <div className="mind-layout">
            <div className="mind-copy"><p className="eyebrow">A WORK IN PROGRESS, LIKE EVERYTHING ELSE</p><h2>Curiosity is<br />a <em>good habit.</em></h2><p>Some ideas deserve more than a fleeting tab. The Mind is planned as a place for learning trails, notes, concepts, and the connections that show up when you give an interest a little more time.</p><span className="coming-soon"><i /> THE KNOWLEDGE SPACE IS TAKING SHAPE</span></div>
            <div className="mind-graphic" aria-hidden="true"><div className="mind-ring r1" /><div className="mind-ring r2" /><div className="mind-ring r3" /><span className="mind-label ml1">LEARN</span><span className="mind-label ml2">CONNECT</span><span className="mind-label ml3">QUESTION</span><div className="mind-center">?</div></div>
          </div>
        </section>

        <section className="atlas-section section-wrap" id="atlas">
          <div className="section-index"><span>05 / THE ATLAS</span><span>THE WORLD OUT THERE</span></div>
          <div className="atlas-layout">
            <div className="atlas-copy"><p className="eyebrow">PLACES ARE STORIES, TOO</p><h2>Somewhere<br /><em>out there.</em></h2><p>Travel plans, places on the list, field notes, and maps worth opening. The Atlas brings geography into the world without making the whole website about travel.</p><button type="button" onClick={openAtlas} className="inline-link">OPEN THE ATLAS <ArrowIcon /></button></div>
            <div className="atlas-art" aria-hidden="true"><div className="map-grid" /><svg viewBox="0 0 600 460"><path d="M70 80 L150 60 L210 100 L195 150 L140 170 L120 225 L70 185 Z" /><path d="M215 190 L260 165 L305 205 L290 270 L250 325 L230 270 Z" /><path d="M320 75 L390 60 L430 100 L485 90 L530 145 L490 195 L440 170 L400 215 L365 170 Z" /><path d="M415 235 L470 220 L515 275 L485 345 L445 370 L415 315 Z" /><path d="M120 300 L160 285 L190 315 L170 350 L120 340 Z" /></svg><div className="map-pin pin-one">THANE <i /></div><div className="map-pin pin-two">SOMEWHERE NEXT <i /></div><span className="atlas-coordinate">19° 11' N / 72° 58' E</span><span className="atlas-note">GO A LITTLE FURTHER.</span></div>
          </div>
        </section>

        <section className="archives-section section-wrap" id="archives">
          <div className="section-index"><span>06 / THE ARCHIVES</span><span>KEEP WHAT MATTERS</span></div>
          <div className="archives-layout"><div><p className="eyebrow">A PLACE FOR THE GOOD STUFF</p><h2>Not everything<br />needs to <em>disappear.</em></h2><p className="archives-copy">A growing home for saved references, media, tools, and tiny discoveries that are too useful or interesting to lose. This section will become more than bookmarks as the world develops.</p></div><div className="archive-stack"><div className="archive-item"><span>01</span><div><b>REFERENCES</b><small>Things to come back to</small></div><ArrowIcon /></div><div className="archive-item"><span>02</span><div><b>TOOLS & RESOURCES</b><small>Useful finds and workflows</small></div><ArrowIcon /></div><div className="archive-item"><span>03</span><div><b>MEDIA & INSPIRATION</b><small>Things that leave a mark</small></div><ArrowIcon /></div><div className="archive-status"><i /> ARCHIVE INDEX — IN DEVELOPMENT</div></div></div>
        </section>

        <section className="closing-section section-wrap">
          <div className="closing-orbit"><span>PDW</span><i /></div><p className="eyebrow">END OF THE PAGE. NOT THE WORLD.</p><h2>Keep exploring.<br /><em>Keep making.</em></h2><button className="primary-button" onClick={() => scrollTo("home")}>BACK TO THE BEGINNING <span>↑</span></button>
        </section>
      </main>

      {atlasOpen && <AtlasExperience onExit={() => setAtlasOpen(false)} theme={theme} onToggleTheme={() => setTheme(current => current === "dark" ? "light" : "dark")} />}

      <footer className="site-footer"><a className="footer-mark" href="#home" onClick={event => { event.preventDefault(); scrollTo("home"); }}>P<span>·</span>DW</a><span>PERSONAL DIGITAL WORLD · A LIVING WORK IN PROGRESS</span><a href="https://github.com/iammaanas/Personal-Digital-World" target="_blank" rel="noreferrer">SOURCE CODE <ArrowIcon /></a></footer>
    </div>
  );
}

export default App;
