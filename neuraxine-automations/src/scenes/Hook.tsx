import React from 'react';
import {wordAt} from '../config';
import {Burst, Word} from '../components/Burst';

const w0 = (s: string) => wordAt('hook', 0, s);
const w1 = (s: string) => wordAt('hook', 1, s);

export const Hook: React.FC = () => {
  const words: Word[] = [
    {g: 0, t: w0('raat'), text: 'Raat ke', look: 'serif', y: -190, size: 130},
    {g: 0, t: w0('12'), text: '12:00 AM', y: 10, size: 200, from: 'flip'},
    {g: 1, t: w0('ek customer'), text: 'customer ne', y: -140, size: 120, from: 'left'},
    {g: 1, t: w0('message'), text: 'message kiya…', look: 'pill', y: 50, size: 90, from: 'flip'},
    {g: 2, t: w0('aur aap'), text: 'aur aap', look: 'serif', y: -120, size: 140},
    {g: 2, t: w0('so rahe'), text: 'so rahe the.', y: 70, size: 140, from: 'right'},
    {g: 3, t: w1('subah'), text: 'Subah tak,', look: 'serif', y: -150, size: 140},
    {g: 3, t: w1('woh'), text: 'woh customer', y: 40, size: 120, from: 'left'},
    {g: 4, t: w1('competitor'), text: 'COMPETITOR', look: 'red', y: -30, size: 180, from: 'flip'},
    {g: 4, t: w1('paas'), text: 'ke paas ja chuka tha.', look: 'pill', y: 150, size: 70},
  ];
  return <Burst words={words} />;
};
