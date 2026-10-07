const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const {createStudioReport,createMockFollowerHistory,currentActiveSubscribers,useMockReports,validateReportDateRange}=loadTypeScript('components/preview/studio/useMockReports.ts');
const {createInitialFinanceState}=loadTypeScript('components/preview/studio/finance-fixtures.ts');
const {calculateFinanceSummary}=loadTypeScript('components/preview/studio/useMockFinance.ts');
const {managementSubscribers}=loadTypeScript('components/preview/studio/management-fixtures.ts');
const metric=(report,id)=>report.summary.find(item=>item.id===id).value;
function sources(){
  const state=createInitialFinanceState();
  return {finance:{data:{...state,summary:calculateFinanceSummary(state)}},management:{subscribers:managementSubscribers},followers:12400,today:'2026-09-12'};
}

test('revenue reports reconcile the ledger, combine same-day entries, and preserve supplied records',()=>{
  const input=sources(),before=JSON.stringify(input);
  const report=createStudioReport('revenue',input,'all');
  assert.equal(report.rows.length,2);
  assert.deepEqual(report.rows[0].values,{gross:1990000,reversals:99000,fees:189100,net:1701900});
  assert.equal(metric(report,'net'),input.finance.data.summary.net);
  assert.equal(metric(report,'net'),metric(report,'gross')-metric(report,'reversals')-metric(report,'fees'));
  assert.equal(report.chart.items.reduce((total,item)=>total+item.value,0),metric(report,'net'));
  assert.equal(JSON.stringify(input),before);
});

test('report periods include both date boundaries, exclude future records, and scope every revenue metric',()=>{
  const input=sources();
  input.finance.data.earnings=['2026-08-13','2026-08-14','2026-09-05','2026-09-06','2026-09-12','2026-09-13'].map((date,index)=>({id:`entry-${index}`,date,gross:100,reversals:20,fees:10,net:70}));
  const seven=createStudioReport('revenue',input,'7d'),month=createStudioReport('revenue',input,'30d');
  assert.deepEqual(seven.rows.map(row=>row.date),['2026-09-06','2026-09-12']);
  assert.deepEqual(month.rows.map(row=>row.date),['2026-08-14','2026-09-05','2026-09-06','2026-09-12']);
  assert.equal(metric(seven,'net'),140);
  assert.equal(metric(month,'net'),280);
  assert.ok(seven.summary.every(item=>item.label.startsWith('기간')));
  assert.ok(month.summary.every(item=>item.label.startsWith('기간')));
});

test('subscriber counts honor inclusive access dates, cancelled access, and expired status',()=>{
  const subscribers=[
    {id:'active',status:'active',joinedAt:'2026-08-01',renewAt:'2026-09-12'},
    {id:'cancelled',status:'cancelled',joinedAt:'2026-08-02',renewAt:'2026-09-12'},
    {id:'expired',status:'expired',joinedAt:'2026-08-03',renewAt:'2026-09-12'},
    {id:'past',status:'expired',joinedAt:'2026-08-01',renewAt:'2026-09-01'},
    {id:'future',status:'active',joinedAt:'2026-09-13',renewAt:'2026-10-13'},
  ];
  assert.equal(currentActiveSubscribers(subscribers,'2026-09-12'),2);
  const input={...sources(),management:{subscribers}},report=createStudioReport('subscribers',input,'all');
  assert.equal(metric(report,'current'),2);
  assert.equal(report.rows.at(-1).values.active,2);
  assert.equal(report.chart.items.at(-1).value,2);
  assert.equal(metric(report,'joined'),4);
  assert.equal(metric(report,'ended'),2);
  assert.equal(report.rows.find(row=>row.date==='2026-09-01').values.ended,0);
  assert.equal(report.rows.find(row=>row.date==='2026-09-02').values.ended,1);
  let prior=0;
  for(const row of report.rows){
    assert.equal(row.values.change,row.values.joined-row.values.ended);
    assert.equal(row.values.active,prior+row.values.change);
    prior=row.values.active;
  }
});

test('subscriber period changes filter events without resetting the opening population',()=>{
  const input=sources(),seven=createStudioReport('subscribers',input,'7d'),all=createStudioReport('subscribers',input,'all');
  assert.equal(seven.rows.length,7);
  assert.equal(seven.rows[0].date,'2026-09-06');
  assert.equal(seven.rows[0].values.active,2);
  assert.equal(metric(seven,'joined'),0);
  assert.equal(metric(seven,'ended'),0);
  assert.equal(metric(all,'joined'),3);
  assert.equal(metric(all,'ended'),1);
  assert.equal(metric(seven,'current'),metric(all,'current'));
});

test('synthetic follower changes are deterministic and reconcile to the injected current count',()=>{
  const history=createMockFollowerHistory(12400,'2026-09-12');
  assert.equal(history.length,30);
  assert.equal(history[0].date,'2026-08-14');
  assert.equal(history.at(-1).values.followers,12400);
  assert.deepEqual(history,createMockFollowerHistory(12400,'2026-09-12'));
  for(let index=1;index<history.length;index++){
    const previous=history[index-1].values,current=history[index].values;
    assert.equal(current.followers,previous.followers+current.gained-current.lost);
    assert.equal(current.change,current.gained-current.lost);
    assert.ok(Object.values(current).every(value=>Number.isFinite(value)&&value>=0));
  }
  const report=createStudioReport('followers',sources(),'7d');
  assert.deepEqual(report.rows,history.slice(-7));
  assert.equal(metric(report,'current'),12400);
  assert.equal(metric(report,'change'),metric(report,'gained')-metric(report,'lost'));
  assert.match(report.coverageNotice,/최근 30일/);
});

test('empty sources retain missing endpoint values and totals stay zero without fabricated examples',()=>{
  const input=sources();
  input.finance.data={...input.finance.data,earnings:[],summary:{...input.finance.data.summary,gross:0,reversals:0,fees:0,net:0}};
  input.management.subscribers=[];input.followers=0;
  for(const id of ['revenue','subscribers','followers']){
    const report=createStudioReport(id,input,'30d');
    assert.deepEqual(report.rows,[]);
    assert.deepEqual(report.chart.items,[]);
    assert.ok(report.summary.every(item=>item.id==='current'?item.value===null:item.value===0));
    assert.equal(report.availableRange,null);
  }
  input.finance.data.earnings=[{id:'refunded',date:'2026-09-12',gross:1000,reversals:1000,fees:0,net:0}];
  const refunded=createStudioReport('revenue',input,'7d');
  assert.equal(refunded.rows.length,1);
  assert.equal(refunded.rows[0].values.net,0);
  assert.equal(metric(refunded,'reversals'),1000);
});

test('each report retains its applied range and refreshes with injected source changes',async()=>{
  let result,tree;
  function Probe({input}){result=useMockReports(input);return null;}
  const input=sources(),week={startDate:'2026-09-06',endDate:'2026-09-12'},month={startDate:'2026-08-13',endDate:'2026-09-12'};
  act(()=>{tree=create(React.createElement(Probe,{input}));});
  assert.deepEqual(result.reports.revenue.dateRange,month);assert.deepEqual(result.reports.revenue.defaultRange,month);
  assert.equal(result.reports.revenue.minDate,'2026-08-31');assert.equal(result.reports.revenue.maxDate,'2026-09-12');
  await act(async()=>{await result.reports.revenue.applyDateRange(week);});
  assert.deepEqual(result.reports.revenue.dateRange,week);
  assert.deepEqual(result.reports.subscribers.dateRange,month);
  assert.deepEqual(result.reports.followers.dateRange,month);
  act(()=>tree.update(React.createElement(Probe,{input:{...input,followers:12500}})));
  assert.deepEqual(result.reports.revenue.dateRange,week);
  assert.equal(result.reports.followers.response.success,true);
  assert.equal(metric(result.reports.followers.response.data,'current'),12500);
  assert.equal(result.reports.followers.response.data.chart.items.at(-1).value,12500);
  act(()=>tree.unmount());
});

test('custom revenue ranges include both boundaries and reconcile summary, chart, and rows',()=>{
  const input=sources();
  input.finance.data.earnings=['2026-09-01','2026-09-02','2026-09-03','2026-09-04'].map((date,index)=>({id:`custom-${index}`,date,gross:100*(index+1),reversals:0,fees:10,net:100*(index+1)-10}));
  const range={startDate:'2026-09-02',endDate:'2026-09-03'},report=createStudioReport('revenue',input,'custom',range);
  assert.deepEqual(report.dateRange,range);
  assert.equal(report.periodLabel,'2026.09.02 ~ 2026.09.03');
  assert.deepEqual(report.rows.map(row=>row.date),['2026-09-02','2026-09-03']);
  assert.deepEqual(report.chart.items.map(item=>item.id),report.rows.map(row=>row.id));
  for(const key of ['gross','reversals','fees','net'])assert.equal(metric(report,key),report.rows.reduce((total,row)=>total+row.values[key],0));
  assert.equal(report.chart.items.reduce((total,item)=>total+item.value,0),480);
  const single=createStudioReport('revenue',input,'custom',{startDate:'2026-09-02',endDate:'2026-09-02'});
  assert.equal(single.rows.length,1);assert.equal(metric(single,'net'),190);
});

test('historical subscriber and follower endpoint metrics use the selected end date',()=>{
  const input=sources();
  const subscribers=createStudioReport('subscribers',input,'custom',{startDate:'2026-08-01',endDate:'2026-09-01'});
  assert.equal(metric(subscribers,'current'),3);
  assert.equal(subscribers.rows.at(-1).values.active,3);
  assert.equal(subscribers.chart.items.at(-1).value,3);
  assert.match(subscribers.summary[0].label,/선택 기간 종료일/);
  const followers=createStudioReport('followers',input,'custom',{startDate:'2026-08-20',endDate:'2026-08-25'});
  assert.equal(followers.rows.length,6);
  assert.equal(metric(followers,'current'),followers.rows.at(-1).values.followers);
  assert.equal(metric(followers,'current'),followers.chart.items.at(-1).value);
  assert.ok(metric(followers,'current')<input.followers);
  assert.equal(metric(followers,'change'),metric(followers,'gained')-metric(followers,'lost'));
});

test('ranges outside available history stay empty and partially covered follower ranges never extrapolate',()=>{
  const input=sources(),past={startDate:'2000-01-01',endDate:'2000-02-01'};
  for(const id of ['revenue','subscribers','followers']){
    const report=createStudioReport(id,input,'custom',past);
    assert.deepEqual(report.dateRange,past);assert.deepEqual(report.rows,[]);assert.deepEqual(report.chart.items,[]);
    assert.ok(report.summary.every(item=>item.id==='current'?item.value===null:item.value===0));
    assert.match(report.coverageNotice,/선택한 기간에 제공된 기록이 없습니다/);
    assert.ok(report.availableRange.startDate>past.endDate);
  }
  const partial=createStudioReport('followers',input,'custom',{startDate:'2026-01-01',endDate:'2026-08-15'});
  assert.deepEqual(partial.rows.map(row=>row.date),['2026-08-14','2026-08-15']);
  assert.equal(partial.chart.items.length,2);
  assert.deepEqual(partial.availableRange,{startDate:'2026-08-14',endDate:'2026-09-12'});
  assert.match(partial.coverageNotice,/30일/);assert.match(partial.coverageNotice,/추정하여 채우지 않습니다/);
});

test('date range validation rejects blank, invalid, reversed and future dates while accepting valid leap days',()=>{
  for(const range of [{startDate:'',endDate:'2026-09-12'},{startDate:'2026-02-30',endDate:'2026-09-12'},{startDate:'2026-9-1',endDate:'2026-09-12'},{startDate:'0000-01-01',endDate:'2026-09-12'}]){
    const result=validateReportDateRange(range,'2026-09-12');assert.equal(result.success,false);assert.equal(result.data,null);assert.equal(result.errorCode,'INVALID_DATE_RANGE');assert.ok(result.errorMessage);
  }
  assert.equal(validateReportDateRange({startDate:'2026-09-10',endDate:'2026-09-09'},'2026-09-12').errorCode,'REVERSED_DATE_RANGE');
  assert.equal(validateReportDateRange({startDate:'2026-09-12',endDate:'2026-09-13'},'2026-09-12').errorCode,'FUTURE_DATE_RANGE');
  const leap={startDate:'2024-02-29',endDate:'2024-02-29'};
  assert.deepEqual(validateReportDateRange(leap,'2026-09-12'),{success:true,data:leap,errorMessage:null,errorCode:null});
});

test('custom query application preserves previous results on validation failure and isolates report state',async()=>{
  let result,tree;const input=sources();
  function Probe({input}){result=useMockReports(input);return null;}
  act(()=>{tree=create(React.createElement(Probe,{input}));});
  try{
    const original=JSON.stringify(result.reports.subscribers.response.data);
    assert.deepEqual(result.reports.subscribers.dateRange,{startDate:'2026-08-13',endDate:'2026-09-12'});
    let response;await act(async()=>{response=await result.reports.subscribers.applyDateRange({startDate:'2026-09-12',endDate:'2026-09-01'});});
    assert.equal(response.success,false);assert.equal(JSON.stringify(result.reports.subscribers.response.data),original);
    const range={startDate:'2026-08-01',endDate:'2026-09-01'};
    await act(async()=>{response=await result.reports.subscribers.applyDateRange(range);});
    assert.equal(response.success,true);assert.deepEqual(result.reports.subscribers.dateRange,range);
    assert.deepEqual(result.reports.revenue.dateRange,{startDate:'2026-08-13',endDate:'2026-09-12'});assert.deepEqual(result.reports.followers.dateRange,{startDate:'2026-08-13',endDate:'2026-09-12'});
    act(()=>tree.update(React.createElement(Probe,{input:{...input,followers:12500}})));
    assert.deepEqual(result.reports.subscribers.dateRange,range);
    await act(async()=>{await result.reports.subscribers.applyDateRange({startDate:'2026-09-06',endDate:'2026-09-12'});});
    assert.deepEqual(result.reports.subscribers.dateRange,{startDate:'2026-09-06',endDate:'2026-09-12'});
  }finally{act(()=>tree.unmount());}
});

const h=React.createElement,styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
let chartMounts=0;
function ChartProbe({items}){React.useEffect(()=>{chartMounts++;},[]);return h('div',{'data-chart-items':items});}
const {ReportPage}=loadTypeScript('components/crefans/studio/ReportPage.tsx',{
  './report.module.css':styles,'./data-table.module.css':styles,'./pagination.module.css':styles,'./date-range-picker.module.css':styles,
  '@/components/ui/Charts':{BarChart:ChartProbe},
  './Primitives':{Button:({loading,tone,...props})=>h('button',{...props,disabled:props.disabled||loading})},
  '@/components/ui/TextLink':{TextLink:props=>h('a',props)},
  './ServiceUI':{Empty:({title,description})=>h('div',null,h('h3',null,title),h('p',null,description))},
  '../ServiceUI':{Empty:({title,description})=>h('div',null,h('h3',null,title),h('p',null,description))},
});
const viewText=tree=>JSON.stringify(tree.toJSON());
const visibleDates=tree=>tree.root.findAllByType('tbody').flatMap(body=>body.findAllByType('time')).map(item=>item.props.dateTime);

test('report view edits drafts without changing the chart and resets sorting and paging only after application',async()=>{
  let model,tree;chartMounts=0;
  function Probe(){model=useMockReports(sources()).reports.subscribers;return h(ReportPage,{model,basePath:'/preview/studio'});}
  act(()=>{tree=create(h(Probe));});
  try{
    assert.equal(chartMounts,1);
    const button=label=>tree.root.findAllByType('button').find(item=>item.props['aria-label']===label||item.children.join('')===label||(label==='조회 기간'&&item.props['aria-haspopup']==='dialog'));
    act(()=>button('조회 기간').props.onClick());
    assert.equal(tree.root.findByProps({role:'dialog'}).props['data-open'],true);
    act(()=>button('신규 가입: 오름차순 정렬').props.onClick());
    act(()=>button('2페이지').props.onClick());
    const rowsBefore=visibleDates(tree),reportBefore=JSON.stringify(model.response.data);
    act(()=>button('2026년 8월 20일').props.onClick());
    act(()=>button('2026년 9월 1일').props.onClick());
    assert.equal(JSON.stringify(model.response.data),reportBefore);assert.deepEqual(visibleDates(tree),rowsBefore);
    assert.equal(chartMounts,1);assert.equal(tree.root.findByType(ChartProbe).props.items.length,31);
    await act(async()=>{await button('적용').props.onClick();});
    assert.deepEqual(model.dateRange,{startDate:'2026-08-20',endDate:'2026-09-01'});
    assert.equal(tree.root.findAllByProps({role:'dialog'}).filter(item=>item.props['data-open']===true).length,0);
    assert.equal(visibleDates(tree)[0],'2026-08-20');
    assert.ok(tree.root.findAllByType('th').filter(cell=>'aria-sort' in cell.props).every(cell=>cell.props['aria-sort']==='none'));
    assert.equal(tree.root.findAllByType('button').find(button=>button.props['aria-label']==='1페이지').props['aria-current'],'page');
    assert.equal(tree.root.findByType(ChartProbe).props.items.length,13);assert.equal(chartMounts,1);
    assert.equal(metric(model.response.data,'current'),3);
  }finally{act(()=>tree.unmount());}
});

test('report view displays missing metric values explicitly and sorts nullable cells without substituting numbers',()=>{
  const report=createStudioReport('revenue',sources(),'all');
  report.summary[0]={...report.summary[0],value:null};
  report.rows=[
    {id:'missing',date:'2026-09-03',values:{gross:null}},
    {id:'larger',date:'2026-09-01',values:{gross:100}},
    {id:'smaller',date:'2026-09-02',values:{gross:10}},
  ];
  const model={response:{success:true,data:report,errorMessage:null,errorCode:null},dateRange:report.dateRange,defaultRange:report.dateRange,minDate:report.availableRange?.startDate??null,maxDate:'2026-09-12',async applyDateRange(){throw new Error('Not used');}};
  let tree;act(()=>{tree=create(h(ReportPage,{model,basePath:'/preview/studio'}));});
  try{
    assert.match(viewText(tree),/기록 없음/);
    const sort=label=>act(()=>tree.root.findAllByType('button').find(button=>button.props['aria-label']===label).props.onClick());
    assert.deepEqual(visibleDates(tree),['2026-09-03','2026-09-01','2026-09-02']);
    sort('매출: 오름차순 정렬');assert.deepEqual(visibleDates(tree),['2026-09-02','2026-09-01','2026-09-03']);
    sort('매출: 내림차순 정렬');assert.deepEqual(visibleDates(tree),['2026-09-01','2026-09-02','2026-09-03']);
    sort('매출: 기본 순서로 보기');assert.deepEqual(visibleDates(tree),['2026-09-03','2026-09-01','2026-09-02']);
    const missingRow=tree.root.findByType('tbody').findAllByType('tr')[0];
    assert.equal(missingRow.findAllByType('td')[1].findByType('span').children[0],'-');
  }finally{act(()=>tree.unmount());}
});
