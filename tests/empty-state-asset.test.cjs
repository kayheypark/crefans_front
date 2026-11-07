const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const ASSET='/brand/empty/empty-page-v1.svg';
const nextLink={__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
const {Empty}=loadTypeScript('components/crefans/ServiceUI.tsx',{'next/link':nextLink});
const {EmptyState}=loadTypeScript('components/ui/Primitives.tsx');
const {DataTable}=loadTypeScript('components/ui/DataTable.tsx');
const {ApiState}=loadTypeScript('components/crefans/ApiState.tsx',{'next/link':nextLink});
function render(element){let tree;act(()=>{tree=create(element);});return tree;}
function images(tree){return tree.root.findAll(node=>node.type==='img');}
function decorativeAsset(img){assert.equal(img.props.src,ASSET);assert.equal(img.props.alt,'');assert.equal(img.props['aria-hidden'],'true');}

test('the console empty-page asset is a copied local file, not a runtime link to the console',()=>{
  const file=path.resolve(__dirname,'..','public',ASSET.slice(1));
  const svg=fs.readFileSync(file,'utf8');
  assert.match(svg,/^<svg [^>]*viewBox="0 0 36 44"/);
  assert.match(svg,/M7 1h22a6 6 0 0 1 6 6v23L22 43H7a6 6 0 0 1-6-6V7a6 6 0 0 1 6-6Z/,'page path from crefans_admin EmptyState');
  assert.match(svg,/M22 43v-7a6 6 0 0 1 6-6h7Z/,'folded corner path from crefans_admin EmptyState');
  const source=JSON.parse(fs.readFileSync(file.replace(/\.svg$/,'.source.json'),'utf8'));
  assert.equal(source.sha256,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'));
  assert.equal(source.runtimeDependency,false);
});

test('service Empty shows the decorative asset above the kept title, description and action',()=>{
  const tree=render(React.createElement(Empty,{title:'아직 게시물이 없어요',description:'첫 게시물을 올려 보세요.',action:React.createElement('button',null,'작성하기')}));
  const [img]=images(tree);decorativeAsset(img);
  const root=tree.root.findByProps({role:'status'});
  assert.equal(tree.toJSON().children[0].type,'img','asset comes first');
  assert.deepEqual(root.findAllByType('p').map(p=>p.children.join('')),['아직 게시물이 없어요','첫 게시물을 올려 보세요.']);
  assert.equal(root.findByType('button').children.join(''),'작성하기');
});

test('non-empty notices that reuse Empty opt out of the asset',()=>{
  const tree=render(React.createElement(Empty,{title:'게시물을 찾을 수 없어요',illustration:false}));
  assert.equal(images(tree).length,0);
  assert.equal(tree.root.findByProps({role:'status'}).findByType('p').children.join(''),'게시물을 찾을 수 없어요');
});

test('design-system EmptyState and an empty DataTable show the same asset',()=>{
  decorativeAsset(images(render(React.createElement(EmptyState,{title:'빈 목록',description:'설명'})))[0]);
  const table=render(React.createElement(DataTable,{rows:[],columns:[{key:'a',label:'A',render:()=>'x'}],rowKey:()=>'a',sort:null,onSortChange(){},caption:'표'}));
  decorativeAsset(images(table)[0]);
});

test('loading and error states never show the empty asset',()=>{
  const loadingTable=render(React.createElement(DataTable,{rows:[],loading:true,columns:[{key:'a',label:'A',render:()=>'x'}],rowKey:()=>'a',sort:null,onSortChange(){},caption:'표'}));
  assert.equal(images(loadingTable).length,0);
  const filled=render(React.createElement(DataTable,{rows:[{id:'1'}],columns:[{key:'a',label:'A',render:()=>'x'}],rowKey:row=>row.id,sort:null,onSortChange(){},caption:'표'}));
  assert.equal(images(filled).length,0);
  const error=render(React.createElement(ApiState,{response:{success:false,data:null,errorMessage:'서버 오류',errorCode:'E1'},children:()=>null}));
  assert.equal(error.root.findAllByProps({role:'alert'}).length,1);
  assert.equal(images(error).length,0);
});
