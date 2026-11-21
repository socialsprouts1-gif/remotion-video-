import React from 'react';
import {wordAt} from '../config';
import {Burst, Word} from '../components/Burst';

const w = (s: string) => wordAt('outro', 0, s);

export const Outro: React.FC = () => {
  const words: Word[] = [
    {g: 0, t: w('yaad'), text: 'Yaad rakho,', look: 'serif', y: 0, size: 150},
    {g: 1, t: w('marketing'), text: 'Marketing', y: -170, size: 140, from: 'left'},
    {g: 1, t: w('kismat'), text: 'kismat', look: 'strike', y: 0, size: 160},
    {g: 1, t: w('nahi'), text: 'nahi,', y: 165, size: 120, from: 'right'},
    {g: 2, t: w('ek'), text: 'ek', look: 'serif', y: -190, size: 130, from: 'top'},
    {g: 2, t: w('system'), text: 'SYSTEM', look: 'lime', y: 10, size: 230, from: 'flip'},
    {g: 2, t: w('hai.'), text: 'hai.', look: 'pill', y: 215, size: 100},
  ];
  return <Burst words={words} />;
};
