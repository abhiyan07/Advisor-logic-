/**
 * Scene 8 — End Card (8s / 240 frames)
 *
 * Clean cream background. Vidhya logo fades in. Social proof line appears.
 * Tagline "Navigate by knowing." animates in. CTA button appears.
 *
 * VO: "2,400 students are already navigating with Vidhya.
 *      Navigate by knowing."
 */
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND} from '../constants';

const AVATAR_INITIALS = ['PS', 'AN', 'RK', 'SP', 'NK'];

export const Scene8EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 25], [0, 1], {extrapolateRight: 'clamp'});

  // Logo appears
  const logoEnter = spring({fps, frame: frame - 10, config: {damping: 16, stiffness: 80}, durationInFrames: 30});
  const logoOpacity = interpolate(logoEnter, [0, 1], [0, 1]);
  const logoY = interpolate(logoEnter, [0, 1], [20, 0]);

  // Social proof appears at frame 60
  const socialEnter = spring({fps, frame: frame - 60, config: {damping: 16, stiffness: 80}, durationInFrames: 30});
  const socialOpacity = interpolate(socialEnter, [0, 1], [0, 1]);
  const socialY = interpolate(socialEnter, [0, 1], [14, 0]);

  // Tagline appears at frame 110
  const tagEnter = spring({fps, frame: frame - 110, config: {damping: 12, stiffness: 70}, durationInFrames: 40});
  const tagOpacity = interpolate(tagEnter, [0, 1], [0, 1]);
  const tagY = interpolate(tagEnter, [0, 1], [24, 0]);

  // CTA appears at frame 165
  const ctaEnter = spring({fps, frame: frame - 165, config: {damping: 16, stiffness: 90}, durationInFrames: 30});
  const ctaOpacity = interpolate(ctaEnter, [0, 1], [0, 1]);
  const ctaScale = interpolate(ctaEnter, [0, 1], [0.92, 1]);

  // Subtle dot grid (light, on cream)
  const dots = [];
  const cols = 28;
  const rows = 16;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            left: `${(c / (cols - 1)) * 100}%`,
            top: `${(r / (rows - 1)) * 100}%`,
            width: 2,
            height: 2,
            borderRadius: '50%',
            backgroundColor: 'rgba(138,133,128,0.18)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      );
    }
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.cream,
        opacity: sceneIn,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Dot grid bg */}
      <div style={{position: 'absolute', inset: 0}}>{dots}</div>

      {/* Logo */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `translateY(${logoY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Vidhya asterisk/mark — simplified */}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: BRAND.rust,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <div
              key={angle}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 16,
                height: 1.5,
                backgroundColor: BRAND.offBlack,
                transformOrigin: '0 50%',
                transform: `translate(0, -50%) rotate(${angle}deg)`,
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontFamily: '"EB Garamond", Georgia, serif',
            fontSize: 36,
            fontWeight: 400,
            color: BRAND.offBlack,
            letterSpacing: '0.01em',
          }}
        >
          Vidhya
        </span>
      </div>

      {/* Social proof */}
      <div
        style={{
          opacity: socialOpacity,
          transform: `translateY(${socialY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 52,
        }}
      >
        {/* Avatar stack */}
        <div style={{display: 'flex'}}>
          {AVATAR_INITIALS.map((init, i) => (
            <div
              key={init}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: BRAND.grayLight,
                border: `2px solid ${BRAND.cream}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                color: BRAND.offBlack,
                marginLeft: i > 0 ? -10 : 0,
                zIndex: AVATAR_INITIALS.length - i,
                position: 'relative',
              }}
            >
              {init}
            </div>
          ))}
        </div>
        <span style={{fontFamily: 'Inter, sans-serif', fontSize: 16, color: BRAND.offBlack}}>
          <strong>2,400+ students</strong> already navigating with Vidhya
        </span>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
          textAlign: 'center',
          marginBottom: 48,
        }}
      >
        <div
          style={{
            fontFamily: '"EB Garamond", Georgia, serif',
            fontSize: 96,
            fontWeight: 400,
            color: BRAND.offBlack,
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
          }}
        >
          Navigate by{' '}
          <em
            style={{
              color: BRAND.rust,
              fontStyle: 'italic',
            }}
          >
            knowing.
          </em>
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <button
          style={{
            backgroundColor: BRAND.offBlack,
            color: BRAND.cream,
            border: 'none',
            borderRadius: 10,
            padding: '16px 32px',
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            letterSpacing: '0.01em',
          }}
        >
          Get started — free →
        </button>
        <button
          style={{
            backgroundColor: 'transparent',
            color: BRAND.offBlack,
            border: `1.5px solid ${BRAND.border}`,
            borderRadius: 10,
            padding: '16px 32px',
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.01em',
          }}
        >
          See how it works
        </button>
      </div>

      {/* vidhya.com */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          opacity: ctaOpacity * 0.5,
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: BRAND.grayMid,
          letterSpacing: '0.08em',
        }}
      >
        vidhya.com
      </div>
    </AbsoluteFill>
  );
};
