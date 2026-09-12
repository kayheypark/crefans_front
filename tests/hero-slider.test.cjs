const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const {create, act} = require('react-test-renderer');
const {loadTypeScript} = require('./load-typescript.cjs');
const Slider = loadTypeScript('components/landing/HeroSlider.tsx', {
  './landing.module.css': new Proxy({}, {get: (_, key) => String(key)}),
  'next/image': {__esModule: true, default: () => null},
}).default;

test('slider advances, pauses for selection and distinguishes swipe from vertical scroll', () => {
  let timer;
  const saved = {window: global.window, document: global.document, IntersectionObserver: global.IntersectionObserver};
  global.window = {
    matchMedia: () => ({matches:false, addEventListener(){}, removeEventListener(){}}),
    setTimeout(callback, delay){ assert.equal(delay,5000); timer=callback; return 1; },
    clearTimeout(){timer=undefined;},
  };
  global.document = {hidden:false, addEventListener(){}, removeEventListener(){}};
  global.IntersectionObserver = class {constructor(callback){this.callback=callback;} observe(){this.callback([{isIntersecting:true}]);} disconnect(){}};
  let renderer;
  try {
    act(() => {renderer=create(React.createElement(Slider), {createNodeMock:()=>({})});});
    const category = () => renderer.root.findAllByType('button').find(b=>b.props['aria-pressed']).children[0];
    assert.equal(category(),'운동');
    act(()=>timer());
    assert.equal(category(),'게임');
    act(()=>renderer.root.findAllByType('button').find(b=>b.children[0]==='댄스').props.onClick());
    assert.equal(category(),'댄스');
    assert.equal(timer,undefined);
    const region=renderer.root.findByProps({role:'region'});
    act(()=>region.props.onTouchStart({touches:[{clientX:200,clientY:100}]}));
    act(()=>region.props.onTouchEnd({changedTouches:[{clientX:120,clientY:105}]}));
    assert.equal(category(),'운동');
    act(()=>region.props.onTouchStart({touches:[{clientX:200,clientY:100}]}));
    act(()=>region.props.onTouchEnd({changedTouches:[{clientX:120,clientY:300}]}));
    assert.equal(category(),'운동');
    act(()=>region.props.onKeyDown({key:'ArrowLeft',preventDefault(){}}));
    assert.equal(category(),'댄스');
  } finally {
    if(renderer) act(()=>renderer.unmount());
    Object.assign(global,saved);
  }
});
