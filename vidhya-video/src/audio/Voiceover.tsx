import React from 'react';
import {Audio, staticFile, useVideoConfig} from 'remotion';

interface VoiceoverProps {
  /** Set to false to mute during development */
  enabled?: boolean;
  volume?: number;
}

export const Voiceover: React.FC<VoiceoverProps> = ({enabled = true, volume = 1}) => {
  const {durationInFrames} = useVideoConfig();
  if (!enabled) return null;

  return (
    <Audio
      src={staticFile('audio/voiceover.mp3')}
      volume={volume}
      startFrom={0}
    />
  );
};
