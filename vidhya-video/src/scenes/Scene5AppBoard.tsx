/**
 * Scene 5 — Application Board (11s / 330 frames)
 *
 * Kanban board fades in. Camera pans left→right across the columns.
 * One card animates from "Preparing" to "Applied" (drag effect).
 *
 * VO: "Every university you're tracking, organized in one board.
 *      See exactly where you stand — from researching to got offer."
 */
import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {BRAND} from '../constants';

const COLUMNS = [
  {
    label: 'Researching',
    dot: BRAND.rust,
    count: 2,
    cards: [
      {name: 'London School of Economics', sub: 'London, UK', program: 'MSc in Psychology of Economic Life', date: 'Rolling admissions', color: '#3B5BDB'},
      {name: 'University of Hertfordshire', sub: 'Hatfield, UK', program: 'MSc in Business Psychology', date: 'July 12', color: '#2B8A3E'},
    ],
  },
  {
    label: 'Preparing',
    dot: '#E8952A',
    count: 1,
    cards: [
      {name: 'University of Adelaide', sub: 'Adelaide, SA, Australia', program: 'Master of Psychology (Business and Organisational)', date: 'September 30', color: '#7048E8'},
    ],
  },
  {
    label: 'Applied',
    dot: '#3B82F6',
    count: 1,
    cards: [
      {name: 'Carnegie Mellon', sub: '', program: 'Computer Science', date: 'December 12', color: '#9C4221'},
    ],
  },
  {
    label: 'Got Offer',
    dot: '#22C55E',
    count: 0,
    cards: [],
  },
];

export const Scene5AppBoard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const sceneOut = interpolate(frame, [300, 330], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pan left→right: translateX 0 → -180px over frames 30→180
  const panX = interpolate(frame, [30, 200], [0, -200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Board scale: slight zoom in
  const boardScale = interpolate(frame, [0, 200], [0.96, 1.02], {
    extrapolateRight: 'clamp',
  });

  // Overlay text enters at frame 220
  const overlayOpacity = interpolate(frame, [220, 250], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.cream,
        opacity: sceneIn * sceneOut,
        overflow: 'hidden',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          backgroundColor: BRAND.cream,
          borderBottom: `1px solid ${BRAND.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          gap: 8,
          zIndex: 10,
        }}
      >
        <span style={{fontFamily: 'Inter, sans-serif', fontSize: 13, color: BRAND.grayMid}}>Workspace</span>
        <span style={{color: BRAND.grayLight}}>/</span>
        <span style={{fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: BRAND.offBlack}}>Application Board</span>
      </div>

      {/* Scrolling kanban */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          bottom: 0,
          left: 0,
          right: 0,
          padding: '32px',
          boxSizing: 'border-box',
        }}
      >
        {/* Page header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <h2
              style={{
                fontFamily: '"EB Garamond", Georgia, serif',
                fontSize: 38,
                fontWeight: 400,
                color: BRAND.offBlack,
                margin: 0,
              }}
            >
              Application <em style={{fontStyle: 'italic', color: BRAND.offBlack}}>board</em>
            </h2>
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                color: BRAND.grayMid,
                border: `1px solid ${BRAND.border}`,
                borderRadius: 20,
                padding: '3px 12px',
              }}
            >
              4 universities
            </div>
          </div>
          <div style={{display: 'flex', gap: 10}}>
            <ActionBtn label="Compare universities" />
            <ActionBtn label="+ Add university" primary />
          </div>
        </div>

        {/* Kanban columns */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            transform: `translateX(${panX}px) scale(${boardScale})`,
            transformOrigin: 'left top',
            height: 'calc(100% - 80px)',
          }}
        >
          {COLUMNS.map((col, colIdx) => (
            <KanbanColumn
              key={col.label}
              col={col}
              frame={frame}
              fps={fps}
              colIdx={colIdx}
            />
          ))}
        </div>
      </div>

      {/* Bottom overlay label */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: overlayOpacity * sceneOut,
          backgroundColor: 'rgba(26,23,20,0.80)',
          borderRadius: 20,
          padding: '8px 22px',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: BRAND.cream,
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}
      >
        4 universities · All in one place
      </div>
    </AbsoluteFill>
  );
};

const KanbanColumn: React.FC<{
  col: (typeof COLUMNS)[0];
  frame: number;
  fps: number;
  colIdx: number;
}> = ({col, frame, fps, colIdx}) => {
  const enter = spring({
    fps,
    frame: frame - colIdx * 12,
    config: {damping: 16, stiffness: 80},
    durationInFrames: 35,
  });
  const y = interpolate(enter, [0, 1], [40, 0]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width: 300,
        minWidth: 300,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: col.dot,
          }}
        />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            color: BRAND.offBlack,
          }}
        >
          {col.label}
        </span>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: BRAND.grayMid,
            marginLeft: 2,
          }}
        >
          {col.count}
        </span>
      </div>

      {/* Cards */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        {col.cards.map((card, cardIdx) => (
          <UniversityCard key={card.name} card={card} frame={frame} fps={fps} enterDelay={colIdx * 12 + cardIdx * 10} />
        ))}
        {col.cards.length === 0 && (
          <div
            style={{
              border: `2px dashed ${BRAND.grayLight}`,
              borderRadius: 12,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: BRAND.grayLight,
            }}
          >
            Drop a university here
          </div>
        )}
      </div>
    </div>
  );
};

const UniversityCard: React.FC<{
  card: {name: string; sub: string; program: string; date: string; color: string};
  frame: number;
  fps: number;
  enterDelay: number;
}> = ({card, frame, fps, enterDelay}) => {
  const enter = spring({
    fps,
    frame: frame - enterDelay,
    config: {damping: 16, stiffness: 80},
    durationInFrames: 30,
  });
  const y = interpolate(enter, [0, 1], [20, 0]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <div
      style={{
        backgroundColor: BRAND.white,
        borderRadius: 12,
        padding: '18px 18px 14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: `1px solid ${BRAND.border}`,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10}}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: card.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: BRAND.white,
            flexShrink: 0,
          }}
        >
          {card.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: BRAND.offBlack, lineHeight: 1.3}}>
            {card.name}
          </div>
          {card.sub && (
            <div style={{fontFamily: 'Inter, sans-serif', fontSize: 11, color: BRAND.grayMid}}>
              {card.sub}
            </div>
          )}
        </div>
      </div>
      <div style={{fontFamily: '"EB Garamond", Georgia, serif', fontSize: 14, fontStyle: 'italic', color: BRAND.grayMid, marginBottom: 10}}>
        {card.program}
      </div>
      <div
        style={{
          height: 3,
          backgroundColor: BRAND.grayLight,
          borderRadius: 2,
          marginBottom: 10,
          overflow: 'hidden',
        }}
      >
        <div style={{width: '30%', height: '100%', backgroundColor: BRAND.rust, borderRadius: 2}} />
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
        <span style={{fontSize: 11, color: BRAND.grayMid}}>📅</span>
        <span style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.grayMid}}>{card.date}</span>
      </div>
    </div>
  );
};

const ActionBtn: React.FC<{label: string; primary?: boolean}> = ({label, primary}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 16px',
      borderRadius: 8,
      border: `1px solid ${primary ? 'transparent' : BRAND.border}`,
      backgroundColor: primary ? BRAND.rust : 'transparent',
      fontFamily: 'Inter, sans-serif',
      fontSize: 13,
      fontWeight: 500,
      color: primary ? BRAND.white : BRAND.offBlack,
      cursor: 'pointer',
    }}
  >
    {label}
  </div>
);
