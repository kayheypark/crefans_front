import type {Creator} from './crefans';
export type LandingContent={
  hero?:{title:string[];description:string[];image:string;imageAlt:string;position?:string};
  steps:{icon:'search'|'card'|'heart';title:string;description:string[]}[];
  creators:Creator[];
  collage:Pick<Creator,'id'|'name'|'image'|'position'>[];
  notice?:string;
};
