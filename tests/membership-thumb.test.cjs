const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
// 2026-11-07 사용자 결정: 멤버십은 어디서나 둥근 사각 사진 + 등록 크리에이터 아바타 배지, 사진이 없거나 열리지 않으면 크리에이터 아바타로 채운다.
const {MembershipThumb}=loadTypeScript('components/crefans/MembershipThumb.tsx',{'./membership-thumb.module.css':styles,'@/components/ui/Avatar':loadTypeScript('components/ui/Avatar.tsx',{'./avatar.module.css':styles})});
const creator={name:'크레팬스',image:'/creator.png'};
function render(props){let tree;act(()=>{tree=create(React.createElement(MembershipThumb,props));});return tree;}
const imgs=tree=>tree.root.findAll(node=>node.type==='img').map(node=>node.props.src);
test('photo shows the membership image with the creator avatar badge',()=>{
 const tree=render({image:'/plan.png',name:'맛집 탐험',creator,size:48});
 assert.equal(tree.root.findByProps({'data-membership-thumb':'photo'}).props['data-membership-thumb'],'photo');
 assert.deepEqual(imgs(tree),['/plan.png','/creator.png']);
 assert.equal(tree.root.findAllByProps({'data-membership-seller':true}).length,1);
 assert.equal(tree.root.findByProps({alt:'맛집 탐험 멤버십'}).props.src,'/plan.png');
});
test('no photo: the creator avatar fills the square and no badge is repeated',()=>{
 const tree=render({image:'',name:'찐팬 클럽',creator,size:48});
 assert.equal(tree.root.findByProps({'data-membership-thumb':'creator'}).props['data-membership-thumb'],'creator');
 assert.deepEqual(imgs(tree),['/creator.png']);
 assert.equal(tree.root.findAllByProps({'data-membership-seller':true}).length,0);
});
test('a photo that fails to load (e.g. a retired plan file) falls back to the creator avatar',()=>{
 const tree=render({image:'/gone.png',name:'옛 멤버십',creator,size:54});
 act(()=>tree.root.findByProps({alt:'옛 멤버십 멤버십'}).props.onError());
 assert.equal(tree.root.findByProps({'data-membership-thumb':'creator'}).props['data-membership-thumb'],'creator');
 assert.deepEqual(imgs(tree),['/creator.png']);
});
test('cover variant (membership join page) keeps the photo + creator badge rule at full width',()=>{
 const tree=render({image:'/plan.png',name:'맛집 탐험',creator,cover:true});
 const root=tree.root.findByProps({'data-membership-thumb':'photo'});
 assert.equal(root.props['data-membership-cover'],true);
 assert.deepEqual(imgs(tree),['/plan.png','/creator.png']);
 const none=render({image:undefined,name:'찐팬 클럽',creator,cover:true});
 assert.equal(none.root.findByProps({'data-membership-thumb':'creator'}).props['data-membership-cover'],true);
 assert.deepEqual(imgs(none),['/creator.png']);
});
