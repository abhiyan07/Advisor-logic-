/**
 * Scene 5 — Application Board (11s / 330 frames)
 *
 * Real screenshot with a slow left→right pan revealing all 4 columns.
 * Column headers pulse in sequence. A card highlight sweeps over each column.
 *
 * VO: "Every university you're tracking, organized in one board.
 *      See exactly where you stand — from researching to got offer."
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

// Column label positions as % of the screenshot width
// These approximate where each column header sits in 06-app-board.png
const COLUMN_HIGHLIGHTS = [
  {label: 'Researching', x: 19, color: BRAND.rust, startFrame: 30},
  {label: 'Preparing', x: 46, color: '#E8952A', startFrame: 80},
  {label: 'Applied', x: 72, color: '#3B82F6', startFrame: 130},
  {label: 'Got Offer', x: 90, color: '#22C55E', startFrame: 180},
];

export const Scene5AppBoard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const sceneOut = interpolate(frame, [300, 330], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pan: translateX 0% → -12% over frames 20–220 (reveals right side of board)
  const panX = interpolate(frame, [20, 220], [0, -12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtle zoom: 1.0 → 1.06
  const zoom = interpolate(frame, [0, 280], [1.0, 1.06], {
    extrapolateRight: 'clamp',
  });

  // Active column (for highlight ring)
  const activeCol = Math.min(
    3,
    Math.floor(
      interpolate(frame, [30, 220], [0, 4], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    )
  );

  // Bottom label
  const labelOpacity =
    interpolate(frame, [220, 250], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    sceneOut;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.cream,
        opacity: sceneIn * sceneOut,
        overflow: 'hidden',
      }}
    >
      {/* Screenshot with pan + zoom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile('screenshots/06-app-board.png')}
          style={{
            width: `${zoom * 115}%`, // wider than viewport to allow pan
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top left',
            transform: `translateX(${panX}%)`,
            transformOrigin: 'top left',
            display: 'block',
          }}
        />
      </div>

      {/* Column highlight rings — subtle glow above each column */}
      {COLUMN_HIGHLIGHTS.map((col, i) => {
        const isActive = i === activeCol;
        const appeared = frame >= col.startFrame;
        const ringOpacity =
          appeared
            ? interpolate(frame, [col.startFrame, col.startFrame + 20], [0, isActive ? 1 : 0.35], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 0;

        return (
          <div
            key={col.label}
            style={{
              position: 'absolute',
              top: '12%',
              left: `${col.x + panX * 0.6}%`,
              transform: 'translateX(-50%)',
              opacity: ringOpacity,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              pointerEvents: 'none',
            }}
          >
            {/* Dot indicator above column */}
            <div
              style={{
                width: isActive ? 10 : 7,
                height: isActive ? 10 : 7,
                borderRadius: '50%',
                backgroundColor: col.color,
                boxShadow: isActive ? `0 0 12px ${col.color}` : 'none',
                transition: 'all 0.3s ease',
              }}
            />
            {isActive && (
              <div
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: col.color,
                  backgroundColor: `${col.color}18`,
                  border: `1px solid ${col.color}50`,
                  borderRadius: 20,
                  padding: '3px 12px',
                  whiteSpace: 'nowrap',
                  boxShadow: `0 2px 8px ${col.color}30`,
                }}
              >
                {col.label}
              </div>
            )}
          </div>
        );
      })}

      {/* Vignette edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(245,240,234,0.15) 0%, transparent 8%, transparent 92%, rgba(245,240,234,0.40) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom label */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: labelOpacity,
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
        4 universities · All in one place
      </div>
    </AbsoluteFill>
  );
};
