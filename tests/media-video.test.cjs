const {test}=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs'),{MediaVideo}=loadTypeScript('components/ui/MediaVideo.tsx');
test('expired managed video returns through the auth API and preserves time/play intent with bounded retries',()=>{
 let tree;act(()=>{tree=create(React.createElement(MediaVideo,{src:'/api/v1/media/abc/file',controls:true}));});
 const node={currentTime:12,duration:40,error:{code:2},play:()=>Promise.resolve()};
 act(()=>tree.root.findByType('video').props.onPlay({currentTarget:node}));
 act(()=>tree.root.findByType('video').props.onError({currentTarget:node}));
 assert.equal(tree.root.findByType('video').props.src,'/api/v1/media/abc/file?media_retry=1');node.currentTime=0;
 act(()=>tree.root.findByType('video').props.onLoadedMetadata({currentTarget:node}));assert.equal(node.currentTime,12);
 act(()=>tree.root.findByType('video').props.onError({currentTarget:node}));act(()=>tree.root.findByType('video').props.onError({currentTarget:node}));
 assert.match(tree.root.findByType('video').props.src,/media_retry=2$/);act(()=>tree.unmount());
});
test('mock, blob and external video URLs are not rewritten on failure',()=>{
 for(const src of['blob:test','/video_1.mp4','https://example.test/video.mp4']){let tree;act(()=>{tree=create(React.createElement(MediaVideo,{src}));});act(()=>tree.root.findByType('video').props.onError({currentTarget:{currentTime:0}}));assert.equal(tree.root.findByType('video').props.src,src);act(()=>tree.unmount());}
});
