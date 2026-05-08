/**
 * Scene 7 — Scholarships (12s / 360 frames)
 *
 * AI scholarship search form fades in. "Scan with AI" button pulses.
 * Three scholarship cards animate in one by one with status badges.
 *
 * VO: "Finding funding? Vidhya scans government, foundation, and university
 *      scholarships matched exactly to your profile. Track every application
 *      — never miss a deadline."
 */
import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {BRAND} from '../constants';

const SCHOLARSHIPS = [
  {
    title: 'Full tuition + stipend',
    name: 'Chevening Scholarships',
    org: 'UK Foreign, Commonwealth & Development Office',
    status: 'GATHERING DOCS',
    statusColor: '#E8952A',
    tags: ['tuition+living+travel', 'masters', 'Nepal'],
    date: 'November',
    desc: 'Global scholarship program offered by the UK government to develop future leaders. Covers a one-year Master\'s degree at any UK university.',
  },
  {
    title: 'Full tuition + stipend',
    name: 'Australia Awards Scholarships',
    org: 'Department of Foreign Affairs and Trade (DFAT)',
    status: 'SUBMITTED',
    statusColor: '#3B82F6',
    tags: ['tuition+living+travel', 'masters', 'Nepal'],
    date: 'April',
    desc: 'Long-term awards offered by the Australian Government for professionals from Nepal to study at participating Australian universities.',
  },
  {
    title: 'Up to £18,000',
    name: 'LSE Margaret Bennett Scholarship',
    org: 'London School of Economics and Political Science',
    status: 'TRACKING',
    statusColor: '#6366F1',
    tags: ['partial', 'masters', 'Nepal', 'Global South'],
    date: 'April',
    desc: 'This scholarship supports female students from Africa and other developing regions to study at the LSE.',
  },
];

export const Scene7Scholarships: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const sceneOut = interpolate(frame, [330, 360], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scan button pulse (frames 60-120)
  const scanPulse =
    frame >= 60 && frame <= 120
      ? 1 + 0.04 * Math.sin((frame - 60) * 0.35)
      : 1;

  const CARDS_START = 90;
  const CARD_INTERVAL = 60;

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
          height: 56,
          borderBottom: `1px solid ${BRAND.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          gap: 8,
          backgroundColor: BRAND.cream,
        }}
      >
        <span style={{fontFamily: 'Inter, sans-serif', fontSize: 13, color: BRAND.grayMid}}>Workspace</span>
        <span style={{color: BRAND.grayLight}}>/</span>
        <span style={{fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: BRAND.offBlack}}>Scholarships</span>
      </div>

      <div style={{padding: '36px 40px', overflow: 'hidden'}}>
        {/* Page header */}
        <div style={{marginBottom: 8}}>
          <div style={{fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: BRAND.grayMid, marginBottom: 8}}>
            FINANCIAL PLANNING
          </div>
          <h1
            style={{
              fontFamily: '"EB Garamond", Georgia, serif',
              fontSize: 42,
              fontWeight: 400,
              color: BRAND.offBlack,
              margin: '0 0 4px',
            }}
          >
            Scholarship <em style={{fontStyle: 'italic'}}>matches</em>
          </h1>
          <div style={{fontFamily: 'Inter, sans-serif', fontSize: 14, color: BRAND.grayMid}}>
            8 opportunities · 0 in progress · 1 submitted
          </div>
        </div>

        {/* Search form */}
        <SearchForm frame={frame} fps={fps} scanPulse={scanPulse} />

        {/* Filter tabs */}
        <div style={{display: 'flex', gap: 8, marginBottom: 24}}>
          {[
            {label: 'All (8)', active: true},
            {label: 'Tracking (6)', active: false},
            {label: 'Gathering docs (1)', active: false},
            {label: 'Submitted (1)', active: false},
          ].map((tab) => (
            <div
              key={tab.label}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                padding: '6px 14px',
                borderRadius: 20,
                border: `1px solid ${tab.active ? BRAND.rust : BRAND.border}`,
                backgroundColor: tab.active ? BRAND.rust : 'transparent',
                color: tab.active ? BRAND.white : BRAND.offBlack,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Scholarship cards */}
        <div style={{display: 'flex', gap: 20}}>
          {SCHOLARSHIPS.map((sch, i) => {
            const cardEnter = spring({
              fps,
              frame: frame - (CARDS_START + i * CARD_INTERVAL),
              config: {damping: 14, stiffness: 80},
              durationInFrames: 35,
            });
            const cardOpacity = interpolate(cardEnter, [0, 1], [0, 1]);
            const cardY = interpolate(cardEnter, [0, 1], [30, 0]);

            return (
              <ScholarshipCard
                key={sch.name}
                sch={sch}
                opacity={cardOpacity}
                translateY={cardY}
                frame={frame}
                startFrame={CARDS_START + i * CARD_INTERVAL}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom label */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity:
            interpolate(frame, [280, 305], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
            sceneOut,
          backgroundColor: 'rgba(26,23,20,0.78)',
          borderRadius: 20,
          padding: '7px 20px',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: BRAND.cream,
          whiteSpace: 'nowrap',
        }}
      >
        8 scholarships matched · Real-time search
      </div>
    </AbsoluteFill>
  );
};

const SearchForm: React.FC<{frame: number; fps: number; scanPulse: number}> = ({frame, fps, scanPulse}) => {
  const enter = spring({fps, frame: frame - 5, config: {damping: 16, stiffness: 80}, durationInFrames: 30});
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const y = interpolate(enter, [0, 1], [20, 0]);

  return (
    <div
      style={{
        backgroundColor: BRAND.white,
        borderRadius: 12,
        padding: '24px',
        border: `1px solid ${BRAND.border}`,
        marginBottom: 20,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: BRAND.grayMid, marginBottom: 16}}>
        AI SCHOLARSHIP SEARCH
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16}}>
        {[
          {label: 'CITIZENSHIP', value: 'Nepal'},
          {label: 'ORIGIN COUNTRY', value: 'Nepal'},
          {label: 'STUDY LEVEL', value: 'Undergraduate'},
        ].map((f) => (
          <FormField key={f.label} label={f.label} value={f.value} />
        ))}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16}}>
        {[
          {label: 'FIELD OF STUDY', value: 'Masters in Consumer Psychology'},
          {label: 'INTAKE TERM', value: 'e.g. Fall 2026'},
          {label: 'FUNDING NEED', value: 'Partial OK'},
        ].map((f) => (
          <FormField key={f.label} label={f.label} value={f.value} />
        ))}
      </div>
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          backgroundColor: BRAND.rust,
          color: BRAND.white,
          border: 'none',
          borderRadius: 8,
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transform: `scale(${scanPulse})`,
        }}
      >
        ✦ Scan with AI
      </button>
    </div>
  );
};

const FormField: React.FC<{label: string; value: string}> = ({label, value}) => (
  <div>
    <div style={{fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: BRAND.grayMid, marginBottom: 6}}>
      {label}
    </div>
    <div
      style={{
        border: `1px solid ${BRAND.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        color: BRAND.offBlack,
        backgroundColor: BRAND.cream,
      }}
    >
      {value}
    </div>
  </div>
);

const ScholarshipCard: React.FC<{
  sch: (typeof SCHOLARSHIPS)[0];
  opacity: number;
  translateY: number;
  frame: number;
  startFrame: number;
}> = ({sch, opacity, translateY}) => (
  <div
    style={{
      flex: 1,
      backgroundColor: BRAND.white,
      borderRadius: 12,
      padding: '20px',
      border: `1px solid ${BRAND.border}`,
      opacity,
      transform: `translateY(${translateY}px)`,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}
  >
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
      <h3
        style={{
          fontFamily: '"EB Garamond", Georgia, serif',
          fontSize: 24,
          fontWeight: 400,
          color: BRAND.offBlack,
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {sch.title}
      </h3>
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          color: sch.statusColor,
          backgroundColor: `${sch.statusColor}18`,
          border: `1px solid ${sch.statusColor}40`,
          borderRadius: 20,
          padding: '3px 10px',
          whiteSpace: 'nowrap',
        }}
      >
        ● {sch.status}
      </div>
    </div>

    <div>
      <div style={{fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: BRAND.offBlack}}>{sch.name}</div>
      <div style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.grayMid}}>{sch.org}</div>
    </div>

    <div style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.grayMid, lineHeight: 1.5}}>
      {sch.desc}
    </div>

    <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
      {sch.tags.map((tag) => (
        <span
          key={tag}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            color: BRAND.grayMid,
            border: `1px solid ${BRAND.border}`,
            borderRadius: 20,
            padding: '2px 8px',
          }}
        >
          {tag}
        </span>
      ))}
    </div>

    <div
      style={{
        marginTop: 'auto',
        paddingTop: 12,
        borderTop: `1px solid ${BRAND.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.grayMid}}>
        📅 {sch.date}
      </span>
      <div style={{display: 'flex', gap: 8}}>
        <button
          style={{
            backgroundColor: BRAND.rust,
            color: BRAND.white,
            border: 'none',
            borderRadius: 6,
            padding: '6px 14px',
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Apply →
        </button>
        <button
          style={{
            backgroundColor: 'transparent',
            color: BRAND.offBlack,
            border: `1px solid ${BRAND.border}`,
            borderRadius: 6,
            padding: '6px 14px',
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          + Add to tasks
        </button>
      </div>
    </div>
  </div>
);
