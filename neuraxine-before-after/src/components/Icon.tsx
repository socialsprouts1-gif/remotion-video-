import React from 'react';
import {Img, staticFile} from 'remotion';

/** Colour emoji-style icon from public/icons (PNG), so renders never depend on a system emoji font. */
export const Icon: React.FC<{name: string; size?: number; style?: React.CSSProperties}> = ({name, size = 40, style}) => (
  <Img
    src={staticFile(`icons/${name}.${name === 'whatsapp-icon' ? 'svg' : 'png'}`)}
    style={{width: size, height: size, objectFit: 'contain', flexShrink: 0, ...style}}
  />
);
