const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const {buildDateRangePresets,calendarWeeks,addMonths,startOfWeek}=loadTypeScript('components/ui/date-range.ts');
const {DateRangePicker}=loadTypeScript('components/ui/DateRangePicker.tsx',{
  './date-range-picker.module.css':styles,
  './Primitives':{Button:({loading,tone,...props})=>React.createElement('button',{...props,disabled:props.disabled||loading})},
});
const h=React.createElement;
const range=(startDate,endDate)=>({startDate,endDate});
const preset=(list,id)=>list.find(item=>item.id===id).range;

test('presets are anchored to the reference day with Monday weeks and calendar months',()=>{
  const list=buildDateRangePresets('2026-09-12','2025-03-05');
  assert.deepEqual(list.map(item=>item.label),['이번주','저번주','이번달','저번달','최근 1주일','최근 한달','최근 3개월','최근 6개월','최근 1년','최근 3년','전체 기간']);
  assert.deepEqual(preset(list,'this-week'),range('2026-09-07','2026-09-12'));
  assert.deepEqual(preset(list,'last-week'),range('2026-08-31','2026-09-06'));
  assert.deepEqual(preset(list,'this-month'),range('2026-09-01','2026-09-12'));
  assert.deepEqual(preset(list,'last-month'),range('2026-08-01','2026-08-31'));
  assert.deepEqual(preset(list,'recent-1w'),range('2026-09-06','2026-09-12'));
  assert.deepEqual(preset(list,'recent-1m'),range('2026-08-13','2026-09-12'));
  assert.deepEqual(preset(list,'recent-3m'),range('2026-06-13','2026-09-12'));
  assert.deepEqual(preset(list,'recent-6m'),range('2026-03-13','2026-09-12'));
  assert.deepEqual(preset(list,'recent-1y'),range('2025-09-13','2026-09-12'));
  assert.deepEqual(preset(list,'recent-3y'),range('2023-09-13','2026-09-12'));
  assert.deepEqual(preset(list,'all'),range('2025-03-05','2026-09-12'));
  assert.deepEqual(preset(buildDateRangePresets('2026-09-12',null),'all'),range('2026-09-12','2026-09-12'));
  assert.deepEqual(preset(buildDateRangePresets('2026-03-31'),'last-month'),range('2026-02-01','2026-02-28'));
  assert.equal(addMonths('2026-03-31',-1),'2026-02-28');
  assert.equal(startOfWeek('2026-09-13'),'2026-09-07');
});

test('calendar grids always span six Monday-first weeks including adjacent-month days',()=>{
  const weeks=calendarWeeks('2026-09-01');
  assert.equal(weeks.length,6);assert.ok(weeks.every(week=>week.length===7));
  assert.equal(weeks[0][0],'2026-08-31');assert.equal(weeks[0][1],'2026-09-01');assert.equal(weeks[5][6],'2026-10-11');
});

function mount(overrides={}){
  const calls=[];
  const props={label:'조회 기간',value:range('2026-08-13','2026-09-12'),defaultValue:range('2026-08-13','2026-09-12'),maxDate:'2026-09-12',minDate:'2026-08-31',onApply:async next=>{calls.push(next);return {success:true};},...overrides};
  let view;act(()=>{view=create(h(DateRangePicker,props));});
  const buttons=()=>view.root.findAllByType('button');
  const button=label=>buttons().find(item=>item.props['aria-label']===label||item.children.join('')===label||(label==='조회 기간'&&item.props['aria-haspopup']==='dialog'));
  const cell=date=>view.root.findAll(node=>node.type==='td'&&node.props['data-range']!==undefined&&node.findAllByType('button').some(item=>item.props['data-date']===date))[0];
  const cells=date=>view.root.findAll(node=>node.type==='td'&&node.findAllByType('button').some(item=>item.props['data-date']===date));
  return {view,calls,button,cell,cells,dialog:()=>view.root.findAllByProps({role:'dialog'}).find(item=>item.props['data-open']===true),unmount:()=>act(()=>view.unmount())};
}

test('trigger opens the calendar with a status, presets, and three actions; cancel discards the draft',()=>{
  const picker=mount();
  try{
    assert.equal(picker.view.root.findAllByProps({role:'dialog'}).length,0);
    assert.match(JSON.stringify(picker.view.toJSON()),/최근 한달/);
    act(()=>picker.button('조회 기간').props.onClick());
    assert.ok(picker.dialog());
    assert.equal(picker.view.root.findAllByProps({role:'grid'}).length,2);
    assert.deepEqual(['초기화','취소','적용'].map(label=>!!picker.button(label)),[true,true,true]);
    assert.equal(picker.view.root.findByProps({role:'status'}).children.join(''),'2026.08.13 ~ 2026.09.12');
    assert.equal(picker.view.root.findAllByProps({role:'group'})[0].findAllByType('button').find(item=>item.props['aria-pressed']).children.join(''),'최근 한달');
    act(()=>picker.button('2026년 9월 3일').props.onClick());
    assert.match(picker.view.root.findByProps({role:'status'}).children.join(''),/9월 3일부터/);
    act(()=>picker.button('취소').props.onClick());
    assert.equal(picker.dialog(),undefined);assert.deepEqual(picker.calls,[]);
    act(()=>picker.button('조회 기간').props.onClick());
    assert.equal(picker.view.root.findByProps({role:'status'}).children.join(''),'2026.08.13 ~ 2026.09.12');
  }finally{picker.unmount();}
});

test('range cells stay filled across month boundaries and faded adjacent-month days, ordering swaps and future days are blocked',async()=>{
  const picker=mount();
  try{
    act(()=>picker.button('조회 기간').props.onClick());
    act(()=>picker.button('2026년 9월 3일').props.onClick());
    act(()=>picker.button('2026년 8월 28일').props.onClick());
    assert.equal(picker.view.root.findByProps({role:'status'}).children.join(''),'2026.08.28 ~ 2026.09.03');
    const septemberGrid=picker.view.root.findAllByProps({role:'grid'})[1];
    const leading=septemberGrid.findAllByType('td').find(td=>td.findByType('button').props['data-date']==='2026-08-31');
    assert.equal(leading.props['data-outside'],true);assert.equal(leading.props['data-range'],true);
    assert.equal(leading.findByType('button').props['data-outside'],true);
    const augustGrid=picker.view.root.findAllByProps({role:'grid'})[0];
    const trailing=augustGrid.findAllByType('td').find(td=>td.findByType('button').props['data-date']==='2026-09-03');
    assert.equal(trailing.props['data-outside'],true);assert.equal(trailing.props['data-range'],true);assert.equal(trailing.props['data-edge'],'end');
    const start=augustGrid.findAllByType('td').find(td=>td.findByType('button').props['data-date']==='2026-08-28');
    assert.equal(start.props['data-edge'],'start');assert.equal(start.findByType('button').props['data-selected'],true);
    assert.equal(augustGrid.findAllByType('td').filter(td=>td.props['data-range']).length,7);
    assert.ok(picker.button('2026년 9월 13일').props.disabled);
    assert.ok(picker.button('다음 달').props.disabled);
    await act(async()=>{await picker.button('적용').props.onClick();});
    assert.deepEqual(picker.calls,[range('2026-08-28','2026-09-03')]);
    assert.equal(picker.dialog(),undefined);
  }finally{picker.unmount();}
});

test('presets fill the draft, reset restores the default, and apply failures stay open with the message',async()=>{
  const picker=mount({value:range('2026-09-01','2026-09-12'),onApply:async()=>({success:false,errorMessage:'기록 범위를 벗어났습니다.'})});
  try{
    act(()=>picker.button('조회 기간').props.onClick());
    act(()=>picker.button('전체 기간').props.onClick());
    assert.equal(picker.view.root.findByProps({role:'status'}).children.join(''),'2026.08.31 ~ 2026.09.12');
    assert.equal(picker.button('전체 기간').props['aria-pressed'],true);
    act(()=>picker.button('최근 3년').props.onClick());
    assert.equal(picker.view.root.findByProps({role:'status'}).children.join(''),'2023.09.13 ~ 2026.09.12');
    assert.match(picker.view.root.findAllByProps({role:'grid'})[1].props['aria-label'],/2026년 9월/);
    act(()=>picker.button('초기화').props.onClick());
    assert.equal(picker.view.root.findByProps({role:'status'}).children.join(''),'2026.08.13 ~ 2026.09.12');
    assert.equal(picker.button('최근 한달').props['aria-pressed'],true);
    await act(async()=>{await picker.button('적용').props.onClick();});
    assert.ok(picker.dialog());
    assert.equal(picker.view.root.findByProps({role:'alert'}).children.join(''),'기록 범위를 벗어났습니다.');
    act(()=>picker.button('2026년 9월 5일').props.onClick());
    assert.equal(picker.view.root.findAllByProps({role:'alert'}).length,0);
    assert.ok(picker.button('적용').props.disabled);
  }finally{picker.unmount();}
});
