const test = require('node:test');
const assert = require('node:assert/strict');
const {loadTypeScript} = require('./load-typescript.cjs');
const {designTokens: t, designVariables} = loadTypeScript('lib/design/tokens.ts');
const {redesignTheme} = loadTypeScript('lib/design/theme.ts');
const {appTheme} = loadTypeScript('lib/theme.ts');
function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(x => parseInt(x,16)/255).map(v=>v<=0.04045?v/12.92:((v+.055)/1.055)**2.4);
  return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
}
function contrast(a,b) {const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('redesign text and action colors meet normal-text contrast on intended surfaces',()=>{
  for(const foreground of ['text','textSecondary','textMuted','accent','complementary','danger','success','warning'])
    assert.ok(contrast(t.color[foreground],t.color.surface)>=4.5,foreground);
  for(const background of ['accent','accentHover','accentActive'])
    assert.ok(contrast(t.color.onAccent,t.color[background])>=4.5,background);
  assert.ok(contrast(t.service.brand,t.service['brand-soft'])>=4.5,'selected navigation');
  assert.ok(contrast(t.color.complementary,t.color.complementarySoft)>=4.5,'secondary emphasis');
});
test('CSS variables and component theme consume shared tokens without changing service theme',()=>{
  assert.equal(designVariables['--cf-color-accent'],redesignTheme.token.colorPrimary);
  assert.equal(designVariables['--cf-size-control'],`${redesignTheme.token.controlHeight}px`);
  assert.equal(designVariables['--cf-motion-normal'],redesignTheme.token.motionDurationMid);
  assert.equal(designVariables['--cf-typography-body-lineHeight'],'1.6');
  assert.equal(appTheme.token.colorPrimary,'#1890ff');
});
