import React from 'react';
import {AbsoluteFill, Series} from 'remotion';
import {SCENE_DURATIONS} from './constants';
import {Scene1Hook} from './scenes/Scene1Hook';
import {Scene2Reveal} from './scenes/Scene2Reveal';
import {Scene3Onboarding} from './scenes/Scene3Onboarding';
import {Scene4AIAdvisor} from './scenes/Scene4AIAdvisor';
import {Scene5AppBoard} from './scenes/Scene5AppBoard';
import {Scene6UniversityDetail} from './scenes/Scene6UniversityDetail';
import {Scene7Scholarships} from './scenes/Scene7Scholarships';
import {Scene8EndCard} from './scenes/Scene8EndCard';

export const VidhyaVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#1A1714'}}>
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.hook}>
          <Scene1Hook />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.reveal}>
          <Scene2Reveal />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.onboarding}>
          <Scene3Onboarding />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.advisor}>
          <Scene4AIAdvisor />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.appBoard}>
          <Scene5AppBoard />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.university}>
          <Scene6UniversityDetail />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.scholarships}>
          <Scene7Scholarships />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE_DURATIONS.endCard}>
          <Scene8EndCard />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
