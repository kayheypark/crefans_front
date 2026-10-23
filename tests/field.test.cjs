const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const {Field,TextAreaField}=loadTypeScript('components/ui/Field.tsx',{'./field.module.css':styles});
function mount(Component,props){let tree;act(()=>{tree=create(React.createElement(Component,props));});return tree;}
function update(tree,Component,props){act(()=>tree.update(React.createElement(Component,props)));}
function close(tree){act(()=>tree.unmount());}

test('fields preserve native input attributes and associate external help with their own error',()=>{
  const changes=[];
  const tree=mount(Field,{label:'금액',id:'price',type:'number',value:'012.50',min:0,step:0.01,required:true,name:'price','aria-describedby':'payment-policy','aria-label':'월 구독 금액',error:'금액을 확인해 주세요',hint:'월 단위 결제',suffix:'원',onChange:event=>changes.push(event.target.value)});
  const input=tree.root.findByType('input');
  assert.equal(input.props.value,'012.50');
  assert.equal(input.props.type,'number');
  assert.equal(input.props.step,0.01);
  assert.equal(input.props.min,0);
  assert.equal(input.props.required,true);
  assert.equal(input.props.name,'price');
  assert.equal(input.props['aria-label'],'월 구독 금액');
  assert.equal(input.props['aria-invalid'],true);
  const error=tree.root.findByProps({role:'alert'});
  assert.equal(input.props['aria-describedby'],`payment-policy ${error.props.id}`);
  assert.equal(tree.root.findByType('label').props.htmlFor,input.props.id);
  assert.ok(!JSON.stringify(tree.toJSON()).includes('월 단위 결제'));
  act(()=>input.props.onChange({target:{value:'007.25'}}));
  assert.deepEqual(changes,['007.25']);
  close(tree);
});

test('clear actions require a supplied callback and nonempty value and respect disabled or read-only state',()=>{
  let calls=0;
  const props={label:'검색',type:'search',value:'있는 값',clearable:true,onClear:()=>calls++};
  const tree=mount(Field,{...props,onClear:undefined});
  assert.equal(tree.root.findAllByType('button').length,0);
  update(tree,Field,{...props,value:''});
  assert.equal(tree.root.findAllByType('button').length,0);
  update(tree,Field,props);
  assert.equal(tree.root.findByType('button').props.type,'button');
  assert.equal(tree.root.findByType('label').findAllByType('button').length,0);
  act(()=>tree.root.findByType('button').props.onClick());
  assert.equal(calls,1);
  assert.equal(tree.root.findByType('input').props.value,'있는 값');
  for(const state of [{disabled:true},{readOnly:true}]){
    update(tree,Field,{...props,...state});
    assert.equal(tree.root.findByType('button').props.disabled,true);
    act(()=>tree.root.findByType('button').props.onClick());
  }
  assert.equal(calls,1);
  close(tree);
});

test('password visibility is opt-in, never changes the value, and blocks disabled or read-only toggles',()=>{
  const props={label:'비밀번호',type:'password',value:'unchanged-password'};
  const tree=mount(Field,props);
  assert.equal(tree.root.findAllByType('button').length,0);
  update(tree,Field,{...props,showPasswordToggle:true});
  act(()=>tree.root.findByType('button').props.onClick());
  assert.equal(tree.root.findByType('input').props.type,'text');
  assert.equal(tree.root.findByType('button').props['aria-pressed'],true);
  assert.equal(tree.root.findByType('button').props['aria-label'],'비밀번호 숨기기');
  assert.equal(tree.root.findByType('input').props.value,props.value);
  for(const state of [{disabled:true},{readOnly:true}]){
    update(tree,Field,{...props,showPasswordToggle:true,...state});
    assert.equal(tree.root.findByType('button').props.disabled,true);
    act(()=>tree.root.findByType('button').props.onClick());
    assert.equal(tree.root.findByType('input').props.type,'text');
  }
  update(tree,Field,{...props,showPasswordToggle:true});
  act(()=>tree.root.findByType('button').props.onClick());
  assert.equal(tree.root.findByType('input').props.type,'password');
  close(tree);
});

test('textarea count follows controlled values and preserves native limits, callbacks and descriptions',()=>{
  const changes=[];
  const props={label:'소개',value:'안녕하세요',maxLength:20,rows:4,showCount:true,hint:'짧게 소개해 주세요','aria-describedby':'profile-policy',onChange:event=>changes.push(event.target.value)};
  const tree=mount(TextAreaField,props);
  const input=tree.root.findByType('textarea');
  assert.equal(input.props.maxLength,20);
  assert.equal(input.props.rows,4);
  assert.equal(input.props.value,props.value);
  const descriptions=input.props['aria-describedby'].split(' ');
  assert.equal(descriptions[0],'profile-policy');
  assert.equal(tree.root.findByProps({id:descriptions[2]}).children.join(''),'5 / 20');
  act(()=>input.props.onChange({target:{value:' 새로운 소개 '}}));
  assert.deepEqual(changes,[' 새로운 소개 ']);
  update(tree,TextAreaField,{...props,value:'새 소개',readOnly:true});
  assert.equal(tree.root.findByProps({id:descriptions[2]}).children.join(''),'4 / 20');
  assert.equal(tree.root.findByType('textarea').props.readOnly,true);
  close(tree);
});

test('uncontrolled fields track user text without replacing the supplied default value',()=>{
  const tree=mount(TextAreaField,{label:'메모',defaultValue:'초기값',showCount:true});
  const input=tree.root.findByType('textarea');
  assert.equal(input.props.value,undefined);
  act(()=>input.props.onChange({target:{value:'새 메모입니다'}}));
  assert.equal(tree.root.findByType('small').children.join(''),'7');
  assert.equal(tree.root.findByType('textarea').props.defaultValue,'초기값');
  close(tree);
  const field=mount(Field,{label:'주소',defaultValue:'',clearable:true,onClear(){}});
  assert.equal(field.root.findAllByType('button').length,0);
  act(()=>field.root.findByType('input').props.onChange({target:{value:'서울'}}));
  assert.equal(field.root.findAllByType('button').length,1);
  close(field);
});
