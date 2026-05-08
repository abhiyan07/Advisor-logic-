import React from 'react';
import {Composition} from 'remotion';
import {VidhyaVideo} from './VidhyaVideo';
import {FPS, WIDTH, HEIGHT, TOTAL_FRAMES} from './constants';

export const Root: React.FC = () => {
  return (
    <>
      {/* Main export — captions on, no audio (add voiceover.mp3 then flip withVoiceover) */}
      <Composition
        id="VidhyaVideo"
        component={VidhyaVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{withVoiceover: false, withCaptions: true}}
      />

      {/* Silent preview — captions off, easier to review animations */}
      <Composition
        id="VidhyaVideo-NoCaption"
        component={VidhyaVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{withVoiceover: false, withCaptions: false}}
      />
    </>
  );
};
