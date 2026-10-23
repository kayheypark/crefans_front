const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const front=path.resolve(__dirname,'..');
const back=path.resolve(process.env.CREFANS_SERVER_DIR||path.join(front,'../crefans_server'));
function parse(file){return ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);}
function literal(node){if(!node)return '';if(!ts.isStringLiteral(node))throw new Error('Unsupported dynamic route: '+node.getText());return node.text;}
function decorators(node){return ts.canHaveDecorators(node)?ts.getDecorators(node)||[]:[];}
function calls(node){return decorators(node).map(d=>d.expression).filter(ts.isCallExpression);}
const platformModule=parse(path.join(back,'src/platform/module.ts'));
let registered;
function walk(node){if(ts.isPropertyAssignment(node)&&node.name.getText(platformModule)==='controllers'){if(!ts.isArrayLiteralExpression(node.initializer))throw new Error('Dynamic controller registration requires audit update');registered=node.initializer.elements.map(n=>n.getText(platformModule));}ts.forEachChild(node,walk);}
walk(platformModule);if(!registered?.length)throw new Error('No platform controllers found');
const imports=new Map();for(const n of platformModule.statements){if(ts.isImportDeclaration(n)&&n.importClause?.namedBindings&&ts.isNamedImports(n.importClause.namedBindings)){for(const el of n.importClause.namedBindings.elements)imports.set(el.name.text,literal(n.moduleSpecifier));}}
const routes=[];
for(const name of registered){const file=path.resolve(back,'src/platform',imports.get(name)+'.ts');const source=parse(file);const cls=source.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===name);if(!cls)throw new Error('Controller class missing: '+name);
 const dec=calls(cls).find(c=>c.expression.getText(source)==='Controller');if(!dec)throw new Error('Controller decorator missing: '+name);const prefix=literal(dec.arguments[0]);
 for(const member of cls.members){for(const c of calls(member)){const method=c.expression.getText(source);if(!['Get','Post','Put','Patch','Delete','Head','Options','All'].includes(method))continue;const route='/api/v1/'+[prefix,literal(c.arguments[0])].filter(Boolean).join('/');routes.push({method:method.toUpperCase(),path:route,source:path.relative(back,file),handler:member.name.getText(source)});}}
}
const screens=[];const catalog=parse(path.join(front,'components/preview/screen-catalog.ts'));
for(const statement of catalog.statements){if(!ts.isVariableStatement(statement))continue;for(const d of statement.declarationList.declarations){if(!['screenLinks','studioLinks','commonLinks'].includes(d.name.getText(catalog)))continue;if(!ts.isArrayLiteralExpression(d.initializer))throw new Error('Dynamic screen catalog requires audit update');for(const el of d.initializer.elements){if(!ts.isArrayLiteralExpression(el))throw new Error('Unsupported screen catalog');screens.push({path:'/preview/'+literal(el.elements[0]),title:literal(el.elements[1])});}}}
console.log(JSON.stringify({routes:routes.sort((a,b)=>(a.path+' '+a.method).localeCompare(b.path+' '+b.method)),screens}));
