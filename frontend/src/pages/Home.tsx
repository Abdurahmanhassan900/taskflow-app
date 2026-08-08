import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── Scroll progress hook ─────────────────────────────────────────────── */
function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      () => {
        const rect = el.getBoundingClientRect();
        const windowH = window.innerHeight;
        const total = rect.height - windowH;
        const scrolled = -rect.top;
        setProgress(Math.min(1, Math.max(0, scrolled / total)));
      },
      { threshold: Array.from({ length: 101 }, (_, i) => i / 100) },
    );
    observer.observe(el);
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const total = rect.height - windowH;
      const scrolled = -rect.top;
      setProgress(Math.min(1, Math.max(0, scrolled / total)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [ref]);
  return progress;
}

/* ─── Fade-in on scroll ─────────────────────────────────────────────────── */
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Animated counter ──────────────────────────────────────────────────── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = target / 60;
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setVal(target);
              clearInterval(timer);
            } else {
              setVal(Math.floor(start));
            }
          }, 16);
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── The live task card that builds itself ─────────────────────────────── */
function LiveTaskCard({ progress }: { progress: number }) {
  const p = progress;

  // Each feature appears at a threshold
  const showTitle = p > 0.05;
  const titleProgress = Math.min(1, Math.max(0, (p - 0.05) / 0.12));
  const showBadge = p > 0.2;
  const showDate = p > 0.32;
  const showAssignee = p > 0.44;
  const showDesc = p > 0.55;
  const showProgress = p > 0.66;
  const barWidth = showProgress ? Math.min(100, Math.round(((p - 0.66) / 0.2) * 68)) : 0;
  const showTags = p > 0.78;
  const showCheck = p > 0.9;

  const fullTitle = 'Design system overhaul';
  const visibleTitle = fullTitle.slice(0, Math.round(titleProgress * fullTitle.length));

  return (
    <div
      className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(18,12,30,0.85)',
        border: '1px solid rgba(170,59,255,0.25)',
        boxShadow: showCheck
          ? '0 0 60px rgba(170,59,255,0.35), 0 0 120px rgba(170,59,255,0.15)'
          : '0 0 30px rgba(170,59,255,0.1)',
        transition: 'box-shadow 0.6s ease',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: 'rgba(170,59,255,0.15)' }}
      >
        <div className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
        <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-70" />
        <div className="w-3 h-3 rounded-full bg-green-400 opacity-70" />
        <span className="ml-2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          taskflow — new task
        </span>
      </div>

      <div className="p-6 space-y-4 min-h-[320px]">
        {/* Title */}
        <div className="space-y-1">
          <p className="text-xs font-medium" style={{ color: 'rgba(170,59,255,0.7)' }}>
            TASK TITLE
          </p>
          <h3
            className="text-xl font-bold tracking-tight"
            style={{
              color: '#fff',
              minHeight: '1.75rem',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {showTitle ? (
              <>
                {visibleTitle}
                {titleProgress < 1 && (
                  <span
                    className="inline-block w-0.5 h-5 ml-0.5 align-middle"
                    style={{
                      background: '#aa3bff',
                      animation: 'blink 1s step-end infinite',
                    }}
                  />
                )}
              </>
            ) : (
              <span
                className="inline-block w-0.5 h-5 align-middle"
                style={{ background: '#aa3bff', animation: 'blink 1s step-end infinite' }}
              />
            )}
          </h3>
        </div>

        {/* Priority badge */}
        <div
          style={{
            opacity: showBadge ? 1 : 0,
            transform: showBadge ? 'translateX(0)' : 'translateX(-12px)',
            transition: 'all 0.4s ease',
          }}
        >
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
            HIGH PRIORITY
          </span>
        </div>

        {/* Due date */}
        <div
          className="flex items-center gap-2"
          style={{
            opacity: showDate ? 1 : 0,
            transform: showDate ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.4s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(170,59,255,0.7)" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Due Aug 22, 2026
          </span>
        </div>

        {/* Assignee */}
        <div
          className="flex items-center gap-2"
          style={{
            opacity: showAssignee ? 1 : 0,
            transform: showAssignee ? 'translateX(0)' : 'translateX(-8px)',
            transition: 'all 0.4s ease',
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #aa3bff, #7c3aed)', color: '#fff' }}
          >
            AH
          </div>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Assigned to <span style={{ color: '#fff' }}>Abdurahman H.</span>
          </span>
        </div>

        {/* Description */}
        <div
          style={{
            opacity: showDesc ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Revamp the entire component library with new tokens, spacing scale, and dark-mode support across all surfaces.
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            opacity: showProgress ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Progress
            </span>
            <span className="text-xs font-semibold" style={{ color: '#aa3bff' }}>
              {barWidth}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${barWidth}%`,
                background: 'linear-gradient(90deg, #aa3bff, #7c3aed)',
                transition: 'width 0.1s linear',
                boxShadow: '0 0 8px rgba(170,59,255,0.6)',
              }}
            />
          </div>
        </div>

        {/* Tags */}
        <div
          className="flex flex-wrap gap-2"
          style={{
            opacity: showTags ? 1 : 0,
            transform: showTags ? 'translateY(0)' : 'translateY(6px)',
            transition: 'all 0.4s ease',
          }}
        >
          {['Design', 'Frontend', 'Q3-2026'].map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-md text-xs"
              style={{
                background: 'rgba(170,59,255,0.1)',
                color: 'rgba(170,59,255,0.8)',
                border: '1px solid rgba(170,59,255,0.2)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Completion overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center rounded-2xl"
        style={{
          opacity: showCheck ? 1 : 0,
          transition: 'opacity 0.6s ease',
          background: 'rgba(170,59,255,0.06)',
          pointerEvents: 'none',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(170,59,255,0.15)',
            border: '2px solid rgba(170,59,255,0.5)',
            boxShadow: '0 0 30px rgba(170,59,255,0.3)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature card ──────────────────────────────────────────────────────── */
function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div
        className="p-6 rounded-2xl h-full"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          transition: 'border-color 0.3s, background 0.3s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(170,59,255,0.35)';
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(170,59,255,0.05)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(170,59,255,0.12)', border: '1px solid rgba(170,59,255,0.2)' }}
        >
          {icon}
        </div>
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {desc}
        </p>
      </div>
    </FadeIn>
  );
}

/* ─── Testimonial card ──────────────────────────────────────────────────── */
function TestimonialCard({
  quote,
  name,
  role,
  initials,
  delay,
}: {
  quote: string;
  name: string;
  role: string;
  initials: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div
        className="p-6 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
          "{quote}"
        </p>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #aa3bff, #7c3aed)', color: '#fff' }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {role}
            </p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

/* ─── Main Home component ───────────────────────────────────────────────── */
export function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(scrollRef);

  // Parallax for hero text
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      style={{
        background: '#08060d',
        color: '#fff',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .gradient-text {
          background: linear-gradient(135deg, #aa3bff 0%, #7c3aed 40%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #aa3bff 0%, #fff 40%, #aa3bff 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .nav-blur {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .glow-dot {
          box-shadow: 0 0 8px 2px rgba(170,59,255,0.7);
        }
      `}</style>

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 nav-blur"
        style={{
          background: 'rgba(8,6,13,0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #aa3bff, #7c3aed)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">TaskFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#fff')}
                onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)')}
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)')}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(170,59,255,0.3)',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 30px rgba(170,59,255,0.5)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 20px rgba(170,59,255,0.3)')}
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16"
        style={{ overflow: 'hidden' }}
      >
        {/* Background glow orbs */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(170,59,255,0.12) 0%, transparent 70%)',
            transform: `translate(-50%, calc(-50% + ${scrollY * 0.2}px))`,
          }}
        />
        <div
          className="absolute bottom-0 right-0 rounded-full pointer-events-none"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{
            background: 'rgba(170,59,255,0.1)',
            border: '1px solid rgba(170,59,255,0.25)',
            color: 'rgba(170,59,255,0.9)',
            transform: `translateY(${-scrollY * 0.05}px)`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 glow-dot" />
          Now with AI-powered task suggestions
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none"
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
        >
          <span className="text-white">A better way to</span>
          <br />
          <span className="gradient-text">get things done.</span>
        </h1>

        <p
          className="text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
          style={{
            color: 'rgba(255,255,255,0.5)',
            transform: `translateY(${scrollY * 0.06}px)`,
          }}
        >
          TaskFlow turns chaos into clarity. Build, assign, and track tasks with a workflow that feels as fast as you think.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center gap-4"
          style={{ transform: `translateY(${scrollY * 0.04}px)` }}
        >
          <Link
            to="/register"
            className="px-8 py-3.5 rounded-xl font-semibold text-base transition-all"
            style={{
              background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
              color: '#fff',
              boxShadow: '0 0 30px rgba(170,59,255,0.4)',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)')}
          >
            Start for free →
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-3.5 rounded-xl font-semibold text-base transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.1)';
              (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            See how it works
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: Math.max(0, 1 - scrollY / 200) }}
        >
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Scroll to explore
          </span>
          <div
            className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
            style={{ borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <div
              className="w-1 h-2 rounded-full"
              style={{
                background: '#aa3bff',
                animation: 'float 1.5s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── SCROLL-DRIVEN TASK BUILD ── */}
      <section id="how-it-works" className="relative">
        {/* Sticky scroll container — 500vh tall so we have lots of scroll room */}
        <div ref={scrollRef} style={{ height: '500vh' }}>
          <div
            className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
            style={{ background: '#08060d' }}
          >
            {/* Background glow that intensifies with progress */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(170,59,255,${0.04 + progress * 0.1}) 0%, transparent 70%)`,
              }}
            />

            <div className="max-w-6xl w-full mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
              {/* Left: copy */}
              <div className="space-y-6">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(170,59,255,0.1)',
                    border: '1px solid rgba(170,59,255,0.2)',
                    color: 'rgba(170,59,255,0.8)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Watch it build
                </div>

                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                  <span className="text-white">Every task,</span>
                  <br />
                  <span className="gradient-text">perfectly crafted.</span>
                </h2>

                <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Scroll down to watch a task come to life — title, priority, deadline, assignee, and progress all slot into place one by one.
                </p>

                {/* Step indicators */}
                <div className="space-y-3">
                  {[
                    { label: 'Task title', threshold: 0.05 },
                    { label: 'Priority level', threshold: 0.2 },
                    { label: 'Due date', threshold: 0.32 },
                    { label: 'Assignee', threshold: 0.44 },
                    { label: 'Description', threshold: 0.55 },
                    { label: 'Progress bar', threshold: 0.66 },
                    { label: 'Tags', threshold: 0.78 },
                    { label: 'Completed!', threshold: 0.9 },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{
                          background: progress >= step.threshold ? 'rgba(170,59,255,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${progress >= step.threshold ? 'rgba(170,59,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: progress >= step.threshold ? '0 0 8px rgba(170,59,255,0.3)' : 'none',
                        }}
                      >
                        {progress >= step.threshold && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-sm transition-colors duration-300"
                        style={{ color: progress >= step.threshold ? '#fff' : 'rgba(255,255,255,0.3)' }}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: live task card */}
              <div style={{ animation: 'float 4s ease-in-out infinite' }}>
                <LiveTaskCard progress={progress} />
              </div>
            </div>

            {/* Progress bar at bottom */}
            <div
              className="absolute bottom-0 left-0 h-0.5"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #aa3bff, #7c3aed)',
                boxShadow: '0 0 10px rgba(170,59,255,0.5)',
                transition: 'width 0.05s linear',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 50000, suffix: '+', label: 'Tasks completed' },
            { value: 12000, suffix: '+', label: 'Active teams' },
            { value: 99, suffix: '%', label: 'Uptime SLA' },
            { value: 4.9, suffix: '/5', label: 'User rating' },
          ].map((stat) => (
            <FadeIn key={stat.label} delay={100}>
              <div>
                <p className="text-4xl font-black gradient-text mb-1">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {stat.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-sm font-medium mb-3" style={{ color: 'rgba(170,59,255,0.8)' }}>
                EVERYTHING YOU NEED
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Built for how teams actually work
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
                From solo sprints to cross-functional projects, TaskFlow adapts to your workflow.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              }
              title="Instant task creation"
              desc="Create tasks in seconds with smart defaults. Add title, priority, due date, and assignee without breaking your flow."
              delay={0}
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              }
              title="Kanban & list views"
              desc="Switch between board and list views instantly. Drag tasks between columns or sort by any field."
              delay={100}
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              }
              title="Deadline tracking"
              desc="Never miss a deadline. Visual due-date indicators and smart reminders keep your team on track."
              delay={200}
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              title="Team collaboration"
              desc="Assign tasks, leave comments, and @mention teammates. Everyone stays in the loop automatically."
              delay={300}
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              }
              title="Progress analytics"
              desc="Real-time dashboards show velocity, completion rates, and bottlenecks across your entire workspace."
              delay={400}
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              }
              title="AI task suggestions"
              desc="Let AI break down big goals into actionable tasks, estimate effort, and suggest the best order to tackle them."
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS STEPS ── */}
      <section
        className="py-24 px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(170,59,255,0.02)' }}
      >
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-sm font-medium mb-3" style={{ color: 'rgba(170,59,255,0.8)' }}>
                THREE STEPS
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white">
                From idea to done
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-12">
            {[
              {
                step: '01',
                title: 'Create your workspace',
                desc: 'Sign up in seconds and invite your team. Set up projects, labels, and priorities that match how you work.',
              },
              {
                step: '02',
                title: 'Build and assign tasks',
                desc: 'Create tasks with rich details — descriptions, due dates, priority levels, and file attachments. Assign them to the right people.',
              },
              {
                step: '03',
                title: 'Track and ship',
                desc: 'Move tasks through your workflow, monitor progress in real time, and celebrate every completion.',
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 150}>
                <div className="flex gap-8 items-start">
                  <div
                    className="text-5xl font-black flex-shrink-0 w-16"
                    style={{ color: 'rgba(170,59,255,0.15)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {item.step}
                  </div>
                  <div
                    className="flex-1 pb-12"
                    style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Loved by productive teams
              </h2>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-5">
            <TestimonialCard
              quote="TaskFlow completely replaced our spreadsheet chaos. The scroll-through task builder is genuinely satisfying to use."
              name="Sarah Chen"
              role="Product Lead, Vercel"
              initials="SC"
              delay={0}
            />
            <TestimonialCard
              quote="We shipped 40% more features last quarter. The priority system and deadline tracking keep everyone aligned."
              name="Marcus Rivera"
              role="Engineering Manager, Stripe"
              initials="MR"
              delay={100}
            />
            <TestimonialCard
              quote="The dark UI is gorgeous and the performance is snappy. Finally a task manager that doesn't feel like enterprise software."
              name="Aiko Tanaka"
              role="Design Director, Figma"
              initials="AT"
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id="pricing"
        className="py-24 px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(170,59,255,0.02)' }}
      >
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-sm font-medium mb-3" style={{ color: 'rgba(170,59,255,0.8)' }}>
                PRICING
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Simple, honest pricing
              </h2>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Start free. Upgrade when you need more.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                features: ['Up to 3 projects', 'Unlimited tasks', 'Basic analytics', '2 team members'],
                cta: 'Get started',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$12',
                period: 'per user / month',
                features: ['Unlimited projects', 'Advanced analytics', 'AI task suggestions', 'Priority support', 'Custom labels & fields'],
                cta: 'Start free trial',
                highlight: true,
              },
            ].map((plan) => (
              <FadeIn key={plan.name} delay={plan.highlight ? 100 : 0}>
                <div
                  className="p-8 rounded-2xl relative"
                  style={{
                    background: plan.highlight ? 'rgba(170,59,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${plan.highlight ? 'rgba(170,59,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: plan.highlight ? '0 0 40px rgba(170,59,255,0.1)' : 'none',
                  }}
                >
                  {plan.highlight && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'linear-gradient(135deg, #aa3bff, #7c3aed)', color: '#fff' }}
                    >
                      Most popular
                    </div>
                  )}
                  <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                  </div>
                  <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {plan.period}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className="block text-center py-3 rounded-xl font-semibold text-sm transition-all"
                    style={
                      plan.highlight
                        ? {
                            background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
                            color: '#fff',
                            boxShadow: '0 0 20px rgba(170,59,255,0.3)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.07)',
                            color: 'rgba(255,255,255,0.7)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }
                    }
                  >
                    {plan.cta}
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 text-center relative" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(170,59,255,0.08) 0%, transparent 70%)',
          }}
        />
        <FadeIn>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Ready to flow?
          </h2>
          <p className="text-xl mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Join thousands of teams shipping faster with TaskFlow.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 rounded-xl font-bold text-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
              color: '#fff',
              boxShadow: '0 0 40px rgba(170,59,255,0.4)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.04)';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 60px rgba(170,59,255,0.6)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 40px rgba(170,59,255,0.4)';
            }}
          >
            Get started for free →
          </Link>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-12 px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #aa3bff, #7c3aed)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <span className="font-bold text-white">TaskFlow</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © 2026 TaskFlow. Built with focus.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.3)')}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
