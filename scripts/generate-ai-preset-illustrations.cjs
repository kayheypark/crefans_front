// Reproducible, gender-neutral vector diagrams for AI preset selection.
const fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'../public/brand/ai-photo/pictograms');fs.mkdirSync(out,{recursive:true});
const ink='#35445d',blue='#7799ee',skin='#ffddc8',accent='#f78a9d',muted='#cbd5e1';
const line=(d,color=ink,width=3)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circle=(x,y,r,fill=ink)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const rect=(x,y,w,h,fill,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
function write(kind,i,art){fs.writeFileSync(path.join(out,`${kind}-${String(i+1).padStart(2,'0')}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" width="384" height="384" viewBox="0 0 200 200">${rect(0,0,200,200,'#f8faff')}${art}</svg>\n`);}
// Mouth, eye and brow shapes do the explaining; no photos, labels or decoration.
const dotEyes=circle(78,94,4)+circle(122,94,4),softEyes=line('M71 94Q78 89 85 94M115 94Q122 89 129 94');
const grin=`<path d="M76 116Q100 122 124 116Q122 143 100 143Q78 143 76 116" fill="${ink}"/>`+`<path d="M80 120Q100 125 120 120L117 129H83Z" fill="white"/>`;
const expressions=[
 dotEyes+line('M84 123H116')+line('M70 80H85M115 80H130',ink,2.5),
 dotEyes+grin+line('M69 80Q78 76 87 80M113 80Q122 76 131 80',ink,2.5),
 dotEyes+line('M82 119Q100 134 118 119'),
 softEyes+line('M83 119Q100 136 117 119')+circle(65,111,6,'#f7b8b8')+circle(135,111,6,'#f7b8b8'),
 line('M72 93Q78 97 84 93M116 93Q122 97 128 93')+line('M87 123Q100 129 113 123'),
 circle(78,94,9,'white')+circle(122,94,9,'white')+dotEyes+`<ellipse cx="100" cy="127" rx="8" ry="11" fill="${ink}"/>`+line('M69 76Q78 69 87 76M113 76Q122 69 131 76'),
 circle(78,94,4)+line('M115 90L126 95L115 99')+line('M82 119Q100 135 118 119'),
 dotEyes+`<path d="M72 114Q100 122 128 114Q126 150 100 150Q74 150 72 114" fill="${ink}"/>`+`<path d="M78 119Q100 125 122 119L119 129H81Z" fill="white"/>`+`<path d="M88 144Q100 133 112 144" fill="${accent}"/>`,
 line('M71 96H85M115 96H129')+line('M89 124Q100 127 111 124')+line('M72 81H85M115 81H128',ink,2),
 dotEyes+grin+line('M68 77Q78 68 88 77M112 77Q122 68 132 77')+line('M149 59L156 53M153 70L162 68',accent),
 circle(81,98,4)+circle(125,98,4)+line('M88 124Q100 134 112 124')+circle(67,114,9,'#f7b8b8')+circle(133,114,9,'#f7b8b8')+line('M70 84L85 80M115 80L130 84',ink,2),
 line('M72 96Q78 100 84 96M116 96Q122 100 128 96')+line('M88 123Q100 133 112 123')+line('M74 82H84M116 82H126',ink,2),
 circle(78,94,4)+circle(122,91,4)+line('M82 125Q104 130 122 112')+line('M70 81H86M114 76Q123 69 132 76',ink,2.5)
];
expressions.forEach((art,i)=>write('expression',i,circle(100,101,62,skin)+art));
// Joint coordinates: head, torso endpoints, elbows/hands and knees/feet.
const base={head:[100,44],body:[[100,70],[100,119]],arms:[[[84,78],[73,101],[71,122]],[[116,78],[127,101],[129,122]]],legs:[[[92,120],[88,146],[86,174]],[[108,120],[112,146],[115,174]]]};
function figure(p={}){p={...base,...p};let a='';for(const pts of [...p.legs,...p.arms])a+=line('M'+pts.map(x=>x.join(' ')).join('L'),blue,12);a+=line('M'+p.body.map(x=>x.join(' ')).join('L'),blue,30);for(const arm of p.arms){const [x,y]=arm[2];a+=circle(x,y,6,skin);}const [x,y]=p.head;const face=p.face==='left'?circle(x-7,y-1,2.3)+line(`M${x-10} ${y+7}h5`,ink,2):p.face==='right'?circle(x+7,y-1,2.3)+line(`M${x+5} ${y+7}h5`,ink,2):circle(x-5,y-1,2.1)+circle(x+5,y-1,2.1)+line(`M${x-3} ${y+7}h6`,ink,2);a+=`<g transform="rotate(${p.tilt||0} ${x} ${y})">`+circle(x,y,16,skin)+face+'</g>';return a;}
const floor=line('M37 181H163',muted,2),chair=line('M67 84V131H133M75 132V175M126 132V175',muted,7),bench=line('M38 131H162M50 133V177M150 133V177',muted,7);
const poses=[
 {arms:[[[84,78],[62,66],[64,39]],base.arms[1]],extra:line('M48 30L43 25M44 43H36',accent)},
 {head:[105,44],body:[[101,70],[96,119]],arms:[[[92,78],[77,97],[78,119]],[[111,78],[118,103],[110,123]]],legs:[[[91,120],[85,146],[81,174]],[[103,120],[113,144],[123,170]]],extra:line('M132 85Q148 95 136 108M136 108L137 99M136 108L145 106',accent)},
 {arms:[[[84,78],[76,106],[98,116]],[[116,78],[124,106],[102,116]]]},
 {arms:[base.arms[0],[[116,78],[140,96],[114,109]]]},
 {head:[108,45],tilt:22,body:[[100,72],[100,119]],extra:line('M122 24Q136 31 135 43',accent)},
 {arms:[base.arms[0],[[116,78],[135,72],[135,48]]],extra:line('M132 47L128 34M138 47L143 35',skin,5)},
 {},
 {arms:[base.arms[0],[[116,78],[127,104],[113,88]]],extra:line('M126 81L132 76M130 89H138',accent)},
 {head:[116,52],body:[[110,77],[94,120]],arms:[[[99,84],[118,103],[140,106]],[[119,83],[134,98],[145,105]]],legs:[[[88,121],[81,148],[75,175]],[[102,121],[112,145],[119,175]]],behind:line('M132 113H168M157 113V177',muted,7)},
 {arms:[base.arms[0],[[116,78],[136,96],[112,60]]]},
 {arms:[[[84,78],[74,101],[96,93]],[[116,78],[126,101],[104,93]]],extra:`<path d="M100 91C86 78 88 73 94 73Q100 73 100 79Q100 73 106 73C112 73 114 78 100 91" fill="${accent}"/>`},
 {head:[99,44],body:[[109,71],[105,119]],arms:[[[100,79],[94,102],[96,123]],[[119,79],[129,99],[125,122]]],legs:[[[100,120],[97,147],[93,174]],[[112,120],[117,147],[121,174]]],extra:line('M75 48H57M57 48L64 43M57 48L64 53',accent)},
 {head:[100,43],body:[[100,69],[98,118]],arms:[[[84,78],[79,108],[111,124]],[[116,78],[122,106],[124,124]]],legs:[[[92,120],[121,127],[121,172]],[[106,120],[137,127],[137,172]]],behind:chair},
 {head:[100,43],body:[[100,69],[100,118]],arms:[[[84,78],[76,105],[88,125]],[[116,78],[124,105],[112,125]]],legs:[[[92,120],[82,145],[80,175]],[[108,120],[119,145],[123,175]]],behind:bench},
 {head:[104,80],body:[[102,106],[100,137]],arms:[[[88,110],[76,128],[76,142]],[[116,110],[128,128],[128,142]]],legs:[[[93,138],[66,132],[87,171]],[[108,138],[139,132],[117,171]]]},
 {head:[115,46],body:[[113,73],[102,119]],arms:[[[100,79],[86,104],[91,123]],[[125,79],[136,103],[127,121]]],legs:[[[97,120],[83,149],[65,175]],[[110,120],[119,143],[111,174]]],behind:line('M140 26V181',muted,7)},
 {head:[100,77],body:[[100,104],[100,148]],arms:[[[85,109],[73,138],[78,158]],[[115,109],[127,138],[122,158]]],legs:[[[94,148],[64,166],[111,173]],[[106,148],[137,166],[91,176]]]},
 {head:[108,44],face:'right',extra:line('M129 45H156M156 45L149 40M156 45L149 50',accent)},
 {head:[94,45],face:'left',body:[[105,71],[100,119]],arms:[[[91,78],[78,100],[63,106]],[[119,78],[131,97],[139,114]]],legs:[[[93,120],[77,149],[62,170]],[[107,120],[120,140],[126,173]]],extra:line('M59 49H42M42 49L49 44M42 49L49 54',accent)},
 {head:[98,43],body:[[100,70],[100,118]],arms:[[[84,78],[71,100],[64,86]],[[116,78],[129,96],[143,90]]],legs:[[[92,120],[83,146],[81,175]],[[108,120],[116,146],[120,175]]],behind:bench,extra:line('M137 56h18M137 65h12',accent)},
 {head:[90,45],body:[[91,72],[89,119]],arms:[[[77,80],[66,104],[78,123]],[[105,80],[118,103],[117,123]]],legs:[[[82,120],[113,136],[113,172]],[[96,120],[134,135],[146,157]]],behind:line('M37 130H98V149H140V176H170',muted,7)},
 {head:[108,44],body:[[105,72],[96,121]],arms:[[[92,79],[111,103],[144,105]],[[118,79],[133,103],[153,105]]],legs:[[[89,121],[81,147],[73,175]],[[103,121],[109,149],[117,175]]],behind:line('M126 114H176M150 114V181',muted,7)},
 {arms:[[[84,78],[68,51],[76,26]],[[116,78],[133,51],[125,26]]],extra:line('M58 32L50 24M144 32L152 24',accent)},
 {head:[106,44],face:'right',body:[[102,71],[100,119]],arms:[[[88,78],[77,98],[64,108]],[[116,78],[127,99],[137,119]]],legs:[[[92,120],[79,145],[61,172]],[[108,120],[121,143],[139,172]]],extra:line('M148 166H166M155 174H171',muted,2)}
];
poses.forEach((p,i)=>write('pose',i,(p.behind||'')+floor+figure(p)+(p.extra||'')));
// Camera height diagrams share a subject; crop diagrams show the actual selected coverage.
function camera(x,y){return rect(x,y-10,24,20,ink,4)+`<path d="M${x+23} ${y-6}l11-6v24l-11-6" fill="${ink}"/>`+circle(x+9,y,4,'#f8faff');}
function viewLine(y){return `<path d="M61 ${y}L129 60" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="5 5"/>`+circle(129,60,4,accent);}
[60,142,22].forEach((y,i)=>write('camera',i,floor+`<g transform="translate(43 22) scale(.86)">${figure()}</g>`+camera(23,y)+viewLine(y)+(i?line(i===1?'M65 146Q82 145 87 122M87 122L79 126M87 122L91 131':'M64 26Q83 29 88 46M88 46L80 42M88 46L92 38',accent,2):'')));
const frame=line('M53 23H33V43M147 23H167V43M33 157V177H53M147 177H167V157',ink,3);
const closeup=rect(47,143,106,64,blue,34)+circle(100,95,43,skin)+circle(86,92,3)+circle(114,92,3)+line('M90 112Q100 119 110 112');
const upper=`<g transform="translate(-40 8) scale(1.4)">${figure()}</g>`;
[closeup,upper,figure()].forEach((a,i)=>write('camera',i+3,`<defs><clipPath id="crop"><rect x="34" y="24" width="132" height="152" rx="4"/></clipPath></defs><g clip-path="url(#crop)">${a}</g>`+frame));
console.log('Wrote 43 SVG preset illustrations');
