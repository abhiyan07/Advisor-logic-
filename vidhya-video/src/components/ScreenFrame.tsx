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

interface ScreenFrameProps {
  src: string;
  enterFrame?: number;
  /** Initial scale — animates to 1 on enter */
  scaleFrom?: number;
  /** translateY offset at start of animation */
  slideFrom?: 'bottom' | 'top' | 'none';
  /** Subtle continuous zoom applied over the whole scene (e.g. 1.0 → 1.08) */
  kenBurnsTo?: number;
  kenBurnsDuration?: number;
  /** Vertical scroll: fraction 0–1 of the image height to pan to */
  scrollTo?: number;
  scrollStart?: number;
  scrollEnd?: number;
  borderRadius?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
}

export const ScreenFrame: React.FC<ScreenFrameProps> = ({
  src,
  enterFrame = 0,
  scaleFrom = 0.94,
  slideFrom = 'none',
  kenBurnsTo = 1.0,
  kenBurnsDuration = 0,
  scrollTo = 0,
  scrollStart = 0,
  scrollEnd = 0,
  borderRadius = 12,
  shadow = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enterProgress = spring({
    fps,
    frame: frame - enterFrame,
    config: {damping: 18, stiffness: 80},
    durationInFrames: 30,
  });

  const scale = interpolate(enterProgress, [0, 1], [scaleFrom, 1]);
  const opacity = interpolate(enterProgress, [0, 1], [0, 1]);

  const slideY =
    slideFrom === 'bottom'
      ? interpolate(enterProgress, [0, 1], [60, 0])
      : slideFrom === 'top'
      ? interpolate(enterProgress, [0, 1], [-60, 0])
      : 0;

  const kenBurnsScale =
    kenBurnsDuration > 0
      ? interpolate(frame, [0, kenBurnsDuration], [1, kenBurnsTo], {
          extrapolateRight: 'clamp',
        })
      : 1;

  const scrollYPercent =
    scrollEnd > scrollStart && frame >= scrollStart
      ? interpolate(frame, [scrollStart, scrollEnd], [0, scrollTo], {
          extrapolateRight: 'clamp',
        })
      : 0;

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(${slideY}px) scale(${scale})`,
        overflow: 'hidden',
        borderRadius,
        boxShadow: shadow
          ? '0 32px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.25)'
          : undefined,
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius,
          transform: `scale(${kenBurnsScale}) translateY(-${scrollYPercent}%)`,
          transformOrigin: 'top center',
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
