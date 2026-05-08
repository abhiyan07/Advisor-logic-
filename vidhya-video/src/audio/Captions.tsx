import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {BRAND} from '../constants';
import {CAPTIONS} from './captions';

interface CaptionsProps {
  enabled?: boolean;
}

export const Captions: React.FC<CaptionsProps> = ({enabled = true}) => {
  const frame = useCurrentFrame();
  if (!enabled) return null;

  const activeCue = CAPTIONS.find(
    (cue) => frame >= cue.startFrame && frame <= cue.endFrame
  );

  if (!activeCue) return null;

  const fadeIn = interpolate(frame, [activeCue.startFrame, activeCue.startFrame + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [activeCue.endFrame - 8, activeCue.endFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const words = activeCue.text.split(' ');

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 56,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: fadeIn * fadeOut,
        maxWidth: 900,
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {/* Text shadow backdrop for readability on any background */}
      <div
        style={{
          display: 'inline',
          fontFamily: '"EB Garamond", Georgia, serif',
          fontSize: 36,
          fontWeight: 400,
          lineHeight: 1.3,
          letterSpacing: '0.01em',
          color: activeCue.accent ? BRAND.rust : BRAND.cream,
          textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.80)',
          padding: '0 4px',
        }}
      >
        {activeCue.text}
      </div>

      {/* Underline accent for rust cues */}
      {activeCue.accent && (
        <div
          style={{
            height: 2,
            backgroundColor: BRAND.rust,
            borderRadius: 1,
            marginTop: 4,
            width: `${fadeIn * 100}%`,
            marginLeft: 'auto',
            marginRight: 'auto',
            opacity: 0.7,
          }}
        />
      )}
    </div>
  );
};
