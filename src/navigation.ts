import { Calendar, Trophy, Activity, Newspaper, MessageSquare, Cpu } from 'lucide-react';

// One list drives both navigations. Desktop shows the anchor links (Chat has a
// floating button instead); mobile shows the tabs (Technical lives inside the
// Intel tab there). Section ids match the `id` on each <section> in App.

export type Tab = 'calendar' | 'standings' | 'live' | 'intel' | 'chat';

export interface NavItem {
  id: Tab | 'technical';
  label: string;
  Icon: typeof Calendar;
  anchor: string;      // section id the desktop link scrolls to
  sections: string[];  // section ids which count as "active" for this item
  mobile: boolean;     // shown in the mobile tab bar
  desktop: boolean;    // shown in the desktop header
}

export const NAV: NavItem[] = [
  { id: 'calendar',  label: 'Calendar',  Icon: Calendar,      anchor: 'calendar',  sections: ['calendar'],                                  mobile: true, desktop: true },
  { id: 'standings', label: 'Standings', Icon: Trophy,        anchor: 'drivers',   sections: ['drivers', 'constructors'],                   mobile: true, desktop: true },
  { id: 'live',      label: 'Live',      Icon: Activity,      anchor: 'weekend',   sections: ['weekend', 'telemetry', 'speedtrace'],        mobile: true, desktop: true },
  { id: 'intel',     label: 'Intel',     Icon: Newspaper,     anchor: 'intel',     sections: ['intel'],                                     mobile: true, desktop: true },
  { id: 'technical', label: 'Technical', Icon: Cpu,           anchor: 'technical', sections: ['technical'],                                 mobile: false, desktop: true },
  { id: 'chat',      label: 'Chat',      Icon: MessageSquare, anchor: '',          sections: [],                                            mobile: true, desktop: false },
];

export const TABS = NAV.filter((n) => n.mobile);
export const DESKTOP_LINKS = NAV.filter((n) => n.desktop);

/** Section ids in reading order, used by the IntersectionObserver in the header. */
export const SECTION_IDS = NAV.flatMap((n) => n.sections);

/** Which mobile tab a section belongs to. Technical is reached through Intel on mobile. */
export function tabForSection(sectionId: string): Tab {
  if (sectionId === 'technical') return 'intel';
  const item = NAV.find((n) => n.sections.includes(sectionId));
  return (item?.id as Tab) || 'calendar';
}
