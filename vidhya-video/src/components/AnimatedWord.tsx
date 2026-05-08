import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

interface AnimatedWordProps {
  text: string;
  startFrame: number;
  exitFrame?: number;
  style?: React.CSSProperties;
  color?: string;
  italic?: boolean;
}

export const AnimatedWord: React.FC<AnimatedWordProps> = ({
  text,
  startFrame,
  exitFrame,
  style,
  color = '#FFFFFF',
  italic = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enterProgress = spring({
    fps,
    frame: frame - startFrame,
    config: {damping: 14, stiffness: 100, mass: 0.8},
    durationInFrames: 25,
  });

  const opacity = interpolate(enterProgress, [0, 1], [0, 1]);
  const translateY = interpolate(enterProgress, [0, 1], [24, 0]);

  const exitOpacity =
    exitFrame !== undefined
      ? interpolate(frame, [exitFrame, exitFrame + 20], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;

  if (frame < startFrame) return null;

  return (
    <span
      style={{
        display: 'inline-block',
        opacity: opacity * exitOpacity,
        transform: `translateY(${translateY}px)`,
        color,
        fontStyle: italic ? 'italic' : 'normal',
        ...style,
      }}
    >
      {text}
    </span>
  );
};
