/**
 * Scene 1 — Hook (9s / 270 frames)
 *
 * Dark background. Four phrases appear one at a time with upward spring entrance.
 * All fade out together before the scene ends to transition into Scene 2.
 *
 * VO: "What if you already knew... every deadline. Every professor.
 *      Every scholarship. Every single step between you and your offer letter."
 */
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND} from '../constants';
import {AnimatedWord} from '../components/AnimatedWord';

const PHRASES = [
  {text: 'every deadline.', startFrame: 30, color: BRAND.cream},
  {text: 'every professor.', startFrame: 80, color: BRAND.cream},
  {text: 'every scholarship.', startFrame: 130, color: BRAND.cream},
  {text: 'every step.', startFrame: 185, color: BRAND.rust},
];

const EXIT_START = 230;

// Small animated dot grid in the background (matches Vidhya landing page aesthetic)
const DotGrid: React.FC = () => {
  const dots = [];
  const cols = 24;
  const rows = 14;
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
            backgroundColor: 'rgba(255,255,255,0.06)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      );
    }
  }
  return <div style={{position: 'absolute', inset: 0}}>{dots}</div>;
};

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Opening fade-in of the whole scene
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});

  // Exit fade
  const exitOpacity = interpolate(frame, [EXIT_START, EXIT_START + 30], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // "What if you already knew..." question — appears first, fades before phrases
  const questionEnter = spring({
    fps,
    frame: frame - 5,
    config: {damping: 18},
    durationInFrames: 25,
  });
  const questionOpacity =
    interpolate(questionEnter, [0, 1], [0, 1]) *
    interpolate(frame, [18, 28], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const questionY = interpolate(questionEnter, [0, 1], [16, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.darkBg,
        opacity: sceneOpacity * exitOpacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <DotGrid />

      {/* Opening question */}
      <div
        style={{
          position: 'absolute',
          opacity: questionOpacity,
          transform: `translateY(${questionY}px)`,
          fontFamily: '"EB Garamond", Georgia, serif',
          fontSize: 28,
          color: 'rgba(245,240,234,0.5)',
          letterSpacing: '0.06em',
          fontStyle: 'italic',
        }}
      >
        What if you already knew...
      </div>

      {/* Stacked phrase lines */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {PHRASES.map((phrase) => (
          <AnimatedWord
            key={phrase.text}
            text={phrase.text}
            startFrame={phrase.startFrame}
            exitFrame={EXIT_START}
            color={phrase.color}
            style={{
              fontFamily: '"EB Garamond", Georgia, serif',
              fontSize: 88,
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
            }}
          />
        ))}
      </div>

      {/* Bottom line — stat */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          opacity: interpolate(frame, [200, 220], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }) * exitOpacity,
          fontFamily: 'Inter, sans-serif',
          fontSize: 16,
          color: 'rgba(245,240,234,0.35)',
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
        }}
      >
        2,400+ students already navigating with Vidhya
      </div>
    </AbsoluteFill>
  );
};
