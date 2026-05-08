/**
 * Scene 7 — Scholarships (12s / 360 frames)
 *
 * Phase 1 (0–160): Scholarship search form screenshot.
 *   "Scan with AI" button pulses + field highlights animate.
 * Phase 2 (160–360): Scholarship cards screenshot fades in.
 *   Status badges highlight in sequence. Cards get a subtle glow sweep.
 *
 * VO: "Finding funding? Vidhya scans government, foundation, and university
 *      scholarships matched exactly to your profile. Track every application
 *      — never miss a deadline."
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

const PHASE_SWITCH = 160;

// Approximate left-edge % positions of the 3 scholarship cards in 11-scholarship-cards.png
const CARD_X = [18, 47, 76];
const CARD_COLORS = ['#E8952A', '#3B82F6', '#6366F1']; // gathering docs, submitted, tracking
const CARD_LABELS = ['GATHERING DOCS', 'SUBMITTED', 'TRACKING'];

export const Scene7Scholarships: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const sceneOut = interpolate(frame, [330, 360], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase 1: search form
  const formOpacity =
    interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'}) *
    interpolate(frame, [PHASE_SWITCH - 20, PHASE_SWITCH], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  // Scan button pulse (frames 40–120)
  const scanPulse =
    frame >= 40 && frame <= 120
      ? 1 + 0.06 * Math.sin((frame - 40) * 0.32)
      : 1;

  // Zoom on form screenshot
  const zoom1 = interpolate(frame, [0, PHASE_SWITCH], [1.0, 1.05], {extrapolateRight: 'clamp'});

  // Scroll form screen slightly to show cards below fold
  const scroll1 = interpolate(frame, [80, PHASE_SWITCH - 10], [0, 10], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase 1 label
  const label1Opacity =
    interpolate(frame, [50, 75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    interpolate(frame, [PHASE_SWITCH - 25, PHASE_SWITCH - 5], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  // Phase 2: cards
  const cardsOpacity = interpolate(frame, [PHASE_SWITCH, PHASE_SWITCH + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const zoom2 = interpolate(frame, [PHASE_SWITCH, 360], [1.0, 1.04], {extrapolateRight: 'clamp'});

  // Active card cycles: 0 → 1 → 2 over phase 2
  const activeCard = Math.min(
    2,
    Math.floor(
      interpolate(frame, [PHASE_SWITCH + 20, PHASE_SWITCH + 160], [0, 3], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    )
  );

  // Phase 2 label
  const label2Opacity =
    interpolate(frame, [PHASE_SWITCH + 60, PHASE_SWITCH + 85], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }) * sceneOut;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.cream,
        opacity: sceneIn * sceneOut,
        overflow: 'hidden',
      }}
    >
      {/* ══ PHASE 1: Scholarship search form ══ */}
      <AbsoluteFill style={{opacity: formOpacity, overflow: 'hidden'}}>
        <Img
          src={staticFile('screenshots/10-scholarships.png')}
          style={{
            width: '100%',
            height: `${zoom1 * 115}%`,
            objectFit: 'cover',
            objectPosition: 'top center',
            transform: `translateY(-${scroll1}%)`,
            display: 'block',
          }}
        />

        {/* "Scan with AI" button highlight overlay */}
        <div
          style={{
            position: 'absolute',
            // Approx position of the Scan button in the screenshot
            top: '55%',
            left: '15%',
            transform: `scale(${scanPulse})`,
            transformOrigin: 'left center',
            opacity: interpolate(frame, [35, 55], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(192,98,58,0.95)',
              borderRadius: 8,
              padding: '9px 20px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              boxShadow: `0 6px 24px rgba(192,98,58,${0.3 + 0.2 * Math.sin(frame * 0.32)})`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>✦</span> Scan with AI
          </div>
        </div>

        {/* Highlight rings on form fields (Nepal, Masters in Consumer Psychology) */}
        {[
          {top: '30%', left: '15%', width: '22%', delay: 20},
          {top: '43%', left: '15%', width: '22%', delay: 50},
        ].map((field, i) => {
          const fieldOpacity = interpolate(frame, [field.delay, field.delay + 20], [0, 0.7], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: field.top,
                left: field.left,
                width: field.width,
                height: '5%',
                border: `2px solid rgba(192,98,58,${fieldOpacity})`,
                borderRadius: 8,
                boxShadow: `0 0 12px rgba(192,98,58,${fieldOpacity * 0.3})`,
                pointerEvents: 'none',
              }}
            />
          );
        })}

        <BottomLabel text="AI scans govt + foundation + university funds" opacity={label1Opacity} />
      </AbsoluteFill>

      {/* ══ PHASE 2: Scholarship cards ══ */}
      <AbsoluteFill style={{opacity: cardsOpacity, overflow: 'hidden'}}>
        <Img
          src={staticFile('screenshots/11-scholarship-cards.png')}
          style={{
            width: '100%',
            height: `${zoom2 * 108}%`,
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
          }}
        />

        {/* Status badge callouts animate in over each card */}
        {CARD_X.map((x, i) => {
          const badgeStart = PHASE_SWITCH + 25 + i * 50;
          const badgeOpacity = interpolate(frame, [badgeStart, badgeStart + 20], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const isActive = i === activeCard;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '10%',
                left: `${x}%`,
                transform: 'translateX(-50%)',
                opacity: badgeOpacity * sceneOut,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: isActive
                    ? CARD_COLORS[i]
                    : `${CARD_COLORS[i]}CC`,
                  borderRadius: 20,
                  padding: '5px 14px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '0.06em',
                  boxShadow: isActive ? `0 4px 16px ${CARD_COLORS[i]}55` : 'none',
                  whiteSpace: 'nowrap',
                  transform: `scale(${isActive ? 1 + 0.04 * Math.sin(frame * 0.28) : 1})`,
                }}
              >
                <span style={{fontSize: 8}}>●</span>
                {CARD_LABELS[i]}
              </div>
            </div>
          );
        })}

        {/* Card glow sweep */}
        <div
          style={{
            position: 'absolute',
            top: '14%',
            left: `${CARD_X[activeCard] - 13}%`,
            width: '26%',
            bottom: '8%',
            borderRadius: 12,
            border: `2px solid ${CARD_COLORS[activeCard]}50`,
            boxShadow: `0 0 24px ${CARD_COLORS[activeCard]}25`,
            pointerEvents: 'none',
            opacity: interpolate(frame, [PHASE_SWITCH + 25, PHASE_SWITCH + 50], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }) * sceneOut,
            transition: 'left 0.4s ease, border-color 0.4s ease',
          }}
        />

        <BottomLabel text="8 scholarships matched · Real-time search" opacity={label2Opacity} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BottomLabel: React.FC<{text: string; opacity: number}> = ({text, opacity}) => (
  <div
    style={{
      position: 'absolute',
      bottom: 40,
      left: '50%',
      transform: 'translateX(-50%)',
      opacity,
      backgroundColor: 'rgba(26,23,20,0.78)',
      borderRadius: 20,
      padding: '8px 22px',
      fontFamily: 'Inter, sans-serif',
      fontSize: 14,
      color: BRAND.cream,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);
