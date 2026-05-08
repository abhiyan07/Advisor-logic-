/**
 * Timed caption cues — each maps to a VO line and the frame it starts.
 * Frames are at 30fps. Adjust startFrame values if your recording pace differs.
 *
 * Rule of thumb: if your VO runs long, increase SCENE_DURATIONS in constants.ts
 * rather than tweaking individual cue frames.
 */
export interface CaptionCue {
  text: string;
  startFrame: number;
  endFrame: number;
  /** rust = brand accent, white = default */
  accent?: boolean;
}

export const CAPTIONS: CaptionCue[] = [
  // Scene 1 — Hook (0–270)
  {text: 'What if you already knew...', startFrame: 15, endFrame: 70, accent: false},
  {text: 'every deadline. Every professor.', startFrame: 75, endFrame: 135},
  {text: 'Every scholarship. Every single step.', startFrame: 140, endFrame: 210},
  {text: 'Between you and your offer letter.', startFrame: 215, endFrame: 265},

  // Scene 2 — Reveal (270–510)
  {text: 'Meet Vidhya.', startFrame: 285, endFrame: 340, accent: true},
  {text: 'From first search to signed offer letter.', startFrame: 345, endFrame: 500},

  // Scene 3 — Onboarding (510–840)
  {text: 'Answer four quick questions.', startFrame: 530, endFrame: 600},
  {text: 'Vidhya researches live and seeds your workspace', startFrame: 605, endFrame: 700},
  {text: 'with a personalized shortlist — plus a starter checklist.', startFrame: 705, endFrame: 830},

  // Scene 4 — AI Advisor (840–1380)
  {text: 'Your AI advisor researches in real time.', startFrame: 860, endFrame: 960},
  {text: 'Ask anything.', startFrame: 965, endFrame: 1020, accent: true},
  {text: 'Compare programs, explore your chances, find funding.', startFrame: 1025, endFrame: 1150},
  {text: 'It thinks through your profile', startFrame: 1155, endFrame: 1230},
  {text: 'and turns every answer into an action.', startFrame: 1235, endFrame: 1370},

  // Scene 5 — App Board (1380–1710)
  {text: 'Every university you\'re tracking, organized in one board.', startFrame: 1400, endFrame: 1530},
  {text: 'From researching... to got offer.', startFrame: 1535, endFrame: 1700, accent: true},

  // Scene 6 — University Detail (1710–2100)
  {text: 'Drill into any school. See your fit.', startFrame: 1730, endFrame: 1840},
  {text: 'What to strengthen. Every requirement.', startFrame: 1845, endFrame: 1940},
  {text: 'Vidhya finds professors aligned to your research —', startFrame: 1945, endFrame: 2040},
  {text: 'and drafts a personalized outreach email in seconds.', startFrame: 2045, endFrame: 2090, accent: true},

  // Scene 7 — Scholarships (2100–2460)
  {text: 'Finding funding?', startFrame: 2115, endFrame: 2175, accent: true},
  {text: 'Vidhya scans scholarships matched exactly to your profile.', startFrame: 2180, endFrame: 2320},
  {text: 'Track every application — never miss a deadline.', startFrame: 2325, endFrame: 2450},

  // Scene 8 — End Card (2460–2700)
  {text: '2,400+ students already navigating with Vidhya.', startFrame: 2480, endFrame: 2580},
  {text: 'Navigate by knowing.', startFrame: 2590, endFrame: 2690, accent: true},
];
