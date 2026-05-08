/**
 * Scene 2 — Product Reveal (8s / 240 frames)
 *
 * Landing page screenshot fades in with a subtle Ken Burns zoom.
 * "Meet Vidhya" text overlays appear.
 * Dashboard widget slides in from right.
 *
 * VO: "Meet Vidhya — the AI-native platform that takes any student
 *      from first search to signed offer letter."
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
import {TextOverlay} from '../components/TextOverlay';

export const Scene2Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const sceneOut = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Gentle Ken Burns — scale 1 → 1.06 over the full scene
  const kenBurns = interpolate(frame, [0, 240], [1, 1.06], {extrapolateRight: 'clamp'});

  // Dashboard widget slides in from right at frame 90
  const widgetEnter = spring({
    fps,
    frame: frame - 90,
    config: {damping: 14, stiffness: 80},
    durationInFrames: 35,
  });
  const widgetX = interpolate(widgetEnter, [0, 1], [120, 0]);
  const widgetOpacity = interpolate(widgetEnter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.cream,
        opacity: sceneIn * sceneOut,
      }}
    >
      {/* Full-screen landing page screenshot */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile('screenshots/01-landing.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            transform: `scale(${kenBurns})`,
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* Dark gradient overlay so text is readable */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(26,23,20,0.72) 0%, rgba(26,23,20,0.40) 50%, rgba(26,23,20,0.0) 75%)',
        }}
      />

      {/* Text block — left side */}
      <div
        style={{
          position: 'absolute',
          left: 100,
          top: '50%',
          transform: 'translateY(-50%)',
          maxWidth: 600,
        }}
      >
        <TextOverlay
          label="AI-POWERED ADVISING"
          title="Meet"
          titleAccent="Vidhya."
          subtitle="The AI-native platform that takes any student from first search to signed offer letter."
          enterFrame={15}
          dark
        />
      </div>

      {/* Dashboard widget — right side */}
      <div
        style={{
          position: 'absolute',
          right: 100,
          top: '50%',
          transform: `translateY(-50%) translateX(${widgetX}px)`,
          opacity: widgetOpacity,
          width: 380,
          backgroundColor: BRAND.cream,
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        }}
      >
        {/* Widget header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4,
          }}
        >
          <div style={{fontFamily: 'Inter, sans-serif', fontSize: 11, color: BRAND.grayMid, letterSpacing: '0.08em'}}>
            APR · 30 · WED
          </div>
        </div>
        <div
          style={{
            fontFamily: '"EB Garamond", Georgia, serif',
            fontSize: 32,
            fontWeight: 400,
            color: BRAND.offBlack,
            lineHeight: 1.2,
            marginBottom: 6,
          }}
        >
          Three deadlines{' '}
          <em style={{color: BRAND.rust, fontStyle: 'italic'}}>this week.</em>
        </div>
        <div style={{fontFamily: 'Inter, sans-serif', fontSize: 13, color: BRAND.grayMid, marginBottom: 18}}>
          Two essays, one transcript request. Let's plan the order.
        </div>

        {/* Deadline rows */}
        {[
          {name: 'Oxford', task: 'Personal statement · final draft', time: 'in 3 days', urgent: true},
          {name: 'ETH Zürich', task: 'Recommender confirmations', time: 'in 6 days', urgent: false},
          {name: 'UBC Vancouver', task: 'Transcript request to school', time: 'in 9 days', urgent: false},
        ].map((item) => (
          <div
            key={item.name}
            style={{
              backgroundColor: item.urgent ? '#F5EDE6' : BRAND.cardBg,
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: BRAND.offBlack}}>
                {item.name}
              </div>
              <div style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.grayMid, marginTop: 2}}>
                {item.task}
              </div>
            </div>
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: item.urgent ? BRAND.rust : BRAND.grayMid,
                fontWeight: item.urgent ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {item.time}
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 14,
            backgroundColor: BRAND.offBlack,
            borderRadius: 8,
            textAlign: 'center',
            padding: '12px 0',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            color: BRAND.white,
            letterSpacing: '0.02em',
          }}
        >
          Plan my week
        </div>
      </div>

      {/* Bottom URL badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: interpolate(frame, [80, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * sceneOut,
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: 'rgba(245,240,234,0.5)',
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
        }}
      >
        vidhya.com
      </div>
    </AbsoluteFill>
  );
};
