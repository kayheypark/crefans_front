const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    );
const failures = [];
const files = [
  "app",
  "components",
  "contexts",
  "features",
  "hooks",
  "lib/api",
  "types",
]
  .flatMap((dir) => walk(path.join(root, dir)))
  .filter((file) => /\.tsx?$/.test(file));
for (const file of files) {
  const name = path.relative(root, file).replaceAll("\\", "/");
  const ast = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const isServerRoute = /^app\/api\/.*\/route\.ts$/.test(name);
  const isView = /^(app|components|contexts)\//.test(name) && !isServerRoute;
  const isModel = /^features\//.test(name) && /\/use\w+\.ts$/.test(name);
  const isApi = /^lib\/api\//.test(name);
  const isType = /^types\//.test(name) || name.endsWith("/types.ts");
  function fail(reason) {
    failures.push(`${name}: ${reason}`);
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const module = node.moduleSpecifier?.text || "";
      const clause = node.importClause;
      const typeOnly =
        node.isTypeOnly ||
        clause?.isTypeOnly ||
        (clause?.namedBindings &&
          ts.isNamedImports(clause.namedBindings) &&
          !clause.name &&
          clause.namedBindings.elements.every((element) => element.isTypeOnly));
      if (isView && /(?:lib\/api|^axios$)/.test(module) && !typeOnly)
        fail("view imports data transport");
      if (
        isModel &&
        /^(antd(?:\/|$)|@ant-design\/|@\/components\/|@\/app\/)/.test(module) &&
        !typeOnly
      )
        fail("model imports a UI runtime");
      if (
        (isApi || isType) &&
        /^@\/(features|components|app|contexts)\//.test(module)
      )
        fail("lower layer depends on an upper layer");
    }
    if (
      isModel &&
      (ts.isJsxElement(node) ||
        ts.isJsxSelfClosingElement(node) ||
        ts.isJsxFragment(node))
    )
      fail("model contains JSX");
    if (
      (isView || isModel || /^hooks\//.test(name)) &&
      ts.isCallExpression(node)
    ) {
      const callee = node.expression.getText(ast);
      if (/^(?:fetch$|window\.fetch$|axios(?:\.|$)|apiClient\.)/.test(callee))
        fail("HTTP call outside lib/api");
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Layer boundaries passed (${files.length} TypeScript files).`);
