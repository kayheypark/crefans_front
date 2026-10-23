const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const {MetricCard}=loadTypeScript('components/crefans/studio/OverviewPages.tsx',{
 './overview.module.css':styles,'./phone-frame.module.css':styles,'./choice.module.css':styles,'../CreatorPages':{CreatorProfilePage:()=>null},
 '@/components/ui/DialogActions':{},'@/components/ui/Toggle':{Toggle:()=>null},
 '@/components/ui/SelectField':{},
 '@/components/ui/Primitives':{},
 '../ServiceUI':{},
 '@/components/ui/Charts':{Trend:()=>null},
 '@/components/ui/TextLink':{TextLink:props=>React.createElement('a',props)},
});
const {useMockOverview}=loadTypeScript('components/preview/studio/useMockOverview.ts',{react:React});
const metric={id:'followers',label:'팔로워',value:'12,400명',description:'전체 팔로워',points:[]};
function mount(value=metric){let view;act(()=>{view=create(React.createElement(MetricCard,{metric:value,href:'/preview/studio/reports/followers'}));});return view;}

test('metric card renders the injected value verbatim without a toggle and keeps the report link',()=>{
 for(const input of [metric,{...metric,id:'members',value:'128'}]){
  const view=mount(input);
  try{
   assert.equal(view.root.findByType('strong').children.join(''),input.value);
   assert.equal(view.root.findAllByType('button').length,0);
   assert.equal(view.root.findByType('a').props.href,'/preview/studio/reports/followers');
  }finally{act(()=>view.unmount());}
 }
});

test('mock dashboard formats followers as a fixed "{count}명" from the exact count',()=>{
 function Probe({creator}){const model=useMockOverview(creator,()=>{});return React.createElement('span',null,model.metrics.find(item=>item.id==='followers').value);}
 const cases=[[{id:'haneul',name:'하늘',handle:'haneul',followers:'12.4K',followerCount:12400},'12,400명'],[{id:'x',name:'x',handle:'x',followers:'8.2K'},'0명'],[undefined,'0명']];
 for(const [creator,expected] of cases){
  let view;act(()=>{view=create(React.createElement(Probe,{creator}));});
  try{assert.equal(view.root.findByType('span').children.join(''),expected);}finally{act(()=>view.unmount());}
 }
});
