import {useState, type CSSProperties, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

type Accent = {accent: string; accent2: string};

const accentStyle = ({accent, accent2}: Accent) =>
  ({'--accent': accent, '--accent2': accent2}) as CSSProperties;

function Icon({d, className}: {d: string; className?: string}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const STATS = [
  {value: '55+', label: 'ready-made nodes'},
  {value: '4', label: 'feature workers'},
  {value: '1', label: 'command to run locally'},
  {value: '100%', label: 'open source · Apache 2.0'},
];

const FEATURES: (Accent & {title: string; text: string; icon: string; to: string})[] = [
  {
    title: 'Browser-native canvas',
    text: 'A full IDE built on Eclipse Theia and React Flow. Drag, drop and connect nodes with nothing to install.',
    icon: 'M4 4h6v6H4zM14 14h6v6h-6zM10 7h4a3 3 0 013 3v4',
    to: '/docs/intro',
    accent: '#8b5cf6',
    accent2: '#6366f1',
  },
  {
    title: 'Crash-proof execution',
    text: "Every run is a durable Temporal workflow. A crashed worker, a restarted pod or a dropped connection doesn't lose progress.",
    icon: 'M12 3l7.5 3v5.25c0 4.6-3.2 8.5-7.5 9.75-4.3-1.25-7.5-5.15-7.5-9.75V6L12 3zM9 12l2 2 4-4',
    to: '/docs/architecture/overview',
    accent: '#10b981',
    accent2: '#06b6d4',
  },
  {
    title: 'Live execution updates',
    text: 'Events flow from Kafka to the browser over MQTT and WebSockets, so each node lights up as it runs. No polling.',
    icon: 'M13 2L4.5 13.5H12L11 22l8.5-11.5H12L13 2z',
    to: '/docs/architecture/overview',
    accent: '#f59e0b',
    accent2: '#f97316',
  },
  {
    title: 'Columnar data',
    text: 'Nodes exchange Snappy-compressed Apache Parquet tables stored in MinIO, not JSON blobs. Fast and query-ready.',
    icon: 'M3 5h18v14H3zM3 10h18M3 15h18M9 5v14M15 5v14',
    to: '/docs/architecture/data-format',
    accent: '#06b6d4',
    accent2: '#3b82f6',
  },
  {
    title: 'Extensible by design',
    text: 'Add capabilities by deploying a new feature worker. Existing services stay untouched: zero downtime, zero coupling.',
    icon: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5',
    to: '/docs/architecture/node-model',
    accent: '#ec4899',
    accent2: '#8b5cf6',
  },
  {
    title: 'Kubernetes-ready',
    text: 'Helm charts for the infrastructure, the platform and each worker take you from a laptop to a production cluster.',
    icon: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8',
    to: '/docs/deployment/helm-charts',
    accent: '#3b82f6',
    accent2: '#6366f1',
  },
];

const STEPS: (Accent & {title: string; text: string})[] = [
  {
    title: 'Design',
    text: 'Drag nodes onto the canvas in the Workbench, configure them and hit Execute.',
    accent: '#8b5cf6',
    accent2: '#a855f7',
  },
  {
    title: 'Orchestrate',
    text: 'The API server starts a Temporal workflow that walks the graph and runs independent nodes in parallel.',
    accent: '#6366f1',
    accent2: '#3b82f6',
  },
  {
    title: 'Execute',
    text: 'Each node runs on the feature worker that registered it, reading and writing Parquet in MinIO.',
    accent: '#06b6d4',
    accent2: '#10b981',
  },
  {
    title: 'Watch',
    text: 'Progress events travel through Kafka and MQTT and light up every node live in your browser.',
    accent: '#f59e0b',
    accent2: '#ec4899',
  },
];

const WORKERS: (Accent & {title: string; badge: string; text: string; tags: string[]; icon: string; to: string})[] = [
  {
    title: 'Base Analytics',
    badge: '16 nodes',
    text: 'Transforms, joins, filters, aggregation, REST calls, Kotlin scripting and anomaly detection.',
    tags: ['Pivot', 'JSON Exploder', 'REST Client', 'Z-Score'],
    icon: 'M4 20V10M10 20V4M16 20v-7M21 20H3',
    to: '/docs/feature-nodes/base-analytics',
    accent: '#6366f1',
    accent2: '#06b6d4',
  },
  {
    title: 'Cheminformatics',
    badge: '38 nodes',
    text: 'RDKit-powered molecular processing: parse, standardise, fingerprint, react and visualise molecules at scale.',
    tags: ['SMILES', 'Fingerprints', 'Reactions', '3D geometry'],
    icon: 'M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5L12 2.5zM12 8.5l3 1.75v3.5L12 15.5l-3-1.75v-3.5L12 8.5z',
    to: '/docs/feature-nodes/cheminformatics',
    accent: '#10b981',
    accent2: '#84cc16',
  },
  {
    title: 'AI / ML',
    badge: 'LLM training',
    text: 'Fine-tune large language models with LoRA and Unsloth acceleration, straight from a workflow graph.',
    tags: ['Unsloth', 'LoRA', 'Llama', 'Phi-4', 'Qwen'],
    icon: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z',
    to: '/docs/feature-nodes/ai-ml',
    accent: '#ec4899',
    accent2: '#f59e0b',
  },
  {
    title: 'KNIME',
    badge: 'Bridge',
    text: 'Run existing KNIME workflows (.knwf) as Continuum nodes and bring your KNIME work to the cloud.',
    tags: ['.knwf', 'Executors'],
    icon: 'M12 3.5l9 15.5H3L12 3.5z',
    to: '/docs/feature-nodes/knime',
    accent: '#f59e0b',
    accent2: '#ef4444',
  },
];

const TECH: {name: string; color: string}[] = [
  {name: 'Temporal', color: '#a78bfa'},
  {name: 'Apache Kafka', color: '#f472b6'},
  {name: 'Spring Boot', color: '#4ade80'},
  {name: 'Kotlin', color: '#c084fc'},
  {name: 'Eclipse Theia', color: '#60a5fa'},
  {name: 'React Flow', color: '#f43f5e'},
  {name: 'Apache Parquet', color: '#22d3ee'},
  {name: 'MinIO', color: '#fb7185'},
  {name: 'MQTT', color: '#a3e635'},
  {name: 'PostgreSQL', color: '#38bdf8'},
  {name: 'Kubernetes', color: '#818cf8'},
  {name: 'Helm', color: '#2dd4bf'},
];

const QUICK_START = [
  'git clone https://github.com/projectcontinuum-org/continuum-local-setup.git',
  'cd continuum-local-setup/docker',
  'docker compose up -d',
];

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

const NODE_W = 160;
const NODE_H = 64;

const FLOW_NODES = [
  {id: 'a', x: 8, y: 128, title: 'Create Table', sub: 'Data', color: '#818cf8', stage: 1},
  {id: 'b', x: 220, y: 36, title: 'Text Normalizer', sub: 'Text', color: '#f472b6', stage: 2},
  {id: 'c', x: 220, y: 220, title: 'Crypto Hasher', sub: 'Security', color: '#fbbf24', stage: 2},
  {id: 'd', x: 432, y: 128, title: 'Anomaly Detector', sub: 'Analytics', color: '#34d399', stage: 3},
];

const FLOW_EDGES: [string, string][] = [
  ['a', 'b'],
  ['a', 'c'],
  ['b', 'd'],
  ['c', 'd'],
];

function edgePath(fromId: string, toId: string) {
  const from = FLOW_NODES.find((n) => n.id === fromId)!;
  const to = FLOW_NODES.find((n) => n.id === toId)!;
  const x1 = from.x + NODE_W;
  const y1 = from.y + NODE_H / 2;
  const x2 = to.x;
  const y2 = to.y + NODE_H / 2;
  return `M${x1} ${y1} C${x1 + 30} ${y1}, ${x2 - 30} ${y2}, ${x2} ${y2}`;
}

function WorkflowPreview() {
  const stageClass = [styles.stage1, styles.stage2, styles.stage3];
  return (
    <div className={styles.preview}>
      <div className={styles.previewBar}>
        <span className={styles.dots}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.previewTitle}>Continuum Workbench</span>
        <span className={styles.liveBadge}>
          <span className={styles.liveDot} /> Live run
        </span>
      </div>
      <svg className={styles.flow} viewBox="0 0 600 320" role="img" aria-label="Example workflow executing node by node">
        <defs>
          <linearGradient id="edgeGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        {FLOW_EDGES.map(([from, to]) => (
          <g key={`${from}-${to}`}>
            <path d={edgePath(from, to)} className={styles.edgeBase} />
            <path d={edgePath(from, to)} className={styles.edgeFlow} stroke="url(#edgeGradient)" />
          </g>
        ))}
        {FLOW_NODES.map((n) => (
          <g key={n.id} transform={`translate(${n.x} ${n.y})`} className={stageClass[n.stage - 1]}>
            <rect width={NODE_W} height={NODE_H} rx={12} className={styles.nodeBox} stroke={n.color} />
            <circle cx={22} cy={28} r={11} fill={n.color} opacity={0.18} />
            <circle cx={22} cy={28} r={5} className={styles.nodeStatus} />
            <text x={42} y={25} className={styles.nodeTitle}>
              {n.title}
            </text>
            <text x={42} y={42} className={styles.nodeSub}>
              {n.sub}
            </text>
            <rect x={12} y={NODE_H - 10} width={NODE_W - 24} height={3} rx={1.5} className={styles.nodeTrack} />
            <rect
              x={12}
              y={NODE_H - 10}
              width={NODE_W - 24}
              height={3}
              rx={1.5}
              fill={n.color}
              className={styles.nodeProgress}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

function Hero() {
  const {siteConfig} = useDocusaurusContext();
  const logo = useBaseUrl('/img/Logo.png');
  return (
    <header className={styles.hero}>
      <div className={clsx(styles.blob, styles.blob1)} />
      <div className={clsx(styles.blob, styles.blob2)} />
      <div className={clsx(styles.blob, styles.blob3)} />
      <div className={styles.gridOverlay} />
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.heroText}>
          <Link className={styles.pill} href="https://github.com/projectcontinuum-org">
            <span className={styles.pillTag}>Open source</span>
            Apache 2.0 · Star us on GitHub →
          </Link>
          <div className={styles.brandRow}>
            <img src={logo} alt="" className={styles.heroLogo} />
            <span className={styles.brandName}>Project Continuum</span>
          </div>
          <Heading as="h1" className={styles.heroTitle}>
            Visual workflows that <span className={styles.gradientText}>never lose progress</span>
          </Heading>
          <p className={styles.heroSubtitle}>{siteConfig.tagline} Inspired by KNIME, built for the cloud.</p>
          <div className={styles.heroButtons}>
            <Link className={clsx(styles.btn, styles.btnPrimary)} to="/docs/getting-started/local-setup">
              Get started
            </Link>
            <Link className={clsx(styles.btn, styles.btnGhost)} to="/docs/intro">
              Read the docs
            </Link>
            <Link className={clsx(styles.btn, styles.btnGhost)} to="/docs/contributing/create-new-nodes">
              Build a node
            </Link>
          </div>
        </div>
        <WorkflowPreview />
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Stats() {
  return (
    <section className={clsx('container', styles.stats)}>
      {STATS.map((s) => (
        <div key={s.label} className={styles.stat}>
          <span className={styles.statValue}>{s.value}</span>
          <span className={styles.statLabel}>{s.label}</span>
        </div>
      ))}
    </section>
  );
}

function SectionHeader({eyebrow, title, text}: {eyebrow: string; title: ReactNode; text: string}) {
  return (
    <div className={styles.sectionHeader}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <Heading as="h2" className={styles.sectionTitle}>
        {title}
      </Heading>
      <p className={styles.sectionText}>{text}</p>
    </div>
  );
}

function Features() {
  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHeader
          eyebrow="Why Continuum"
          title={
            <>
              Everything a data pipeline needs, <span className={styles.gradientTextAlt}>nothing to install</span>
            </>
          }
          text="Design in the browser, run on durable infrastructure, and extend the platform without touching its core."
        />
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <Link key={f.title} to={f.to} className={styles.featureCard} style={accentStyle(f)}>
              <span className={styles.iconBadge}>
                <Icon d={f.icon} className={styles.icon} />
              </span>
              <Heading as="h3" className={styles.cardTitle}>
                {f.title}
              </Heading>
              <p className={styles.cardText}>{f.text}</p>
              <span className={styles.cardLink}>Learn more →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <SectionHeader
          eyebrow="How it works"
          title="From canvas to results in four steps"
          text="Each node is a Temporal activity dispatched to the worker that owns it, with live progress streamed back to you."
        />
        <ol className={styles.steps}>
          {STEPS.map((s, i) => (
            <li key={s.title} className={styles.step} style={accentStyle(s)}>
              <span className={styles.stepNumber}>{i + 1}</span>
              <Heading as="h3" className={styles.cardTitle}>
                {s.title}
              </Heading>
              <p className={styles.cardText}>{s.text}</p>
            </li>
          ))}
        </ol>
        <div className={styles.centered}>
          <Link className={clsx(styles.btn, styles.btnOutline)} to="/docs/architecture/overview">
            Explore the architecture
          </Link>
        </div>
      </div>
    </section>
  );
}

function QuickStart() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(QUICK_START.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <section className={styles.section}>
      <div className={clsx('container', styles.quickStart)}>
        <div>
          <span className={styles.eyebrow}>Quick start</span>
          <Heading as="h2" className={styles.sectionTitle}>
            The whole platform, <span className={styles.gradientTextAlt}>one command away</span>
          </Heading>
          <p className={styles.sectionText}>
            No builds and no cloning five repositories. Docker Compose starts the infrastructure, the platform
            backend, the Workbench and the feature workers, already wired together with example workflows.
          </p>
          <ul className={styles.checks}>
            <li>Temporal, Kafka, MinIO and PostgreSQL included</li>
            <li>Workbench at localhost:3002 with example workflows</li>
            <li>Base, cheminformatics and AI workers ready to use</li>
          </ul>
          <Link className={clsx(styles.btn, styles.btnOutline)} to="/docs/getting-started/local-setup">
            Local setup guide
          </Link>
        </div>
        <div className={styles.terminal}>
          <div className={styles.terminalBar}>
            <span className={styles.dots}>
              <i />
              <i />
              <i />
            </span>
            <span className={styles.terminalTitle}>bash</span>
            <button type="button" className={styles.copyButton} onClick={copy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className={styles.terminalBody}>
            {QUICK_START.map((line) => (
              <div key={line}>
                <span className={styles.prompt}>$</span> {line}
              </div>
            ))}
            <div className={styles.terminalOk}>✔ Continuum is up: open http://127.0.0.1:3002</div>
          </pre>
        </div>
      </div>
    </section>
  );
}

function Workers() {
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <SectionHeader
          eyebrow="Node libraries"
          title="Batteries included, and room for yours"
          text="Each feature worker is an independent service that registers its nodes with the platform at startup."
        />
        <div className={styles.workerGrid}>
          {WORKERS.map((w) => (
            <Link key={w.title} to={w.to} className={styles.workerCard} style={accentStyle(w)}>
              <div className={styles.workerHead}>
                <span className={styles.iconBadge}>
                  <Icon d={w.icon} className={styles.icon} />
                </span>
                <span className={styles.workerBadge}>{w.badge}</span>
              </div>
              <Heading as="h3" className={styles.cardTitle}>
                {w.title}
              </Heading>
              <p className={styles.cardText}>{w.text}</p>
              <div className={styles.tags}>
                {w.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          <Link to="/docs/contributing/create-new-nodes" className={clsx(styles.workerCard, styles.workerCardOwn)}>
            <span className={styles.plus}>
              <Icon d="M12 5v14M5 12h14" className={styles.icon} />
            </span>
            <Heading as="h3" className={styles.cardTitle}>
              Build your own
            </Heading>
            <p className={styles.cardText}>
              Start from the feature template and ship a worker with your own nodes in Kotlin or Java.
            </p>
            <span className={styles.cardLink}>Create new nodes →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHeader
          eyebrow="Built on proven tech"
          title="Standing on the shoulders of giants"
          text="Continuum combines battle-tested open-source infrastructure instead of reinventing it."
        />
        <div className={styles.techGrid}>
          {TECH.map((t) => (
            <span key={t.name} className={styles.techChip} style={{'--dot': t.color} as CSSProperties}>
              <span className={styles.techDot} />
              {t.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className={clsx('container', styles.ctaWrap)}>
      <div className={styles.cta}>
        <div className={clsx(styles.blob, styles.ctaBlob1)} />
        <div className={clsx(styles.blob, styles.ctaBlob2)} />
        <Heading as="h2" className={styles.ctaTitle}>
          Ready to build your first workflow?
        </Heading>
        <p className={styles.ctaText}>
          Spin up the stack locally, drag a few nodes onto the canvas and watch them run.
        </p>
        <div className={styles.heroButtons}>
          <Link className={clsx(styles.btn, styles.btnLight)} to="/docs/getting-started/local-setup">
            Get started
          </Link>
          <Link className={clsx(styles.btn, styles.btnGhost)} to="/docs/ecosystem">
            Browse the repositories
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Documentation for Project Continuum — the open-source visual workflow platform.">
      <Hero />
      <main className={styles.main}>
        <Stats />
        <Features />
        <HowItWorks />
        <QuickStart />
        <Workers />
        <TechStack />
        <CallToAction />
      </main>
    </Layout>
  );
}
