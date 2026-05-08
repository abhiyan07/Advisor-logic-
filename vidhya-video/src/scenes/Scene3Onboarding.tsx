/**
 * Scene 3 — Onboarding (11s / 330 frames)
 *
 * Split layout: dark left panel "Let's build your shortlist" +
 * right panel showing onboarding quiz screenshot.
 * Progress bar animates. Quiz steps highlight sequentially.
 *
 * VO: "Answer four quick questions. Vidhya researches live and seeds your
 *      workspace with a personalized mix of reach, target, and safety
 *      universities — plus a starter checklist."
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

const STEPS = [
  'Where are you in your studies?',
  'What do you want to study?',
  'Where do you want to apply?',
  "What's your budget?",
];

export const Scene3Onboarding: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const sceneOut = interpolate(frame, [300, 330], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Left panel slides in
  const leftEnter = spring({fps, frame, config: {damping: 16, stiffness: 70}, durationInFrames: 35});
  const leftX = interpolate(leftEnter, [0, 1], [-80, 0]);

  // Right panel (screenshot) slides in slightly later
  const rightEnter = spring({fps, frame: frame - 10, config: {damping: 16, stiffness: 70}, durationInFrames: 35});
  const rightX = interpolate(rightEnter, [0, 1], [80, 0]);
  const rightOpacity = interpolate(rightEnter, [0, 1], [0, 1]);

  // Progress bar fills to ~25% (step 1 of 4) then animates further
  const progressWidth = interpolate(frame, [30, 120, 180, 240], [0, 25, 50, 75], {
    extrapolateRight: 'clamp',
  });

  // Active step pulses
  const activeStep = Math.min(3, Math.floor(interpolate(frame, [30, 120, 180, 240], [0, 1, 2, 3], {extrapolateRight: 'clamp'})));

  // Subtitle fade in
  const subtitleOpacity = interpolate(frame, [40, 65], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.darkBg,
        opacity: sceneIn * sceneOut,
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {/* Left panel — dark with text */}
      <div
        style={{
          width: '38%',
          height: '100%',
          backgroundColor: BRAND.darkBg,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 56px',
          transform: `translateX(${leftX}px)`,
          boxSizing: 'border-box',
        }}
      >
        {/* Top */}
        <div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: BRAND.grayMid,
              marginBottom: 40,
            }}
          >
            PLANNING MODE · ONE-TIME SETUP
          </div>
          <div
            style={{
              fontFamily: '"EB Garamond", Georgia, serif',
              fontSize: 56,
              fontWeight: 400,
              color: BRAND.cream,
              lineHeight: 1.1,
              marginBottom: 4,
            }}
          >
            Let's build your{' '}
          </div>
          <div
            style={{
              fontFamily: '"EB Garamond", Georgia, serif',
              fontSize: 56,
              fontWeight: 400,
              fontStyle: 'italic',
              color: BRAND.rust,
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            shortlist.
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              color: 'rgba(245,240,234,0.55)',
              lineHeight: 1.6,
              opacity: subtitleOpacity,
            }}
          >
            Four quick questions. We'll research live and seed your workspace with a personalized mix of reach, target, and safety universities — plus a starter checklist.
          </div>
        </div>

        {/* Step list */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 0}}>
          {STEPS.map((step, i) => {
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            const stepOpacity = interpolate(frame, [20 + i * 20, 40 + i * 20], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 0',
                  borderTop: i > 0 ? `1px solid rgba(255,255,255,0.07)` : undefined,
                  opacity: stepOpacity,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    color: isActive ? BRAND.rust : 'rgba(245,240,234,0.3)',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    minWidth: 20,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    color: isActive ? BRAND.cream : 'rgba(245,240,234,0.35)',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel — onboarding screenshot */}
      <div
        style={{
          flex: 1,
          backgroundColor: BRAND.cream,
          position: 'relative',
          overflow: 'hidden',
          transform: `translateX(${rightX}px)`,
          opacity: rightOpacity,
        }}
      >
        <Img
          src={staticFile('screenshots/02-onboarding.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
          }}
        />

        {/* Progress bar overlay at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: 'rgba(212,207,200,0.5)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressWidth}%`,
              backgroundColor: BRAND.rust,
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Label overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: interpolate(frame, [60, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * sceneOut,
            backgroundColor: 'rgba(26,23,20,0.75)',
            borderRadius: 20,
            padding: '6px 18px',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: BRAND.cream,
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
          }}
        >
          One-time setup · 60 seconds
        </div>
      </div>
    </AbsoluteFill>
  );
};
