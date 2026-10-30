export type ServiceEvent={
 id:string;
 title:string;
 summary:string;
 campaignTitle:string;
 campaignSubtitle:string;
 schedule:string;
 theme?:'gift'|'advertising'|'beans'|'badge';
 banner?:{title:string;description:string};
 image:string;
 imageWidth:number;
 imageHeight:number;
 rewards:ReadonlyArray<{audience:string;title:string;image:string;details:readonly string[];notice?:string}>;
 notes:ReadonlyArray<{title:string;items:readonly string[]}>;
};
