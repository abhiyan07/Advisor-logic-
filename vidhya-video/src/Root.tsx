import React from 'react';
import {Composition} from 'remotion';
import {VidhyaVideo} from './VidhyaVideo';
import {FPS, WIDTH, HEIGHT, TOTAL_FRAMES} from './constants';

export const Root: React.FC = () => {
  return (
    <Composition
      id="VidhyaVideo"
      component={VidhyaVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
