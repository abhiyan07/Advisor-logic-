/**
 * Scene 6 — University Detail + Professor Email (13s / 390 frames)
 *
 * Shows CMU detail page. Fit snapshot card reveals. Professors panel slides in.
 * Email composer opens with drafted email.
 *
 * VO: "Drill into any school. See your fit, what to strengthen, and every
 *      requirement you need to hit. Vidhya finds professors aligned to your
 *      research — and drafts a personalized outreach email in seconds."
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

const EMAIL_BODY = `Dear Professor Hong,

I recently explored your research on the psychological factors influencing consumer choices in mobile environments, particularly your work using behavioral modeling to enhance usable privacy. Your approach to understanding how digital systems intersect with human decision-making is compelling, especially regarding social computing frameworks.`;

export const Scene6UniversityDetail: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneIn = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const sceneOut = interpolate(frame, [360, 390], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Main page enter
  const pageEnter = spring({fps, frame, config: {damping: 18, stiffness: 70}, durationInFrames: 35});
  const pageY = interpolate(pageEnter, [0, 1], [30, 0]);
  const pageOpacity = interpolate(pageEnter, [0, 1], [0, 1]);

  // Fit snapshot card "reveal" — subtle scale+fade at frame 40
  const fitEnter = spring({fps, frame: frame - 40, config: {damping: 14, stiffness: 100}, durationInFrames: 30});
  const fitScale = interpolate(fitEnter, [0, 1], [0.96, 1]);
  const fitOpacity = interpolate(fitEnter, [0, 1], [0, 1]);

  // Professors panel slides in from right at frame 100
  const profEnter = spring({fps, frame: frame - 100, config: {damping: 14, stiffness: 80}, durationInFrames: 35});
  const profX = interpolate(profEnter, [0, 1], [60, 0]);
  const profOpacity = interpolate(profEnter, [0, 1], [0, 1]);

  // Email composer slides up from bottom at frame 220
  const emailEnter = spring({fps, frame: frame - 220, config: {damping: 14, stiffness: 70}, durationInFrames: 40});
  const emailY = interpolate(emailEnter, [0, 1], [100, 0]);
  const emailOpacity = interpolate(emailEnter, [0, 1], [0, 1]);

  // Email text types in after composer opens
  const emailChars = Math.floor(
    interpolate(frame, [260, 360], [0, EMAIL_BODY.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.cream,
        opacity: sceneIn * sceneOut,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top nav bar */}
      <div
        style={{
          height: 56,
          borderBottom: `1px solid ${BRAND.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          gap: 8,
          backgroundColor: BRAND.cream,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <span style={{fontFamily: 'Inter, sans-serif', fontSize: 13, color: BRAND.grayMid}}>← Back to board</span>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 0,
          overflow: 'hidden',
          transform: `translateY(${pageY}px)`,
          opacity: pageOpacity,
        }}
      >
        {/* Left: university info */}
        <div
          style={{
            flex: 1,
            padding: '36px 40px',
            overflowY: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {/* University header */}
          <div style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32}}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                backgroundColor: '#9C4221',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: BRAND.white,
              }}
            >
              CM
            </div>
            <div>
              <h1
                style={{
                  fontFamily: '"EB Garamond", Georgia, serif',
                  fontSize: 42,
                  fontWeight: 400,
                  color: BRAND.offBlack,
                  margin: 0,
                }}
              >
                Carnegie Mellon
              </h1>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 4}}>
                <span style={{fontFamily: 'Inter, sans-serif', fontSize: 14, color: BRAND.grayMid}}>
                  Computer Science
                </span>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 12,
                    color: '#3B82F6',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    borderRadius: 20,
                    padding: '2px 10px',
                  }}
                >
                  ● Applied
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              marginBottom: 28,
              paddingBottom: 28,
              borderBottom: `1px solid ${BRAND.border}`,
            }}
          >
            {[
              {label: 'TUITION', value: '$57,500/yr'},
              {label: 'INTL. STUDENTS', value: '60%'},
              {label: 'ACCEPTANCE', value: '5%'},
              {label: 'DEADLINE', value: 'December 12'},
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: BRAND.grayMid, marginBottom: 4}}>
                  {stat.label}
                </div>
                <div style={{fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: BRAND.offBlack}}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Fit Snapshot card */}
          <div
            style={{
              backgroundColor: BRAND.cardBg,
              borderRadius: 12,
              padding: '24px',
              marginBottom: 24,
              border: `1px solid ${BRAND.border}`,
              transform: `scale(${fitScale})`,
              opacity: fitOpacity,
              transformOrigin: 'top left',
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12}}>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: BRAND.grayMid,
                }}
              >
                FIT SNAPSHOT — TAILORED TO YOUR PROFILE
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  color: BRAND.rust,
                  backgroundColor: 'rgba(192,98,58,0.12)',
                  borderRadius: 20,
                  padding: '2px 10px',
                }}
              >
                REACH
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 24,
              }}
            >
              <div>
                <div style={{fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: BRAND.grayMid, marginBottom: 8}}>WHY THIS PROGRAM</div>
                {['Home to the first CS department in the US', 'Unrivaled focus on AI and Robotics', 'Strong recruitment from FAANG + research labs'].map((b) => (
                  <div key={b} style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.offBlack, marginBottom: 4}}>
                    • {b}
                  </div>
                ))}
              </div>
              <div>
                <div style={{fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: BRAND.rust, marginBottom: 8}}>TO STRENGTHEN</div>
                {['Significant funding gap ($60k short)', 'Misalignment between target major and program', 'Missing CS-specific prerequisites'].map((b) => (
                  <div key={b} style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.offBlack, marginBottom: 4}}>
                    • {b}
                  </div>
                ))}
              </div>
              <div>
                <div style={{fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: BRAND.grayMid, marginBottom: 8}}>INTERNAL SCHOLARSHIPS</div>
                {["GEM Fellowship (US Citizens only)", "SCS Dean's Fellowship"].map((b) => (
                  <div key={b} style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.offBlack, marginBottom: 4}}>
                    • {b}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Requirements checklist preview */}
          <div
            style={{
              backgroundColor: BRAND.white,
              borderRadius: 12,
              padding: '20px 24px',
              border: `1px solid ${BRAND.border}`,
            }}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
              <span style={{fontFamily: '"EB Garamond", Georgia, serif', fontSize: 22, color: BRAND.offBlack}}>Requirements checklist</span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  color: BRAND.grayMid,
                  border: `1px solid ${BRAND.border}`,
                  borderRadius: 20,
                  padding: '3px 12px',
                }}
              >
                0 of 10 complete
              </span>
            </div>
            {['Statement of Purpose', 'Personal Statement', 'Official Academic Transcripts', 'Recommendation Letter 1'].map((req, i) => (
              <div
                key={req}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderTop: i > 0 ? `1px solid ${BRAND.border}` : undefined,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: `2px solid ${BRAND.grayLight}`,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{fontFamily: 'Inter, sans-serif', fontSize: 14, color: BRAND.offBlack}}>{req}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Professors + Email */}
        <div
          style={{
            width: 400,
            borderLeft: `1px solid ${BRAND.border}`,
            display: 'flex',
            flexDirection: 'column',
            transform: `translateX(${profX}px)`,
            opacity: profOpacity,
          }}
        >
          {/* Professors panel */}
          <div style={{padding: '24px', borderBottom: `1px solid ${BRAND.border}`, flex: '0 0 auto'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16}}>
              <span style={{fontFamily: '"EB Garamond", Georgia, serif', fontSize: 22, color: BRAND.offBlack}}>Professors</span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  color: BRAND.grayMid,
                  border: `1px solid ${BRAND.border}`,
                  borderRadius: 20,
                  padding: '2px 10px',
                }}
              >
                4 found
              </span>
            </div>

            {[
              {name: 'Jason Hong', dept: 'Computer Science', pct: 95, desc: 'Focuses on usable privacy and security, behavioral modeling to understand consumer choices in digital environments.'},
              {name: 'Alessandro Acquisti', dept: 'Computer Science', pct: 92, desc: 'Examines the economics and psychology of privacy in digital environments.'},
            ].map((prof, i) => {
              const profCardEnter = spring({fps, frame: frame - (120 + i * 40), config: {damping: 14}, durationInFrames: 30});
              const pOpacity = interpolate(profCardEnter, [0, 1], [0, 1]);
              const pY = interpolate(profCardEnter, [0, 1], [20, 0]);
              return (
                <div
                  key={prof.name}
                  style={{
                    backgroundColor: BRAND.cardBg,
                    borderRadius: 10,
                    padding: '14px',
                    marginBottom: 10,
                    opacity: pOpacity,
                    transform: `translateY(${pY}px)`,
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6}}>
                    <div>
                      <div style={{fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: BRAND.offBlack}}>{prof.name}</div>
                      <div style={{fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: BRAND.grayMid}}>{prof.dept}</div>
                    </div>
                    <div style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.rust, fontWeight: 600}}>{prof.pct}% match</div>
                  </div>
                  <div style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.grayMid, lineHeight: 1.5, marginBottom: 10}}>
                    {prof.desc}
                  </div>
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      border: `1px solid ${BRAND.border}`,
                      borderRadius: 6,
                      padding: '5px 12px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 12,
                      color: BRAND.offBlack,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    ✉ Draft email
                  </button>
                </div>
              );
            })}
          </div>

          {/* Email Composer */}
          <div
            style={{
              flex: 1,
              padding: '20px 24px',
              overflow: 'hidden',
              transform: `translateY(${emailY}px)`,
              opacity: emailOpacity,
            }}
          >
            <div style={{fontFamily: '"EB Garamond", Georgia, serif', fontSize: 20, color: BRAND.offBlack, marginBottom: 14}}>
              Email composer
            </div>

            <div
              style={{
                backgroundColor: 'rgba(192,98,58,0.08)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.rust}}>
                Drafts are personalized using the professor's research and your background.
              </span>
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
                  whiteSpace: 'nowrap',
                }}
              >
                Draft with AI
              </button>
            </div>

            {[
              {label: 'To', value: 'jasonh@cs.cmu.edu'},
              {label: 'Subject', value: 'Research Inquiry: Bridging Social Computing and Consumer Psychology'},
            ].map((field) => (
              <div
                key={field.label}
                style={{
                  display: 'flex',
                  gap: 12,
                  marginBottom: 8,
                  alignItems: 'center',
                }}
              >
                <span style={{fontFamily: 'Inter, sans-serif', fontSize: 12, color: BRAND.grayMid, width: 50, flexShrink: 0}}>{field.label}</span>
                <span style={{fontFamily: 'Inter, sans-serif', fontSize: 13, color: BRAND.offBlack}}>{field.value}</span>
              </div>
            ))}

            <div
              style={{
                marginTop: 10,
                backgroundColor: BRAND.cardBg,
                borderRadius: 8,
                padding: '14px',
                fontFamily: '"Courier New", monospace',
                fontSize: 11,
                color: BRAND.offBlack,
                lineHeight: 1.7,
                maxHeight: 200,
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
              }}
            >
              {EMAIL_BODY.slice(0, emailChars)}
              {frame >= 260 && frame < 360 && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 1,
                    height: 13,
                    backgroundColor: BRAND.rust,
                    marginLeft: 1,
                    verticalAlign: 'middle',
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Label overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity:
            interpolate(frame, [240, 265], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * sceneOut,
          backgroundColor: 'rgba(26,23,20,0.78)',
          borderRadius: 20,
          padding: '7px 20px',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: BRAND.cream,
          whiteSpace: 'nowrap',
        }}
      >
        Personalized using the professor's research and your background
      </div>
    </AbsoluteFill>
  );
};
