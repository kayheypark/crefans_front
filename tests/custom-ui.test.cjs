const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const fs=require('node:fs');
const path=require('node:path');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const {Button,Field}=loadTypeScript('components/ui/Primitives.tsx',{'./ui.module.css':styles,'./field.module.css':styles,'./select.module.css':styles,'./choice.module.css':styles});
test('native loading button blocks actions and error fields associate their help text',()=>{
 let button,field;
 act(()=>{button=create(React.createElement(Button,{loading:true},'저장'));field=create(React.createElement(Field,{label:'이메일',error:'이메일 확인',value:'bad',onChange(){}}));});
 assert.equal(button.root.findByType('button').props.disabled,true);
 assert.equal(button.root.findByType('button').props['aria-busy'],true);
 const input=field.root.findByType('input');
 assert.equal(input.props['aria-invalid'],true);
 assert.equal(input.props['aria-describedby'],field.root.findByType('small').props.id);
 act(()=>{button.unmount();field.unmount();});
});
test('new UI implementation has no Ant Design imports or classes',()=>{
 const root=path.resolve(__dirname,'..');
 const files=fs.readdirSync(path.join(root,'components/ui')).map(x=>'components/ui/'+x).concat(['components/design-system/CustomDesignSystem.tsx','components/design-system/custom.module.css']);
 for(const name of files){const source=fs.readFileSync(path.join(root,name),'utf8');assert.doesNotMatch(source,/from\s+['"](?:antd|@ant-design)/,name);assert.doesNotMatch(source,/\.ant-/,name);}
});
