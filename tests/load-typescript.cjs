const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
function loadTypeScript(relativePath, mocks = {}) {
  const filename = path.resolve(root, relativePath);
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  const localRequire = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith("@/") || name.startsWith(".")) {
      const location = name.startsWith("@/")
        ? path.join(root, name.slice(2))
        : path.resolve(path.dirname(filename), name);
      const resolved = [location, location + ".ts", location + ".tsx"].find(
        (file) => fs.existsSync(file) && fs.statSync(file).isFile(),
      );
      if (!resolved) throw new Error(`Unmocked module: ${name}`);
      return loadTypeScript(resolved, mocks);
    }
    return require(name);
  };
  vm.runInThisContext(`(function(require, module, exports) {\n${source}\n})`, {
    filename,
  })(localRequire, module, module.exports);
  return module.exports;
}
module.exports = { loadTypeScript };
