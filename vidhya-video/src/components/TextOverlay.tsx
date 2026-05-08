import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND} from '../constants';

interface TextOverlayProps {
  label?: string;
  title: string;
  titleAccent?: string; // part of title to render in rust/italic
  subtitle?: string;
  enterFrame?: number;
  exitFrame?: number;
  align?: 'left' | 'center' | 'right';
  dark?: boolean; // dark pill bg vs light
}

export const TextOverlay: React.FC<TextOverlayProps> = ({
  label,
  title,
  titleAccent,
  subtitle,
  enterFrame = 0,
  exitFrame,
  align = 'left',
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = spring({
    fps,
    frame: frame - enterFrame,
    config: {damping: 16, stiffness: 90},
    durationInFrames: 30,
  });

  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const y = interpolate(enter, [0, 1], [20, 0]);

  const exitOpacity =
    exitFrame !== undefined
      ? interpolate(frame, [exitFrame, exitFrame + 20], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;

  if (frame < enterFrame) return null;

  const textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';

  return (
    <div
      style={{
        opacity: opacity * exitOpacity,
        transform: `translateY(${y}px)`,
        textAlign,
      }}
    >
      {label && (
        <div
          style={{
            display: 'inline-block',
            fontSize: 13,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            color: dark ? BRAND.cream : BRAND.rust,
            backgroundColor: dark ? 'rgba(192,98,58,0.18)' : 'rgba(192,98,58,0.10)',
            border: `1px solid ${dark ? 'rgba(192,98,58,0.4)' : 'rgba(192,98,58,0.25)'}`,
            borderRadius: 20,
            padding: '4px 14px',
            marginBottom: 14,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          fontSize: 52,
          fontFamily: '"EB Garamond", "Georgia", serif',
          fontWeight: 400,
          lineHeight: 1.15,
          color: dark ? BRAND.cream : BRAND.offBlack,
          marginBottom: subtitle ? 12 : 0,
        }}
      >
        {title}
        {titleAccent && (
          <em
            style={{
              color: BRAND.rust,
              fontStyle: 'italic',
            }}
          >
            {' '}
            {titleAccent}
          </em>
        )}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 20,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            color: dark ? 'rgba(245,240,234,0.7)' : BRAND.grayMid,
            lineHeight: 1.5,
            maxWidth: 520,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
