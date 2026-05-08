/**
 * Scene 4 — AI Advisor (18s / 540 frames)
 *
 * Shows AI chat interface. A message types in character-by-character,
 * the AI response appears line-by-line. The context panel on the right
 * populates with university cards one at a time.
 *
 * VO: "Your AI advisor researches in real time. Ask anything — compare programs,
 *      explore your chances, find funding. It thinks through your profile and
 *      turns every answer into an action."
 */
import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {BRAND} from '../constants';

const USER_MESSAGE = 'I need to find universities that match my needs and preferences';

const AI_LINES = [
  "ok, let's do this right. I need a few more things to match",
  'you properly, because "fits your needs" is really specific',
  'to your actual profile.',
  '',
  "first: what's your GPA or percentage from your bachelor's?",
  'second: do you have IELTS or any English test done?',
  "third: when are you trying to start? like September 2025?",
  'answer those and I\'ll pull you a real shortlist.',
];

const CONTEXT_UNIS = [
  {abbr: 'LSE', color: '#3B5BDB', name: 'LSE', detail: 'Rolling admissions'},
  {abbr: 'UOA', color: '#7048E8', name: 'UOA', detail: 'September 30'},
  {abbr: 'HE', color: '#2B8A3E', name: 'HERT', detail: 'July 12'},
  {abbr: 'CM', color: '#9C4221', name: 'CM', detail: 'December 12'},
];

export const Scene4AIAdvisor: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const sceneOut = interpolate(frame, [510, 540], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- User message typewriter ---
  // Typing starts at frame 40, ~60 chars / 90 frames
  const charsVisible = Math.floor(
    interpolate(frame, [40, 130], [0, USER_MESSAGE.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const typedMessage = USER_MESSAGE.slice(0, charsVisible);
  const showCursor = frame >= 40 && frame < 140;

  // User bubble fade in after typing completes
  const userBubbleOpacity = interpolate(frame, [135, 155], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- AI thinking indicator ---
  const thinkingOpacity =
    interpolate(frame, [155, 170], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    interpolate(frame, [195, 210], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // --- AI response lines appear one by one ---
  const AI_LINES_START = 210;
  const AI_LINE_INTERVAL = 28;

  // --- Context panel university cards ---
  const CTX_START = 320;
  const CTX_INTERVAL = 50;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.cream,
        opacity: sceneIn * sceneOut,
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {/* Sidebar */}
      <Sidebar frame={frame} fps={fps} />

      {/* Main chat area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: BRAND.cream,
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: 56,
            borderBottom: `1px solid ${BRAND.border}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            gap: 8,
            backgroundColor: BRAND.cream,
          }}
        >
          <span style={{fontFamily: 'Inter, sans-serif', fontSize: 13, color: BRAND.grayMid}}>Workspace</span>
          <span style={{color: BRAND.grayLight}}>/</span>
          <span style={{fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: BRAND.offBlack}}>AI Advisor</span>
        </div>

        {/* Messages */}
        <div style={{flex: 1, padding: '40px 48px', overflowY: 'hidden'}}>
          {/* Header */}
          <div style={{marginBottom: 40}}>
            <h1
              style={{
                fontFamily: '"EB Garamond", Georgia, serif',
                fontSize: 40,
                fontWeight: 400,
                color: BRAND.offBlack,
                margin: 0,
              }}
            >
              Ask <em style={{color: BRAND.rust}}>anything</em> about your applications
            </h1>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                color: BRAND.grayMid,
                margin: '6px 0 0',
              }}
            >
              Vidhya researches programs, finds professors, and turns plans into tasks.
            </p>
          </div>

          {/* Vidhya initial greeting */}
          <AdvisorMessage
            lines={["hey, I'm Vidhya. ask me anything — find a program, professors,", "or get help drafting an outreach email. I'll research live and", "turn answers into tasks in your workspace."]}
            startFrame={5}
            fps={fps}
            frame={frame}
          />

          {/* Typing input area */}
          {frame >= 35 && frame < 140 && (
            <div
              style={{
                marginTop: 32,
                padding: '14px 20px',
                backgroundColor: BRAND.cardBg,
                borderRadius: 10,
                border: `1px solid ${BRAND.border}`,
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                color: BRAND.offBlack,
                maxWidth: 640,
              }}
            >
              {typedMessage}
              {showCursor && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: 16,
                    backgroundColor: BRAND.rust,
                    marginLeft: 1,
                    verticalAlign: 'middle',
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                  }}
                />
              )}
            </div>
          )}

          {/* User bubble (after send) */}
          {frame >= 135 && (
            <div
              style={{
                marginTop: 32,
                display: 'flex',
                justifyContent: 'flex-end',
                opacity: userBubbleOpacity,
              }}
            >
              <div
                style={{
                  backgroundColor: BRAND.offBlack,
                  color: BRAND.cream,
                  borderRadius: '12px 12px 2px 12px',
                  padding: '12px 18px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  maxWidth: 480,
                }}
              >
                {USER_MESSAGE}
              </div>
            </div>
          )}

          {/* Thinking indicator */}
          {thinkingOpacity > 0.01 && (
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                gap: 5,
                opacity: thinkingOpacity,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: BRAND.grayMid,
                    opacity: 0.5 + 0.5 * Math.sin((frame - i * 8) * 0.25),
                  }}
                />
              ))}
            </div>
          )}

          {/* AI response lines */}
          {frame >= AI_LINES_START && (
            <AdvisorMessage
              lines={AI_LINES}
              startFrame={AI_LINES_START}
              fps={fps}
              frame={frame}
              lineInterval={AI_LINE_INTERVAL}
            />
          )}
        </div>

        {/* Input bar at bottom */}
        <div
          style={{
            height: 80,
            borderTop: `1px solid ${BRAND.border}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            gap: 12,
            backgroundColor: BRAND.cream,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              border: `1px solid ${BRAND.border}`,
              backgroundColor: BRAND.cardBg,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: BRAND.grayMid,
            }}
          >
            Ask about a program, draft an email, or describe what you need...
          </div>
          {/* Live research + Extended thinking pills */}
          <div
            style={{
              display: 'flex',
              gap: 8,
            }}
          >
            <Pill label="Live research" active />
            <Pill label="Extended thinking" active={false} />
          </div>
        </div>
      </div>

      {/* Context panel (right) */}
      <div
        style={{
          width: 280,
          borderLeft: `1px solid ${BRAND.border}`,
          backgroundColor: BRAND.cream,
          padding: '24px 20px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: BRAND.grayMid,
            marginBottom: 20,
          }}
        >
          CONTEXT{' '}
          <span
            style={{
              backgroundColor: BRAND.rust,
              color: BRAND.white,
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              marginLeft: 6,
            }}
          >
            {Math.min(
              4,
              Math.floor(
                interpolate(frame, [CTX_START, CTX_START + CTX_INTERVAL * 4], [0, 4], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })
              )
            )}
          </span>
        </div>

        {CONTEXT_UNIS.map((uni, i) => {
          const cardOpacity = interpolate(
            frame,
            [CTX_START + i * CTX_INTERVAL, CTX_START + i * CTX_INTERVAL + 25],
            [0, 1],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );
          const cardY = interpolate(
            frame,
            [CTX_START + i * CTX_INTERVAL, CTX_START + i * CTX_INTERVAL + 25],
            [16, 0],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );

          return (
            <div
              key={uni.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: uni.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  color: BRAND.white,
                  flexShrink: 0,
                }}
              >
                {uni.abbr}
              </div>
              <div>
                <div
                  style={{fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: BRAND.offBlack}}
                >
                  {uni.name}
                </div>
                <div style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.grayMid}}>
                  researching · {uni.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---- Sub-components ----

const Sidebar: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const enter = spring({fps, frame, config: {damping: 18}, durationInFrames: 30});
  const x = interpolate(enter, [0, 1], [-60, 0]);

  const navItems = [
    {label: 'Dashboard', icon: '⊟', active: false},
    {label: 'AI Advisor', icon: '✦', active: true, badge: true},
    {label: 'Application Board', icon: '⊞', active: false, count: 4},
    {label: 'Task Center', icon: '✓', active: false, count: 4},
    {label: 'Scholarships', icon: '⚖', active: false},
    {label: 'Profile', icon: '◯', active: false, pct: '35%'},
  ];

  return (
    <div
      style={{
        width: 230,
        height: '100%',
        backgroundColor: BRAND.cream,
        borderRight: `1px solid ${BRAND.border}`,
        padding: '20px 16px',
        boxSizing: 'border-box',
        transform: `translateX(${x}px)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: '"EB Garamond", Georgia, serif',
          fontSize: 22,
          fontWeight: 400,
          color: BRAND.offBlack,
          marginBottom: 24,
          padding: '4px 8px',
        }}
      >
        ✦ Vidhya
      </div>

      {/* Search */}
      <div
        style={{
          height: 36,
          borderRadius: 8,
          border: `1px solid ${BRAND.border}`,
          backgroundColor: BRAND.cardBg,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span style={{fontSize: 12, color: BRAND.grayMid}}>⌕</span>
        <span style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.grayMid}}>
          Quick search...
        </span>
      </div>

      <div style={{fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: BRAND.grayMid, padding: '4px 8px', marginBottom: 4}}>WORKSPACE</div>

      {navItems.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 10px',
            borderRadius: 8,
            backgroundColor: item.active ? BRAND.offBlack : 'transparent',
            cursor: 'pointer',
          }}
        >
          <span style={{fontSize: 13, color: item.active ? BRAND.cream : BRAND.grayMid}}>{item.icon}</span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: item.active ? BRAND.cream : BRAND.offBlack,
              flex: 1,
              fontWeight: item.active ? 500 : 400,
            }}
          >
            {item.label}
          </span>
          {item.badge && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: BRAND.rust,
              }}
            />
          )}
          {item.count && (
            <span style={{fontFamily: 'Inter, sans-serif', fontSize: 11, color: BRAND.grayMid}}>
              {item.count}
            </span>
          )}
          {item.pct && (
            <span style={{fontFamily: 'Inter, sans-serif', fontSize: 11, color: BRAND.rust}}>
              {item.pct}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const AdvisorMessage: React.FC<{
  lines: string[];
  startFrame: number;
  fps: number;
  frame: number;
  lineInterval?: number;
}> = ({lines, startFrame, fps, frame, lineInterval = 20}) => {
  return (
    <div style={{display: 'flex', gap: 14, marginTop: 24}}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: BRAND.rust,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          color: BRAND.white,
          flexShrink: 0,
        }}
      >
        S
      </div>
      <div style={{flex: 1}}>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: BRAND.grayMid,
            marginBottom: 8,
          }}
        >
          VIDHYA ADVISOR
        </div>
        {lines.map((line, i) => {
          const lineStart = startFrame + i * lineInterval;
          const lineOpacity = interpolate(frame, [lineStart, lineStart + 18], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const lineY = interpolate(frame, [lineStart, lineStart + 18], [8, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          if (frame < lineStart) return null;
          return (
            <div
              key={i}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                color: BRAND.offBlack,
                lineHeight: 1.7,
                opacity: lineOpacity,
                transform: `translateY(${lineY}px)`,
                minHeight: line === '' ? 12 : undefined,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Pill: React.FC<{label: string; active: boolean}> = ({label, active}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 20,
      border: `1px solid ${active ? BRAND.rust : BRAND.border}`,
      backgroundColor: active ? 'rgba(192,98,58,0.08)' : 'transparent',
      fontFamily: 'Inter, sans-serif',
      fontSize: 12,
      color: active ? BRAND.rust : BRAND.grayMid,
    }}
  >
    {active && <span style={{fontSize: 8}}>●</span>}
    {label}
  </div>
);
