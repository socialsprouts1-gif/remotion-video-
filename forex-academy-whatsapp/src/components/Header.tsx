import React from 'react';
import {Kicker, KineticText} from './KineticText';

/** Step chip + two-line headline at the top of a scene. */
export const Header: React.FC<{chip: string; lines: string[]; start?: number}> = ({chip, lines, start = 4}) => (
  <>
    <div style={{position: 'absolute', top: 140, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <Kicker text={chip} start={start} />
    </div>
    <div style={{position: 'absolute', top: 232, left: 0, right: 0}}>
      <KineticText lines={lines} start={start + 3} stagger={3} size={94} />
    </div>
  </>
);
