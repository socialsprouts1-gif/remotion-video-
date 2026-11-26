import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Studio} from './kit';

// Camera: z = 7, fov 30 → about 512 px per world unit at z = 0; world y = 0 is the frame centre.
export const PX = 512;
export const toY = (px: number) => (960 - px) / PX; // screen px → world y
export const toX = (px: number) => (px - 540) / PX;

/** A full-frame transparent 3D layer with studio lighting. */
export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <ThreeCanvas width={1080} height={1920} camera={{position: [0, 0, 7], fov: 30}} gl={{antialias: true, alpha: true}}>
      <Studio />
      {children}
    </ThreeCanvas>
  </AbsoluteFill>
);
