import React from 'react';
import {wordAt} from '../config';
import {Burst, Word} from '../components/Burst';

const w0 = (s: string) => wordAt('hook', 0, s);
const w1 = (s: string) => wordAt('hook', 1, s);

export const Hook: React.FC = () => {
  const lastProblem = w1('hai,') - 0.35; // second "Problem" in line 2
  const words: Word[] = [
    {g: 0, t: w0('aapka'), text: 'Aapka', y: -170, size: 120, from: 'left'},
    {g: 0, t: w0('product'), text: 'product', look: 'serif', y: 0, size: 170},
    {g: 0, t: w0('accha'), text: 'accha hai…', y: 170, size: 120, from: 'right'},
    {g: 1, t: w0('phir'), text: 'phir bhi', y: -190, size: 110, from: 'top'},
    {g: 1, t: w0('sales'), text: 'SALES', look: 'red', y: 0, size: 250},
    {g: 1, t: w0('nahi'), text: 'nahi aa rahi?', look: 'pill', y: 200, size: 84, from: 'flip'},
    {g: 2, t: w1('problem'), text: 'Problem', y: -170, size: 130, from: 'top'},
    {g: 2, t: w1('product'), text: 'product mein', look: 'strike', y: 0, size: 120, from: 'left'},
    {g: 2, t: w1('nahi'), text: 'nahi hai.', y: 165, size: 120, from: 'right'},
    {g: 3, t: lastProblem, text: 'Problem hai…', look: 'serif', y: -200, size: 120},
    {g: 3, t: w1('marketing'), text: 'MARKETING', look: 'lime', y: 10, size: 190, from: 'flip'},
    {g: 3, t: w1('mein.') , text: 'mein.', look: 'pill', y: 200, size: 90},
  ];
  return <Burst words={words} />;
};
