/**
 * Splash Screen Types
 *
 * TypeScript interfaces for splash screen components
 */

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BriefingItem {
  id: string;
  agent: string;
  icon: string;
  content: string;
  severity: Severity;
  delay: number;
}

export interface CarouselSlide {
  id: string;
  gradient: string;
  visual: React.ReactNode;
  text: string;
}
