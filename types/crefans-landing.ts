import type {Creator} from './crefans';
export type LandingContent={
  hero?:{title:string[];description:string[];image:string;imageAlt:string;position?:string};
  steps:{icon:'search'|'card'|'heart';title:string;description:string[]}[];
  /** 2026-11-16: AI photo editing feature with the trial link and the service brochure (PDF). */
  aiPhoto?:{title:string;description:string[];points:string[];image:string;imageAlt:string;trialHref:string;brochureHref:string};
  creators:Creator[];
  creatorDisclosure?:string;
  collage:Pick<Creator,'id'|'name'|'image'|'position'>[];
  notice?:string;
};
