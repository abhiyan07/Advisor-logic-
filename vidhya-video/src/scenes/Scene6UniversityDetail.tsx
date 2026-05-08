/**
 * Scene 6 — University Detail + Email Composer (13s / 390 frames)
 *
 * Phase 1 (0–200): CMU detail page screenshot scrolls down to reveal fit snapshot.
 *   Highlight ring pulses over the REACH badge and bullet points.
 * Phase 2 (200–390): Email composer screenshot fades in.
 *   A typewriter cursor sweeps through the email body + "Draft with AI" badge pulses.
 *
 * VO: "Drill into any school. See your fit, what to strengthen, and every
 *      requirement you need to hit. Vidhya finds professors aligned to your
 *      research — and drafts a personalized outreach email in seconds."
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

const PHASE_SWITCH = 210;

export const Scene6UniversityDetail: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const sceneOut = interpolate(frame, [360, 390], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase 1: university detail
  const detailOpacity =
    interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'}) *
    interpolate(frame, [PHASE_SWITCH - 20, PHASE_SWITCH], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  // Scroll: image scrolls down revealing fit snapshot + checklist
  // 0% at frame 0, 20% by frame 180 (brings fit snapshot into better view)
  const scrollY = interpolate(frame, [30, 180], [0, 18], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Zoom: subtle 1.0 → 1.04
  const zoom1 = interpolate(frame, [0, PHASE_SWITCH], [1.0, 1.04], {extrapolateRight: 'clamp'});

  // Fit snapshot highlight — pulses at frame 60
  const fitHighlight = spring({
    fps,
    frame: frame - 60,
    config: {damping: 12, stiffness: 80},
    durationInFrames: 30,
  });
  const fitGlow = interpolate(fitHighlight, [0, 1], [0, 1]);

  // REACH badge ring
  const reachRingOpacity = interpolate(frame, [70, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }) * interpolate(frame, [PHASE_SWITCH - 20, PHASE_SWITCH], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase 1 label
  const label1Opacity =
    interpolate(frame, [80, 105], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    interpolate(frame, [PHASE_SWITCH - 25, PHASE_SWITCH - 5], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  // Phase 2: email composer
  const emailOpacity = interpolate(frame, [PHASE_SWITCH, PHASE_SWITCH + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const zoom2 = interpolate(frame, [PHASE_SWITCH, 390], [1.0, 1.04], {extrapolateRight: 'clamp'});

  // "Draft with AI" badge pulse on email screen
  const draftBadgePulse =
    frame >= PHASE_SWITCH + 30 && frame <= PHASE_SWITCH + 120
      ? 1 + 0.06 * Math.sin((frame - PHASE_SWITCH - 30) * 0.28)
      : 1;

  // Cursor blink overlay on email body area
  const cursorVisible =
    frame >= PHASE_SWITCH + 20 &&
    frame < 370 &&
    Math.sin(frame * 0.35) > 0;

  // Phase 2 label
  const label2Opacity =
    interpolate(frame, [PHASE_SWITCH + 55, PHASE_SWITCH + 80], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }) * sceneOut;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.cream,
        opacity: sceneIn * sceneOut,
        overflow: 'hidden',
      }}
    >
      {/* ══ PHASE 1: University detail screenshot ══ */}
      <AbsoluteFill style={{opacity: detailOpacity, overflow: 'hidden'}}>
        <Img
          src={staticFile('screenshots/07-university.png')}
          style={{
            width: '100%',
            height: `${zoom1 * 115}%`,
            objectFit: 'cover',
            objectPosition: 'top center',
            transform: `translateY(-${scrollY}%)`,
            display: 'block',
          }}
        />

        {/* Highlight glow over fit snapshot area (approx top 28–60% of page) */}
        <div
          style={{
            position: 'absolute',
            top: '28%',
            left: '15%',
            right: '2%',
            height: '32%',
            borderRadius: 12,
            border: `2px solid rgba(192,98,58,${fitGlow * 0.5})`,
            boxShadow: `0 0 24px rgba(192,98,58,${fitGlow * 0.18})`,
            pointerEvents: 'none',
            opacity: fitGlow * interpolate(frame, [PHASE_SWITCH - 20, PHASE_SWITCH], [1, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            }),
          }}
        />

        {/* REACH badge callout */}
        <div
          style={{
            position: 'absolute',
            top: '29%',
            left: '51%',
            opacity: reachRingOpacity,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(192,98,58,0.92)',
              borderRadius: 20,
              padding: '5px 14px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.08em',
              boxShadow: '0 4px 16px rgba(192,98,58,0.45)',
            }}
          >
            REACH
          </div>
        </div>

        {/* Phase 1 label */}
        <BottomLabel text="Tailored fit snapshot for your profile" opacity={label1Opacity} />
      </AbsoluteFill>

      {/* ══ PHASE 2: Email composer screenshot ══ */}
      <AbsoluteFill style={{opacity: emailOpacity, overflow: 'hidden'}}>
        <Img
          src={staticFile('screenshots/09-email.png')}
          style={{
            width: '100%',
            height: `${zoom2 * 108}%`,
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
          }}
        />

        {/* "Draft with AI" badge pulse — positioned over the button in the screenshot */}
        <div
          style={{
            position: 'absolute',
            top: '23%',
            right: '4.5%',
            transform: `scale(${draftBadgePulse})`,
            transformOrigin: 'center center',
            opacity: interpolate(frame, [PHASE_SWITCH + 25, PHASE_SWITCH + 50], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <div
            style={{
              backgroundColor: BRAND.rust,
              borderRadius: 8,
              padding: '8px 16px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              boxShadow: '0 6px 20px rgba(192,98,58,0.50)',
              whiteSpace: 'nowrap',
            }}
          >
            ✦ Draft with AI
          </div>
        </div>

        {/* Blinking cursor overlay in the email body area */}
        {cursorVisible && (
          <div
            style={{
              position: 'absolute',
              top: '65%',
              left: '68%',
              width: 2,
              height: 16,
              backgroundColor: BRAND.rust,
              borderRadius: 1,
            }}
          />
        )}

        {/* Warm overlay over email body to draw focus */}
        <div
          style={{
            position: 'absolute',
            top: '35%',
            left: '67%',
            right: '3%',
            bottom: '18%',
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(192,98,58,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
            opacity: interpolate(frame, [PHASE_SWITCH + 30, PHASE_SWITCH + 60], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        />

        {/* Phase 2 label */}
        <BottomLabel
          text="Personalized using the professor's research and your background"
          opacity={label2Opacity}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BottomLabel: React.FC<{text: string; opacity: number}> = ({text, opacity}) => (
  <div
    style={{
      position: 'absolute',
      bottom: 40,
      left: '50%',
      transform: 'translateX(-50%)',
      opacity,
      backgroundColor: 'rgba(26,23,20,0.78)',
      borderRadius: 20,
      padding: '8px 22px',
      fontFamily: 'Inter, sans-serif',
      fontSize: 14,
      color: BRAND.cream,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);
