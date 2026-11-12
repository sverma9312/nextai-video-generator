import React from 'react';
import { Composition, Still, registerRoot } from 'remotion';
import { MainComposition } from './Composition';
import type { VideoCompositionProps } from './types';
import {
  Option1Velocity,
  Option2Editorial,
  Option3Prism,
  Option4Minimalist,
} from '../branding/Avatars';

const defaultTestProps: VideoCompositionProps = {
  story: {
    id: 'deepmind-alphagenome-2',
    headline: 'AlphaGenome 2 predicts DNA variant effects in individual cell types',
    category: 'Models',
    sourceName: 'Google DeepMind',
    sourceUrl: 'https://deepmind.google/blog',
    imageUrl: 'https://lh3.googleusercontent.com/VPOhADdGu1T7kK_gWBiGzyVawQbKCjpL3-B0L0wxpYCyr8cHxviYmo9Hghy4f1laeIo2YKwuz8E07TR9HWWk2b0EONi0uvju-8TDLHX6YWHG4dXe3w=w528-h297-n-nu-rw-lo',
    publishedAt: new Date().toISOString(),
    summary: 'Google DeepMind announced AlphaGenome 2, predicting DNA variant effects in single human cell types.',
  },
  script: {
    hook: 'Google DeepMind just unlocked a massive breakthrough in reading human DNA.',
    corePoints: [
      'AlphaGenome 2 predicts exactly how genetic variants alter gene expression inside human cell types.',
      'Trained on over one hundred million single-cell profiles across 68 tissues.',
    ],
    cta: '',
    fullSpokenText: 'Google DeepMind just unlocked a massive breakthrough in reading human DNA. Their new model, AlphaGenome 2, predicts exactly how genetic variants alter gene expression inside individual human cell types.',
    videoTitle: "DeepMind's New AI Decodes Human DNA #Shorts",
    videoDescription: 'AlphaGenome 2 decodes disease variants across 68 tissues.',
    hashtags: ['#AI', '#DeepMind', '#Shorts'],
  },
  audioSrc: '',
  words: [
    { word: 'Google', startMs: 100, endMs: 460 },
    { word: 'DeepMind', startMs: 470, endMs: 1030 },
    { word: 'just', startMs: 1040, endMs: 1280 },
    { word: 'unlocked', startMs: 1290, endMs: 1680 },
    { word: 'a', startMs: 1690, endMs: 1750 },
    { word: 'massive', startMs: 1760, endMs: 2200 },
    { word: 'breakthrough', startMs: 2210, endMs: 2900 },
    { word: 'in', startMs: 2910, endMs: 3100 },
    { word: 'reading', startMs: 3110, endMs: 3500 },
    { word: 'human', startMs: 3510, endMs: 3900 },
    { word: 'DNA', startMs: 3910, endMs: 4500 },
  ],
  durationInFrames: 30 * 30, // 30 seconds at 30 fps
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NextAIVideo"
        component={MainComposition}
        durationInFrames={defaultTestProps.durationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultTestProps}
      />
      <Still
        id="AvatarOption1Velocity"
        component={Option1Velocity}
        width={1024}
        height={1024}
      />
      <Still
        id="AvatarOption2Editorial"
        component={Option2Editorial}
        width={1024}
        height={1024}
      />
      <Still
        id="AvatarOption3Prism"
        component={Option3Prism}
        width={1024}
        height={1024}
      />
      <Still
        id="AvatarOption4Minimalist"
        component={Option4Minimalist}
        width={1024}
        height={1024}
      />
    </>
  );
};

registerRoot(RemotionRoot);
