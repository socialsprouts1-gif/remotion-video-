import React from 'react';
import {wordAt} from '../config';
import {Burst, Word} from '../components/Burst';

const w = (s: string) => wordAt('outro', 0, s);

export const Outro: React.FC = () => {
  const words: Word[] = [
    {g: 0, t: w('aap'), text: 'Aap', look: 'serif', y: -150, size: 150},
    {g: 0, t: w('business'), text: 'business chalao.', y: 30, size: 120, from: 'right'},
    {g: 1, t: w('baaki'), text: 'Baaki kaam,', look: 'serif', y: -220, size: 120, from: 'top'},
    {g: 1, t: w(' ai '), text: 'AI', look: 'lime', y: 0, size: 330, from: 'flip'},
    {g: 1, t: w('karega'), text: 'karega.', look: 'pill', y: 230, size: 100},
  ];
  return <Burst words={words} />;
};
