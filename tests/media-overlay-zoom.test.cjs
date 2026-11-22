// 2026-11-22 user request: photos in the feed media overlay can be pinch-zoomed like the AI result viewer (videos cannot),
// and a drag while zoomed pans the photo instead of changing slides.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const {MediaOverlay}=loadTypeScript('components/crefans/MediaOverlay.tsx');
const media=[{type:'image',url:'/a.png'},{type:'image',url:'/b.png'}];
const target={tagName:'IMG',closest:()=>null};
function swipe(scale){
 global.window={visualViewport:{scale}};const moves=[];let tree;
 act(()=>{tree=create(React.createElement(MediaOverlay,{media,title:'글',alt:'사진',index:0,onIndexChange:i=>moves.push(i),open:true,onClose(){}}),{createNodeMock:()=>({focus(){}})});});
 const stage=tree.root.find(n=>n.props?.onPointerDown&&n.props?.onPointerMove);
 act(()=>{stage.props.onPointerDown({isPrimary:true,button:0,pointerId:1,clientX:300,clientY:100,target});});
 act(()=>{stage.props.onPointerMove({pointerId:1,clientX:150,clientY:102});});
 act(()=>{stage.props.onPointerUp({pointerId:1,clientX:150,clientY:102});});
 act(()=>tree.unmount());delete global.window;return moves;
}
test('not zoomed: a left swipe goes to the next photo',()=>{assert.deepEqual(swipe(1),[1]);});
test('pinch-zoomed: the same drag pans the photo and keeps the slide',()=>{assert.deepEqual(swipe(2),[]);});
test('stage allows pinch-zoom; videos keep pan-y only',()=>{
 const css=fs.readFileSync(path.join(__dirname,'../components/crefans/social.module.css'),'utf8');
 assert.match(css,/\.stage\{[^}]*touch-action:pan-y pinch-zoom/);assert.match(css,/\.stageSlide video\{touch-action:pan-y\}/);
});
