const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const {DataTable}=loadTypeScript('components/ui/DataTable.tsx',{'./data-table.module.css':styles});
const {Pagination}=loadTypeScript('components/ui/Pagination.tsx',{'./pagination.module.css':styles});
const rows=[{id:'a',name:'가나다',amount:20},{id:'b',name:'다라마',amount:10},{id:'c',name:'나바다',amount:20},{id:'d',name:'미정',amount:null}];
const columns=[{key:'name',label:'이름',render:row=>row.name,sortValue:row=>row.name},{key:'amount',label:'금액',render:row=>String(row.amount),sortValue:row=>row.amount},{key:'id',label:'번호',render:row=>row.id}];
const base={rows,columns,rowKey:row=>row.id,sort:null,onSortChange(){},caption:'구독자 목록'};
function mount(Component,props){let tree;act(()=>{tree=create(React.createElement(Component,props));});return tree;}
function update(tree,Component,props){act(()=>tree.update(React.createElement(Component,props)));}
function close(tree){act(()=>tree.unmount());}
function ids(tree){return tree.root.findByType('tbody').findAllByType('tr').map(row=>row.findAllByType('td')[2].children.join(''));}

test('sortable headers cycle through ascending, descending and the supplied original order',()=>{
  const changes=[];
  const tree=mount(DataTable,{...base,onSortChange:value=>changes.push(value)});
  const click=index=>act(()=>tree.root.findAllByType('th')[index].findByType('button').props.onClick());
  assert.equal(tree.root.findAllByType('th')[2].findAllByType('button').length,0);
  click(1);
  assert.deepEqual(changes[0],{key:'amount',direction:'asc'});
  update(tree,DataTable,{...base,sort:changes[0],onSortChange:value=>changes.push(value)});
  assert.equal(tree.root.findAllByType('th')[1].props['aria-sort'],'ascending');
  click(1);
  assert.deepEqual(changes[1],{key:'amount',direction:'desc'});
  update(tree,DataTable,{...base,sort:changes[1],onSortChange:value=>changes.push(value)});
  assert.equal(tree.root.findAllByType('th')[1].props['aria-sort'],'descending');
  click(1);
  assert.equal(changes[2],null);
  click(0);
  assert.deepEqual(changes[3],{key:'name',direction:'asc'});
  update(tree,DataTable,base);
  assert.deepEqual(ids(tree),['a','b','c','d']);
  close(tree);
});

test('sorting is stable, keeps missing values last and never mutates supplied rows',()=>{
  const frozen=Object.freeze(rows.map(row=>Object.freeze({...row})));
  const tree=mount(DataTable,{...base,rows:frozen,sort:{key:'amount',direction:'asc'}});
  assert.deepEqual(ids(tree),['b','a','c','d']);
  update(tree,DataTable,{...base,rows:frozen,sort:{key:'amount',direction:'desc'}});
  assert.deepEqual(ids(tree),['a','c','b','d']);
  update(tree,DataTable,{...base,rows:frozen,sort:{key:'name',direction:'asc'}});
  assert.deepEqual(ids(tree),['a','c','b','d']);
  assert.deepEqual(frozen.map(row=>row.id),['a','b','c','d']);
  close(tree);
});

test('table sorting precedes slicing and out-of-range pages use the last available page',()=>{
  const props={...base,sort:{key:'amount',direction:'asc'},page:1,pageSize:2};
  const tree=mount(DataTable,props);
  assert.deepEqual(ids(tree),['b','a']);
  update(tree,DataTable,{...props,page:2});
  assert.deepEqual(ids(tree),['c','d']);
  update(tree,DataTable,{...props,page:9});
  assert.deepEqual(ids(tree),['c','d']);
  close(tree);
});

test('loading and empty states expose their actual status without sample rows',()=>{
  let calls=0;
  const tree=mount(DataTable,{...base,loading:true,onSortChange:()=>calls++});
  assert.equal(tree.root.findByType('table').props['aria-busy'],true);
  assert.equal(tree.root.findAllByProps({role:'status'}).length,1);
  const button=tree.root.findAllByType('button')[0];
  assert.equal(button.props.disabled,true);
  act(()=>button.props.onClick());
  assert.equal(calls,0);
  update(tree,DataTable,{...base,rows:[],emptyMessage:'아직 구독자가 없어요'});
  assert.equal(tree.root.findByType('tbody').findByType('td').children.join(''),'아직 구독자가 없어요');
  assert.equal(tree.root.findByType('tbody').findByType('td').props.colSpan,3);
  close(tree);
});

test('pagination offers compact page numbers, current-page semantics and bounded navigation',()=>{
  const changes=[];
  const props={page:5,totalItems:100,pageSize:10,onPageChange:page=>changes.push(page),label:'구독자 페이지'};
  const tree=mount(Pagination,props);
  assert.equal(tree.root.findByType('nav').props['aria-label'],'구독자 페이지');
  assert.equal(tree.root.findByProps({'aria-current':'page'}).children.join(''),'5');
  assert.deepEqual(tree.root.findAllByType('button').map(button=>button.children.join('')),['이전','1','4','5','6','10','다음']);
  assert.equal(tree.root.findAllByType('span').length,2);
  act(()=>tree.root.findByProps({'aria-label':'이전 페이지'}).props.onClick());
  act(()=>tree.root.findByProps({'aria-label':'다음 페이지'}).props.onClick());
  act(()=>tree.root.findByProps({'aria-label':'10페이지'}).props.onClick());
  assert.deepEqual(changes,[4,6,10]);
  update(tree,Pagination,{...props,page:1});
  assert.equal(tree.root.findByProps({'aria-label':'이전 페이지'}).props.disabled,true);
  act(()=>tree.root.findByProps({'aria-label':'이전 페이지'}).props.onClick());
  update(tree,Pagination,{...props,page:10});
  assert.equal(tree.root.findByProps({'aria-label':'다음 페이지'}).props.disabled,true);
  act(()=>tree.root.findByProps({'aria-label':'다음 페이지'}).props.onClick());
  assert.deepEqual(changes,[4,6,10]);
  close(tree);
});

test('empty and single-page pagination disable every navigation action',()=>{
  for(const totalItems of [0,1,10]){
    let calls=0;
    const tree=mount(Pagination,{page:1,totalItems,pageSize:10,onPageChange:()=>calls++});
    for(const button of tree.root.findAllByType('button')){
      assert.equal(button.props.disabled,true);
      act(()=>button.props.onClick());
    }
    assert.equal(calls,0);
    close(tree);
  }
});
