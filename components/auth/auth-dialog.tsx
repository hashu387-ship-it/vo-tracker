'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { useClerk, useSignIn } from '@clerk/nextjs';

/**
 * Cream-themed welcome / sign-in dialog matching the RSG Cream landing.
 *
 * Clerk's hosted popup can't have custom buttons injected, so this is our own
 * themed chooser. It offers Google / Apple / Microsoft (Clerk OAuth), email,
 * Create account, and "Continue as guest". The actual credential entry for the
 * email + create-account paths is handed to Clerk's modal (themed to cream),
 * so verification stays robust.
 */

const SERIF = "var(--font-newsreader), 'Newsreader', serif";
const SANS = "var(--font-hanken), 'Hanken Grotesk', system-ui, sans-serif";

/** Cream appearance applied to Clerk's own modals when they open. */
const creamAppearance = {
  variables: {
    colorPrimary: '#b0512f',
    colorText: '#221c14',
    colorTextSecondary: 'rgba(45,38,28,.62)',
    colorBackground: '#faf6ee',
    colorInputBackground: 'rgba(255,255,255,.75)',
    colorInputText: '#221c14',
    borderRadius: '0.85rem',
    fontFamily: SANS,
  },
  elements: {
    card: 'shadow-2xl',
    formButtonPrimary: 'bg-[#221c14] hover:bg-[#b0512f] text-white normal-case',
    footerActionLink: 'text-[#b0512f] hover:text-[#221c14] font-semibold',
  },
} as const;

interface AuthDialogCtx {
  openAuth: () => void;
  closeAuth: () => void;
}

const Ctx = createContext<AuthDialogCtx | undefined>(undefined);

export function useAuthDialog() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuthDialog must be used within an AuthDialogProvider');
  return c;
}

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openAuth = useCallback(() => setOpen(true), []);
  const closeAuth = useCallback(() => setOpen(false), []);
  return (
    <Ctx.Provider value={{ openAuth, closeAuth }}>
      {children}
      <AuthDialog open={open} onClose={closeAuth} />
    </Ctx.Provider>
  );
}

type OAuthStrategy = 'oauth_google' | 'oauth_apple' | 'oauth_microsoft';

function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openSignIn, openSignUp } = useClerk();
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<OAuthStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const oauth = async (strategy: OAuthStrategy, label: string) => {
    if (!isLoaded || !signIn) return;
    setError(null);
    setBusy(strategy);
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-in/sso-callback',
        redirectUrlComplete: '/intelligence',
      });
    } catch {
      setBusy(null);
      setError(`${label} sign-in isn’t enabled yet — try Google or email.`);
    }
  };

  const emailContinue = () => {
    onClose();
    openSignIn({
      forceRedirectUrl: '/intelligence',
      appearance: creamAppearance,
      ...(email ? { initialValues: { emailAddress: email } } : {}),
    });
  };

  const createAccount = () => {
    onClose();
    openSignUp({ forceRedirectUrl: '/intelligence', appearance: creamAppearance });
  };

  const continueAsGuest = () => {
    if (typeof window !== 'undefined') sessionStorage.setItem('signin-prompted', '1');
    onClose();
  };

  const socialBtn: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(120,90,50,.22)',
    background: 'rgba(255,255,255,.7)',
    color: '#221c14',
    font: `600 14px ${SANS}`,
    cursor: 'pointer',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to Commercial Tracker"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        background: 'rgba(40,30,18,.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        fontFamily: SANS,
        animation: 'authFade .2s ease',
      }}
    >
      <style>{`@keyframes authFade{from{opacity:0}to{opacity:1}}@keyframes authPop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}.auth-card ::selection{background:rgba(176,81,47,.22)}`}</style>
      <div
        className="auth-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '34px 30px 26px',
          borderRadius: 26,
          background: 'radial-gradient(120% 90% at 50% -10%,#faf6ee 0%,#f3ecdd 60%,#ece0cb 100%)',
          border: '1px solid rgba(255,255,255,.7)',
          boxShadow: '0 30px 80px rgba(60,40,20,.32), inset 0 1px 0 rgba(255,255,255,.85)',
          color: '#221c14',
          animation: 'authPop .26s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        {/* close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: '1px solid rgba(120,90,50,.18)',
            background: 'rgba(255,255,255,.6)',
            color: '#6b5a44',
            font: '500 18px/1 system-ui',
            cursor: 'pointer',
          }}
        >
          ×
        </button>

        {/* logos */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rsg-logo.png" alt="Red Sea Global" style={{ height: 30, width: 'auto', objectFit: 'contain' }} />
          <span style={{ width: 1, height: 26, background: 'rgba(120,90,50,.3)' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/firstfix-v2.png" alt="First Fix" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
        </div>

        <h2 style={{ margin: '0 0 6px', textAlign: 'center', font: `300 26px ${SERIF}`, letterSpacing: 0.3 }}>
          Sign in to Commercial Tracker
        </h2>
        <p style={{ margin: '0 0 22px', textAlign: 'center', font: `400 14px/1.5 ${SANS}`, color: 'rgba(45,38,28,.6)' }}>
          Welcome back — sign in, create an account, or continue as a guest.
        </p>

        {error && (
          <div
            style={{
              margin: '0 0 14px',
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(176,81,47,.12)',
              border: '1px solid rgba(176,81,47,.3)',
              color: '#8a3c22',
              font: `500 13px ${SANS}`,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* social */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => oauth('oauth_google', 'Google')} disabled={!!busy} style={socialBtn}>
            <GoogleIcon /> {busy === 'oauth_google' ? 'Redirecting…' : 'Continue with Google'}
          </button>
          <button onClick={() => oauth('oauth_apple', 'Apple')} disabled={!!busy} style={socialBtn}>
            <AppleIcon /> {busy === 'oauth_apple' ? 'Redirecting…' : 'Continue with Apple'}
          </button>
          <button onClick={() => oauth('oauth_microsoft', 'Microsoft')} disabled={!!busy} style={socialBtn}>
            <MicrosoftIcon /> {busy === 'oauth_microsoft' ? 'Redirecting…' : 'Continue with Microsoft'}
          </button>
        </div>

        {/* divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
          <span style={{ flex: 1, height: 1, background: 'rgba(120,90,50,.2)' }} />
          <span style={{ font: `500 12px ${SANS}`, color: 'rgba(45,38,28,.45)' }}>or</span>
          <span style={{ flex: 1, height: 1, background: 'rgba(120,90,50,.2)' }} />
        </div>

        {/* email */}
        <label style={{ display: 'block', font: `600 11px ${SANS}`, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(45,38,28,.6)', marginBottom: 8 }}>
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && emailContinue()}
          placeholder="Enter your email address"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '13px 16px',
            borderRadius: 12,
            border: '1px solid rgba(120,90,50,.25)',
            background: 'rgba(255,255,255,.72)',
            font: `400 14px ${SANS}`,
            color: '#221c14',
            outline: 'none',
          }}
        />
        <button
          onClick={emailContinue}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '13px 16px',
            borderRadius: 12,
            border: 'none',
            background: '#221c14',
            color: '#fff',
            font: `600 14px ${SANS}`,
            cursor: 'pointer',
            boxShadow: '0 8px 22px rgba(34,28,20,.25)',
          }}
        >
          Continue with email
        </button>

        {/* create account */}
        <button
          onClick={createAccount}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '13px 16px',
            borderRadius: 12,
            border: '1px solid rgba(176,81,47,.4)',
            background: 'rgba(176,81,47,.08)',
            color: '#b0512f',
            font: `600 14px ${SANS}`,
            cursor: 'pointer',
          }}
        >
          Create an account
        </button>

        {/* guest */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 12px' }}>
          <span style={{ flex: 1, height: 1, background: 'rgba(120,90,50,.18)' }} />
        </div>
        <button
          onClick={continueAsGuest}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px dashed rgba(120,90,50,.35)',
            background: 'transparent',
            color: '#5b4a36',
            font: `600 13.5px ${SANS}`,
            cursor: 'pointer',
          }}
        >
          Continue as guest →
        </button>
        <p style={{ margin: '8px 0 0', textAlign: 'center', font: `400 11.5px ${SANS}`, color: 'rgba(45,38,28,.45)' }}>
          Guests can browse the register in read-only mode.
        </p>

        <p style={{ margin: '18px 0 0', textAlign: 'center', font: `500 11px ${SANS}`, letterSpacing: 0.4, color: 'rgba(45,38,28,.4)' }}>
          Secured by Clerk
        </p>
      </div>
    </div>
  );
}

/* ---- brand icons (inline, no deps) ---- */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 34.9 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.6 35.5 44 30.1 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="#221c14">
      <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.9-3.1-.8-1.6 0-3 .9-3.8 2.4-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.6-3.7zM14.3 5.9c.6-.8 1.1-1.9.9-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.7-1.3z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 23 23" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M12 1h10v10H12z" />
      <path fill="#00A4EF" d="M1 12h10v10H1z" />
      <path fill="#FFB900" d="M12 12h10v10H12z" />
    </svg>
  );
}
