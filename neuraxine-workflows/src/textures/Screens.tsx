// Stills used as textures (rendered to public/tex/ by scripts/make_textures.mjs).
import React, {useState} from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFonts} from '../lib/fonts';
import {F} from '../theme';

const COND: React.CSSProperties = {fontFamily: '"Archivo", sans-serif', fontWeight: 800, fontStretch: '62%'};

/** Phone screen: the Vapi AI voice agent on a live outbound call. */
const Call: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #0B0F0C 0%, #101A12 60%, #0B0F0C 100%)', fontFamily: F.body, color: '#fff'}}>
    <div style={{position: 'absolute', top: 26, left: 56, right: 56, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 26}}>
      <span>11:04</span>
      <span style={{width: 40, height: 18, borderRadius: 5, border: '2px solid #fff'}} />
    </div>
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', fontWeight: 700, fontSize: 24}}>
        <Img src={staticFile('icons/vapi.svg')} style={{height: 26, filter: 'invert(1)'}} /> AI Voice Agent
      </div>
      <div style={{marginTop: 70, width: 210, height: 210, margin: '70px auto 0', borderRadius: 99, background: 'linear-gradient(140deg, #2B3A2E, #121814)', display: 'grid', placeItems: 'center', fontSize: 90, fontWeight: 800, color: '#B5F12A', boxShadow: '0 0 0 14px rgba(181,241,42,0.08), 0 0 0 30px rgba(181,241,42,0.04)'}}>RS</div>
      <div style={{marginTop: 40, fontWeight: 800, fontSize: 44}}>Rahul Sharma</div>
      <div style={{marginTop: 8, fontSize: 26, color: '#9AA59C'}}>Sharma Interiors · Jaipur</div>
      <div style={{marginTop: 18, fontSize: 30, fontWeight: 700, color: '#B5F12A'}}>● 00:42</div>
    </div>
    {/* live transcript */}
    <div style={{position: 'absolute', left: 36, right: 36, top: 860, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 25, lineHeight: 1.3}}>
      <div style={{alignSelf: 'flex-start', maxWidth: '86%', padding: '12px 16px', borderRadius: 16, background: 'rgba(181,241,42,0.14)', color: '#E8FFC2'}}>AI: Aapke showroom ke liye leads ka system discuss karein?</div>
      <div style={{alignSelf: 'flex-end', maxWidth: '80%', padding: '12px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.08)'}}>Haan, Thursday 4 baje call karo.</div>
      <div style={{alignSelf: 'flex-start', maxWidth: '86%', padding: '12px 16px', borderRadius: 16, background: 'rgba(181,241,42,0.14)', color: '#E8FFC2'}}>AI: Booked ✓ Thursday, 4:00 PM.</div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center', gap: 60}}>
      <div style={{width: 110, height: 110, borderRadius: 99, background: 'rgba(255,255,255,0.12)'}} />
      <div style={{width: 110, height: 110, borderRadius: 99, background: '#E5484D', display: 'grid', placeItems: 'center'}}>
        <svg width={50} height={50} viewBox="0 0 24 24"><path d="M3 15c5-4 13-4 18 0l-2 3-4-1v-3c-2-.6-4-.6-6 0v3l-4 1z" fill="#fff" /></svg>
      </div>
    </div>
  </AbsoluteFill>
);

export const PHONE_SCREENS: Record<string, React.ReactNode> = {call: <Call />};

export const TexPhone: React.FC<{id: string}> = ({id}) => {
  useState(() => loadFonts());
  return <AbsoluteFill>{PHONE_SCREENS[id]}</AbsoluteFill>;
};

const ICON_PATHS: Record<string, string[]> = {
  search: ['M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13z', 'M15.5 15.5L20 20'],
  mail: ['M3 6h18v12H3z', 'M3 7l9 6 9-6'],
  phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z'],
  warn: ['M12 3L2 20h20z', 'M12 10v4', 'M12 17v.01'],
};

/** Square tile faces: lime-on-black icons, a red warning, and neutral name badges for tools without an open logo. */
export const TexSquare: React.FC<{id: string}> = ({id}) => {
  useState(() => loadFonts());
  if (id === 'apollo' || id === 'unipile')
    return (
      <AbsoluteFill style={{background: id === 'apollo' ? 'linear-gradient(160deg, #1B1D22, #0A0B0D)' : 'linear-gradient(160deg, #F7F5F0, #E4DFD5)', display: 'grid', placeItems: 'center', textAlign: 'center'}}>
        <div>
          <div style={{...COND, fontSize: id === 'apollo' ? 120 : 112, lineHeight: 1, color: id === 'apollo' ? '#F2F2F2' : '#141414', letterSpacing: '0.01em'}}>{id === 'apollo' ? 'APOLLO' : 'UNIPILE'}</div>
          <div style={{marginTop: 10, fontFamily: F.body, fontWeight: 700, fontSize: 34, letterSpacing: '0.3em', color: id === 'apollo' ? '#B5F12A' : '#169A52'}}>{id === 'apollo' ? '.IO' : 'API'}</div>
        </div>
      </AbsoluteFill>
    );
  const red = id === 'warn';
  return (
    <AbsoluteFill style={{background: red ? 'linear-gradient(160deg, #FF7A6A, #D7263D)' : 'linear-gradient(160deg, #1B211D, #070908)', display: 'grid', placeItems: 'center'}}>
      <svg width={290} height={290} viewBox="0 0 24 24">
        {(ICON_PATHS[id] ?? []).map((d, i) => (
          <path key={i} d={d} fill="none" stroke={red ? '#fff' : '#B5F12A'} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
