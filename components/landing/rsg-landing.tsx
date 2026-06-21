'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';

/**
 * VO Tracker — RSG Redesign landing/cover page.
 * Faithful implementation of the exported Claude Design ("RSG Cream" ambiance):
 * warm cream canvas, floating glass pills/cards, Newsreader serif + Hanken
 * Grotesk, terracotta / teal / gold accents.
 */

const SERIF = "var(--font-newsreader), 'Newsreader', serif";
const SANS = "var(--font-hanken), 'Hanken Grotesk', system-ui, sans-serif";

const glass = {
  background: 'rgba(255,255,255,.5)',
  backdropFilter: 'blur(26px) saturate(150%)',
  WebkitBackdropFilter: 'blur(26px) saturate(150%)',
  border: '1px solid rgba(255,255,255,.7)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.85)',
} as const;

const statGlass = {
  background: 'rgba(255,255,255,.46)',
  backdropFilter: 'blur(24px) saturate(150%)',
  WebkitBackdropFilter: 'blur(24px) saturate(150%)',
  border: '1px solid rgba(255,255,255,.65)',
  boxShadow: '0 10px 36px rgba(74,48,30,.12), inset 0 1px 0 rgba(255,255,255,.8)',
} as const;

export function RsgLanding() {
  const { isLoaded, isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const signIn = () => openSignIn({ forceRedirectUrl: '/intelligence' });

  // Auto-open the sign-in popup on first entry for signed-out visitors.
  useEffect(() => {
    if (isLoaded && !isSignedIn && typeof window !== 'undefined') {
      if (!sessionStorage.getItem('signin-prompted')) {
        sessionStorage.setItem('signin-prompted', '1');
        openSignIn({ forceRedirectUrl: '/intelligence' });
      }
    }
  }, [isLoaded, isSignedIn, openSignIn]);

  return (
    <div
      style={{
        position: 'relative',
        overflowX: 'hidden',
        minHeight: '100vh',
        color: '#221c14',
        fontFamily: SANS,
        background: 'radial-gradient(120% 90% at 50% -10%,#faf6ee 0%,#f1e9da 52%,#e9ddc9 100%)',
      }}
    >
      <style>{`
        @keyframes rsgFloatA{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(6%,-7%) scale(1.12)}}
        @keyframes rsgFloatB{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-8%,5%) scale(1.08)}}
        @keyframes rsgFloatC{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(5%,6%) scale(1.15)}}
        .rsg a{color:inherit;text-decoration:none}
        .rsg ::selection{background:rgba(176,81,47,.22)}
        .rsg .lnk{transition:color .2s}.rsg .lnk:hover{color:#b0512f}
        .rsg .btn-dark{transition:background .2s,transform .2s}.rsg .btn-dark:hover{background:#b0512f}
        .rsg .btn-glass{transition:background .2s}.rsg .btn-glass:hover{background:rgba(255,255,255,.72)}
        .rsg .tile{transition:transform .35s,box-shadow .35s}.rsg .tile:hover{transform:translateY(-6px)}
        .rsg input::placeholder{color:rgba(45,38,28,.45)}
        @media(max-width:900px){
          .rsg .grid4{grid-template-columns:repeat(2,1fr)!important}
          .rsg .grid2{grid-template-columns:1fr!important;gap:32px!important}
          .rsg .grid3{grid-template-columns:1fr!important}
          .rsg .navlinks{display:none!important}
          .rsg .panel-pad{padding:36px 26px!important}
          .rsg .foot-pad{padding:40px 26px 28px!important}
        }
        @media(max-width:560px){
          .rsg .grid4{grid-template-columns:1fr 1fr!important}
          .rsg .hdr{gap:10px!important;padding:0 12px 0 16px!important}
          .rsg .hide-sm{display:none!important}
          .rsg .hero-pad{padding:70px 20px 48px!important}
          .rsg .panel-pad{padding:28px 20px!important}
          .rsg .foot-pad{padding:34px 22px 24px!important}
          .rsg .foot-grid{grid-template-columns:1fr 1fr!important;gap:24px!important}
          .rsg .logo-rsg{height:24px!important}
          .rsg .logo-ffc{height:20px!important}
        }
      `}</style>

      {/* Atmospheric backdrop blobs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-12%', left: '-6%', width: '46vw', height: '46vw', borderRadius: '50%', background: 'radial-gradient(circle,#cdbb8e,#b6a371)', filter: 'blur(72px)', opacity: 0.6, animation: 'rsgFloatA 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '28%', right: '-10%', width: '42vw', height: '42vw', borderRadius: '50%', background: 'radial-gradient(circle,#a9c0cf,#88a4b6)', filter: 'blur(82px)', opacity: 0.55, animation: 'rsgFloatB 22s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-14%', left: '24%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle,#d8c8ad,#c3ad8a)', filter: 'blur(92px)', opacity: 0.5, animation: 'rsgFloatC 26s ease-in-out infinite' }} />
      </div>

      <div className="rsg" style={{ position: 'relative', zIndex: 2 }}>
        {/* HEADER */}
        <header style={{ position: 'sticky', top: 18, zIndex: 50, padding: '0 24px' }}>
          <div className="hdr" style={{ maxWidth: 1320, margin: '0 auto', height: 66, padding: '0 16px 0 26px', display: 'flex', alignItems: 'center', gap: 30, borderRadius: 999, ...glass, boxShadow: '0 12px 40px rgba(74,48,30,.14), inset 0 1px 0 rgba(255,255,255,.85)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="logo-rsg" src="/rsg-logo.png" alt="Red Sea Global" style={{ height: 30, width: 'auto' }} />
              <span style={{ width: 1, height: 22, background: 'rgba(34,28,20,.2)' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="logo-ffc" src="/firstfix-v2.png" alt="FirstFix" style={{ height: 24, width: 'auto' }} />
            </div>
            <nav className="navlinks" style={{ marginLeft: 14, display: 'flex', gap: 26, font: `500 13.5px ${SANS}`, color: 'rgba(45,38,28,.72)' }}>
              <Link className="lnk" href="/intelligence">Dashboard</Link>
              <Link className="lnk" href="/vos">VO Register</Link>
              <Link className="lnk" href="/payments">Payments</Link>
              <Link className="lnk" href="/intelligence">Analytics</Link>
            </nav>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={signIn} className="lnk hide-sm" style={{ font: `600 13px ${SANS}`, color: 'rgba(45,38,28,.8)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign In</button>
              <Link href="/intelligence" className="btn-dark" style={{ font: `600 13px ${SANS}`, letterSpacing: 0.3, color: '#fff', background: '#221c14', padding: '11px 24px', borderRadius: 999, boxShadow: '0 4px 16px rgba(34,28,20,.25), inset 0 1px 0 rgba(255,255,255,.18)' }}>Open Register</Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="hero-pad" style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '90px 24px 60px' }}>
          {/* hero background image (Red Sea) with cream scrim for legibility */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero/redsea-1.jpg" alt="Red Sea waterfront" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(244,234,217,.97) 0%, rgba(244,234,217,.88) 34%, rgba(244,234,217,.55) 62%, rgba(244,234,217,.22) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(244,234,217,.5) 0%, transparent 24%, transparent 64%, rgba(244,234,217,.92) 100%)' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 1320, margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px 8px 12px', borderRadius: 999, marginBottom: 30, ...glass }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2f8a82', boxShadow: '0 0 10px #2f8a82' }} />
              <span style={{ font: `600 11.5px ${SANS}`, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(45,38,28,.78)' }}>HW2 · Commercial Register System</span>
            </div>
            <h1 style={{ font: `300 clamp(44px,7vw,96px) ${SERIF}`, lineHeight: 1.02, margin: 0, maxWidth: '16ch', letterSpacing: 0.5, color: '#221c14' }}>Building the Commercial Record with Purpose</h1>
            <p style={{ margin: '28px 0 0', maxWidth: '54ch', font: `400 18px/1.7 ${SANS}`, color: 'rgba(45,38,28,.72)' }}>We track every variation and payment to protect value and enrich outcomes across the HW2 MEP project — R06‑HW2 SW Hotel 02.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 38 }}>
              <Link href="/intelligence" className="btn-dark" style={{ font: `600 14px ${SANS}`, letterSpacing: 0.3, color: '#fff', background: '#221c14', padding: '16px 34px', borderRadius: 999, boxShadow: '0 8px 28px rgba(34,28,20,.25), inset 0 1px 0 rgba(255,255,255,.18)' }}>Open Dashboard</Link>
              <Link href="/vos/new" className="btn-glass" style={{ font: `600 14px ${SANS}`, letterSpacing: 0.3, color: '#221c14', padding: '15px 32px', borderRadius: 999, ...glass }}>New Variation Order</Link>
            </div>

            {/* stat strip */}
            <div className="grid4" style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {[
                { v: 'SAR 232M', l: 'Contract Value', c: '#0f5a54' },
                { v: '150+', l: 'Variation Orders', c: '#0f5a54' },
                { v: '300+', l: 'Payment Applications', c: '#0f5a54' },
                { v: '99%', l: 'Accuracy Rate', c: '#b0512f' },
              ].map((s) => (
                <div key={s.l} style={{ padding: 26, borderRadius: 22, ...statGlass }}>
                  <div style={{ font: `300 40px ${SERIF}`, color: s.c }}>{s.v}</div>
                  <div style={{ marginTop: 8, font: `600 11px ${SANS}`, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(45,38,28,.55)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* READY / NEWSLETTER */}
        <section style={{ padding: '60px 24px 30px' }}>
          <div className="grid2 panel-pad" style={{ maxWidth: 1320, margin: '0 auto', padding: '64px 56px', borderRadius: 30, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 70, alignItems: 'center', ...glass, boxShadow: '0 20px 60px rgba(74,48,30,.14), inset 0 1px 0 rgba(255,255,255,.85)' }}>
            <div>
              <h2 style={{ font: `300 clamp(28px,3.4vw,42px) ${SERIF}`, margin: '0 0 16px', color: '#221c14', lineHeight: 1.1 }}>Ready to access the register?</h2>
              <p style={{ margin: '0 0 26px', font: `400 16px/1.7 ${SANS}`, color: 'rgba(45,38,28,.66)', maxWidth: '44ch' }}>Streamline the complete variation order and payment workflow for R06‑HW2 SW Hotel 02.</p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/intelligence" className="btn-dark" style={{ font: `600 14px ${SANS}`, color: '#fff', background: '#221c14', padding: '15px 32px', borderRadius: 999, boxShadow: '0 8px 24px rgba(34,28,20,.25), inset 0 1px 0 rgba(255,255,255,.18)' }}>Access Dashboard</Link>
                <button onClick={signIn} className="btn-glass" style={{ font: `600 14px ${SANS}`, color: '#221c14', padding: '14px 30px', borderRadius: 999, cursor: 'pointer', ...glass }}>Sign In</button>
              </div>
            </div>
            <div>
              <div style={{ font: `600 13px ${SANS}`, letterSpacing: 0.5, color: '#221c14', marginBottom: 8 }}>Register Updates</div>
              <p style={{ margin: '0 0 20px', font: `400 14.5px/1.6 ${SANS}`, color: 'rgba(45,38,28,.6)' }}>Subscribe to get the latest variations and payment updates right to your inbox.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input placeholder="First Name" style={{ flex: 1, background: 'rgba(255,255,255,.55)', border: '1px solid rgba(255,255,255,.8)', borderRadius: 12, padding: '13px 16px', font: `400 14px ${SANS}`, color: '#221c14', outline: 'none' }} />
                  <input placeholder="Last Name" style={{ flex: 1, background: 'rgba(255,255,255,.55)', border: '1px solid rgba(255,255,255,.8)', borderRadius: 12, padding: '13px 16px', font: `400 14px ${SANS}`, color: '#221c14', outline: 'none' }} />
                </div>
                <input placeholder="E-mail address" style={{ background: 'rgba(255,255,255,.55)', border: '1px solid rgba(255,255,255,.8)', borderRadius: 12, padding: '13px 16px', font: `400 14px ${SANS}`, color: '#221c14', outline: 'none' }} />
                <button onClick={signIn} className="btn-dark" style={{ alignSelf: 'flex-start', marginTop: 6, font: `600 13px ${SANS}`, letterSpacing: 0.5, color: '#fff', background: '#221c14', padding: '13px 30px', borderRadius: 999, border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px rgba(34,28,20,.22), inset 0 1px 0 rgba(255,255,255,.18)' }}>Submit</button>
              </div>
            </div>
          </div>
        </section>

        {/* REGISTER ACTIVITY */}
        <section id="news" style={{ padding: '40px 24px 90px' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
            <div style={{ font: `600 12px ${SANS}`, letterSpacing: 2.6, textTransform: 'uppercase', color: '#b0512f' }}>Latest Updates</div>
            <h2 style={{ font: `300 clamp(30px,4vw,46px) ${SERIF}`, margin: '14px 0 8px', letterSpacing: 0.3, color: '#221c14' }}>Register Activity</h2>
            <p style={{ margin: '0 0 44px', font: `400 16px/1.7 ${SANS}`, color: 'rgba(45,38,28,.6)', maxWidth: '64ch' }}>The latest variations, certifications and payment milestones recorded across the HW2 MEP scope.</p>
            <div className="grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
              {[
                { tag: 'Variation Order', title: 'VO‑148 approved for MEP rework at SW Hotel 02 podium level', grad: 'linear-gradient(150deg,#3f9d93,#0f5a54 65%,#0a3b37)', img: '/hero/redsea-2.jpg' },
                { tag: 'Payment', title: 'IPC‑22 certified — cumulative value passes SAR 180M milestone', grad: 'linear-gradient(150deg,#5d8595,#2e4a58 65%,#1d3140)', img: '/hero/redsea-3.jpg' },
                { tag: 'Forecast', title: 'Q3 final-account projection updated with 99% calculation accuracy', grad: 'linear-gradient(150deg,#d3744f,#b0512f 65%,#7c3a22)', img: '/hero/redsea-4.jpg' },
              ].map((c) => (
                <Link key={c.title} href="/intelligence" className="tile" style={{ display: 'block', paddingBottom: 26, borderRadius: 24, overflow: 'hidden', ...statGlass, boxShadow: '0 12px 40px rgba(74,48,30,.12), inset 0 1px 0 rgba(255,255,255,.8)' }}>
                  <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.img} alt="Red Sea project" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: c.grad, opacity: 0.62, mixBlendMode: 'multiply' }} />
                  </div>
                  <div style={{ padding: '24px 26px 0' }}>
                    <div style={{ font: `600 11px ${SANS}`, letterSpacing: 1.5, textTransform: 'uppercase', color: '#b0512f', margin: '0 0 10px' }}>{c.tag}</div>
                    <h3 style={{ font: `400 21px/1.3 ${SERIF}`, margin: '0 0 14px', color: '#221c14' }}>{c.title}</h3>
                    <span style={{ font: `600 12px ${SANS}`, letterSpacing: 0.8, textTransform: 'uppercase', color: '#221c14', borderBottom: '1.5px solid rgba(34,28,20,.4)', paddingBottom: 3 }}>Read more</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* END-TO-END SOLUTIONS */}
        <section id="modules" style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
            <div style={{ font: `600 12px ${SANS}`, letterSpacing: 2.6, textTransform: 'uppercase', color: '#b0512f' }}>Full Project Lifecycle</div>
            <h2 style={{ font: `300 clamp(32px,4.4vw,52px) ${SERIF}`, margin: '16px 0 8px', letterSpacing: 0.3, color: '#221c14' }}>End-to-End Solutions</h2>
            <p style={{ margin: '0 0 48px', font: `400 16px/1.7 ${SANS}`, color: 'rgba(45,38,28,.6)', maxWidth: '58ch' }}>From the first instruction to final certification — every variation, claim and payment captured in one auditable register.</p>
            <div className="grid4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
              {[
                { n: '01', t: 'Capture', d: 'Log variation orders with scope, rate and reference in seconds.', g: 'linear-gradient(150deg,#4aa89f,#0f5a54)', s: 'rgba(15,90,84,.4)', img: '/hero/step-capture.jpg' },
                { n: '02', t: 'Track', d: 'Real-time status across submission, review and certification.', g: 'linear-gradient(150deg,#e3c486,#bb9056)', s: 'rgba(187,144,86,.4)', img: '/hero/step-track.jpg' },
                { n: '03', t: 'Certify', d: 'Lock certified value with a clean, auditable approval trail.', g: 'linear-gradient(150deg,#7fa9b8,#3a6172)', s: 'rgba(58,97,114,.4)', img: '/hero/step-certify.jpg' },
                { n: '04', t: 'Report', d: 'Board-ready KPIs and live financial insight on demand.', g: 'linear-gradient(150deg,#d3744f,#b0512f)', s: 'rgba(176,81,47,.4)', img: '/hero/step-report.jpg' },
              ].map((step) => (
                <div key={step.n} className="tile" style={{ position: 'relative', padding: '0 0 30px', borderRadius: 24, overflow: 'hidden', ...statGlass, boxShadow: '0 12px 40px rgba(74,48,30,.12), inset 0 1px 0 rgba(255,255,255,.8)' }}>
                  <div style={{ position: 'relative', height: 120, overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={step.img} alt={step.t} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: step.g, opacity: 0.62, mixBlendMode: 'multiply' }} />
                    <div style={{ position: 'absolute', left: 24, bottom: 8, font: `300 30px ${SERIF}`, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.4)' }}>{step.n}</div>
                  </div>
                  <div style={{ padding: '16px 26px 0' }}>
                    <div style={{ font: `500 19px ${SERIF}`, margin: '0 0 10px', color: '#221c14' }}>{step.t}</div>
                    <p style={{ margin: 0, font: `400 13.5px/1.6 ${SANS}`, color: 'rgba(45,38,28,.62)' }}>{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MODULE TILES */}
        <section style={{ padding: '60px 24px 90px' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 40 }}>
              <div>
                <div style={{ font: `600 12px ${SANS}`, letterSpacing: 2.6, textTransform: 'uppercase', color: '#b0512f' }}>The System</div>
                <h2 style={{ font: `300 clamp(30px,4vw,46px) ${SERIF}`, margin: '14px 0 0', letterSpacing: 0.3, color: '#221c14' }}>Everything You Need to Manage Variations</h2>
              </div>
              <Link href="/intelligence" className="btn-glass" style={{ font: `600 13px ${SANS}`, letterSpacing: 0.4, color: '#221c14', padding: '13px 26px', borderRadius: 999, ...glass }}>Open Dashboard</Link>
            </div>
            <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { n: 'Module 01', t: 'Variation Orders', d: 'Complete VO lifecycle management with real-time tracking. 150+ VOs tracked across the project.', g: 'linear-gradient(150deg,#3f9d93,#0f5a54)', s: 'rgba(15,90,84,.28)', href: '/vos', img: '/hero/module-vo.jpg' },
                { n: 'Module 02', t: 'Payment Register', d: 'Advanced payment tracking with automated calculations against SAR 232M contract value.', g: 'linear-gradient(150deg,#cf8a52,#9c5a2f)', s: 'rgba(156,90,47,.28)', href: '/payments', img: '/hero/module-pay.jpg' },
                { n: 'Module 03', t: 'Analytics', d: 'Interactive charts and real-time financial insight with 24/7 live updates.', g: 'linear-gradient(150deg,#5d8595,#2e4a58)', s: 'rgba(46,74,88,.28)', href: '/intelligence', img: '/hero/module-analytics.jpg' },
                { n: 'Module 04', t: 'Forecasting', d: 'AI-assisted projections and final-account modelling to keep the project on track.', g: 'linear-gradient(150deg,#d8b06a,#a87a3c)', s: 'rgba(168,122,60,.28)', href: '/intelligence', img: '/hero/module-forecast.jpg' },
              ].map((m) => (
                <Link key={m.t} href={m.href} className="tile" style={{ position: 'relative', minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 34, borderRadius: 26, overflow: 'hidden', background: m.g, border: '1px solid rgba(255,255,255,.22)', boxShadow: `0 16px 48px ${m.s}, inset 0 1px 0 rgba(255,255,255,.35)` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.img} alt={m.t} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: m.g, opacity: 0.78, mixBlendMode: 'multiply' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 35%,rgba(10,10,12,.55) 100%)' }} />
                  <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: '60%', height: '120%', background: 'radial-gradient(circle,rgba(255,255,255,.28),transparent 60%)', filter: 'blur(30px)' }} />
                  <div style={{ position: 'relative' }}>
                    <div style={{ font: `600 11px ${SANS}`, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.8)' }}>{m.n}</div>
                    <h3 style={{ font: `400 28px ${SERIF}`, margin: '10px 0 8px', color: '#fff' }}>{m.t}</h3>
                    <p style={{ margin: '0 0 18px', maxWidth: '42ch', font: `400 14px/1.6 ${SANS}`, color: 'rgba(255,255,255,.87)' }}>{m.d}</p>
                    <span style={{ font: `600 12.5px ${SANS}`, letterSpacing: 1, textTransform: 'uppercase', color: '#fff', borderBottom: '1px solid rgba(255,255,255,.5)', paddingBottom: 3 }}>Explore →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: '0 24px 30px' }}>
          <div className="foot-pad" style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 56px 36px', borderRadius: 30, background: 'linear-gradient(150deg,rgba(40,30,20,.82),rgba(22,16,10,.88))', backdropFilter: 'blur(24px) saturate(150%)', WebkitBackdropFilter: 'blur(24px) saturate(150%)', border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 20px 60px rgba(34,24,14,.3), inset 0 1px 0 rgba(255,255,255,.16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/rsg-logo.png" alt="Red Sea Global" style={{ height: 28, width: 'auto', filter: 'brightness(0) invert(1)' }} />
                <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,.28)' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/firstfix-v2.png" alt="FirstFix" style={{ height: 22, width: 'auto', filter: 'brightness(0) invert(1)' }} />
              </div>
              <div style={{ display: 'flex', gap: 16, color: 'rgba(255,255,255,.6)', font: '600 12px sans-serif' }}>
                <span>in</span><span>▶</span><span>◎</span><span>𝕏</span><span>f</span>
              </div>
            </div>
            <div className="grid4 foot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 40, padding: '44px 0' }}>
              {[
                { h: 'The System', items: [['Dashboard', '/intelligence'], ['VO Register', '/vos'], ['Payments', '/payments']] },
                { h: 'Analytics', items: [['Dashboards', '/intelligence'], ['Forecasting', '/intelligence'], ['Reports', '/intelligence']] },
                { h: 'Project', items: [['R06‑HW2 SW Hotel 02', '/intelligence'], ['HW2 MEP Scope', '/intelligence'], ['First Fix Contracting', '/intelligence']] },
                { h: 'Quick links', items: [['Request Access', '#'], ['Support', '#'], ['Contact Us', '#']] },
              ].map((col) => (
                <div key={col.h}>
                  <div style={{ font: `600 12px ${SANS}`, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 18 }}>{col.h}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, font: `400 14px ${SANS}`, color: 'rgba(255,255,255,.78)' }}>
                    {col.items.map(([label, href]) => (
                      <Link key={label} href={href} className="lnk" style={{ color: 'rgba(255,255,255,.78)' }}>{label}</Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,.12)', font: `400 12.5px ${SANS}`, color: 'rgba(255,255,255,.5)' }}>
              <span>© 2025 VO Tracker · Mohamed Roomy Mohamed Hassan — Sr. Quantity Surveyor, FFC</span>
              <span style={{ display: 'flex', gap: 24 }}>
                <Link href="#" className="lnk" style={{ color: 'rgba(255,255,255,.5)' }}>Terms &amp; Conditions</Link>
                <Link href="#" className="lnk" style={{ color: 'rgba(255,255,255,.5)' }}>Privacy Policy</Link>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
