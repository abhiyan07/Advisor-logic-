/**
 * Scene 4 — AI Advisor (18s / 540 frames)
 *
 * Shows the real AI Advisor screenshots with animated overlays.
 * Phase 1 (0–240): advisor-home screenshot with animated prompt chips pulsing
 * Phase 2 (240–540): advisor-chat screenshot with a highlight sweep over the AI response
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

const PROMPTS = [
  "Research CMU's MS in Computer Science program",
  'Find Stanford CS professors working on multimodal AI',
  'Find scholarships I qualify for as a Nepali CS student',
  'Compare CMU, Stanford, and UIUC for Computer Science',
];

const CONTEXT_UNIS = [
  {abbr: 'L', color: '#3B5BDB', name: 'LSE', detail: 'Rolling admissions'},
  {abbr: 'B', color: '#E8952A', name: 'BANG', detail: 'June 30'},
  {abbr: 'U', color: '#7048E8', name: 'UOA', detail: 'September 30'},
  {abbr: 'H', color: '#2B8A3E', name: 'HERT', detail: 'July 12'},
];

export const Scene4AIAdvisor: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const sceneOut = interpolate(frame, [510, 540], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase transition: home → chat at frame 240
  const PHASE_SWITCH = 240;
  const homeOpacity =
    interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'}) *
    interpolate(frame, [PHASE_SWITCH - 20, PHASE_SWITCH], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const chatOpacity = interpolate(frame, [PHASE_SWITCH, PHASE_SWITCH + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtle ken burns on both screens
  const kenBurnsHome = interpolate(frame, [0, PHASE_SWITCH], [1, 1.04], {
    extrapolateRight: 'clamp',
  });
  const kenBurnsChat = interpolate(frame, [PHASE_SWITCH, 540], [1, 1.04], {
    extrapolateRight: 'clamp',
  });

  // VO label: appears at frame 30, exits at frame 220
  const labelIn = interpolate(frame, [30, 55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const labelOut = interpolate(frame, [190, 215], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // "Research live" badge — phase 2
  const badgeOpacity = interpolate(frame, [PHASE_SWITCH + 30, PHASE_SWITCH + 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Context panel cards animate in during phase 1
  const CTX_START = 60;
  const CTX_INTERVAL = 40;

  // Prompt chip highlight — cycles through all 4 prompts
  const activePrompt = Math.floor(
    interpolate(frame, [20, 220], [0, 4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  ) % 4;

  // Phase 2: highlight sweep across AI response text
  const sweepProgress = interpolate(frame, [PHASE_SWITCH + 40, PHASE_SWITCH + 200], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.darkBg,
        opacity: sceneIn * sceneOut,
      }}
    >
      {/* ══ PHASE 1: Advisor home screenshot ══ */}
      <AbsoluteFill style={{opacity: homeOpacity}}>
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
          <Img
            src={staticFile('screenshots/04-advisor-home.png')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              transform: `scale(${kenBurnsHome})`,
              transformOrigin: 'center center',
            }}
          />
        </div>

        {/* Subtle dark vignette so overlays read clearly */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(26,23,20,0.25) 100%)',
          }}
        />

        {/* Animated prompt chip highlight overlay */}
        <div
          style={{
            position: 'absolute',
            // These pixel coords map to where the 4 prompt chips sit in the screenshot
            // Approximate position — adjust if screenshot dimensions differ
            top: '42%',
            left: '18%',
            width: '62%',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            pointerEvents: 'none',
          }}
        >
          {PROMPTS.map((prompt, i) => {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const isActive = i === activePrompt;
            const chipOpacity = interpolate(
              frame,
              [20 + i * 12, 40 + i * 12],
              [0, 1],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
            );
            return (
              <div
                key={prompt}
                style={{
                  display: i % 2 === 0 ? 'flex' : 'none',
                  gap: 10,
                }}
              >
                {[i, i + 1].filter((idx) => idx < PROMPTS.length).map((idx) => {
                  const chipActive = idx === activePrompt;
                  const chipFade = interpolate(
                    frame,
                    [20 + idx * 12, 40 + idx * 12],
                    [0, 1],
                    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
                  );
                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: `1px solid ${chipActive ? BRAND.rust : 'rgba(212,207,200,0.5)'}`,
                        backgroundColor: chipActive
                          ? 'rgba(192,98,58,0.12)'
                          : 'rgba(245,240,234,0.06)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 12,
                        color: chipActive ? BRAND.rust : 'rgba(42,36,32,0.7)',
                        opacity: chipFade,
                        transition: 'border-color 0.3s, background-color 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span style={{opacity: 0.5, fontSize: 10}}>✦</span>
                      {PROMPTS[idx]}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Context panel — animate university cards in */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '1%',
            width: '15%',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {CONTEXT_UNIS.map((uni, i) => {
            const cardOpacity = interpolate(
              frame,
              [CTX_START + i * CTX_INTERVAL, CTX_START + i * CTX_INTERVAL + 20],
              [0, 1],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
            );
            const cardY = interpolate(
              frame,
              [CTX_START + i * CTX_INTERVAL, CTX_START + i * CTX_INTERVAL + 20],
              [12, 0],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
            );
            return (
              <div
                key={uni.name}
                style={{
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(245,240,234,0.92)',
                  borderRadius: 8,
                  padding: '6px 10px',
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 5,
                    backgroundColor: uni.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {uni.abbr}
                </div>
                <div>
                  <div style={{fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: BRAND.offBlack}}>{uni.name}</div>
                  <div style={{fontFamily: 'Inter, sans-serif', fontSize: 9, color: BRAND.grayMid}}>researching · {uni.detail}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Phase 1 label */}
        <BottomLabel
          text="Live research · Extended thinking"
          opacity={labelIn * labelOut}
        />
      </AbsoluteFill>

      {/* ══ PHASE 2: Advisor chat screenshot ══ */}
      <AbsoluteFill style={{opacity: chatOpacity}}>
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
          <Img
            src={staticFile('screenshots/05-advisor-chat.png')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              transform: `scale(${kenBurnsChat})`,
              transformOrigin: 'center center',
            }}
          />
        </div>

        {/* Highlight sweep — a warm amber wash that sweeps left→right over the AI response */}
        <div
          style={{
            position: 'absolute',
            // Approx bounds of the AI response text block in the screenshot
            top: '28%',
            left: '18%',
            width: `${sweepProgress * 62}%`,
            height: '45%',
            background: 'linear-gradient(to right, rgba(192,98,58,0.08) 0%, rgba(192,98,58,0.04) 80%, transparent 100%)',
            borderRadius: 8,
            pointerEvents: 'none',
            transition: 'width 0.1s linear',
          }}
        />

        {/* "Researching live" badge */}
        <div
          style={{
            position: 'absolute',
            top: 80,
            right: 320,
            opacity: badgeOpacity,
          }}
        >
          <LiveBadge />
        </div>

        {/* Phase 2 label */}
        <BottomLabel
          text="Turns every answer into an action"
          opacity={
            interpolate(frame, [PHASE_SWITCH + 50, PHASE_SWITCH + 75], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }) * sceneOut
          }
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BottomLabel: React.FC<{text: string; opacity: number}> = ({text, opacity}) => (
  <div
    style={{
      position: 'absolute',
      bottom: 44,
      left: '50%',
      transform: 'translateX(-50%)',
      opacity,
      backgroundColor: 'rgba(26,23,20,0.78)',
      borderRadius: 20,
      padding: '8px 22px',
      fontFamily: 'Inter, sans-serif',
      fontSize: 14,
      color: BRAND.cream,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);

const LiveBadge: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      backgroundColor: 'rgba(192,98,58,0.95)',
      borderRadius: 20,
      padding: '6px 14px',
      boxShadow: '0 4px 16px rgba(192,98,58,0.40)',
    }}
  >
    <div
      style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: '#fff',
      }}
    />
    <span
      style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fontWeight: 600,
        color: '#fff',
        letterSpacing: '0.03em',
      }}
    >
      Researching live
    </span>
  </div>
);
