const ts = require("typescript");
function renderSignature(filename, source) {
  const ast = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const result = [];
  function canonical(node) {
    if (ts.isParenthesizedExpression(node)) return canonical(node.expression);
    const children = [];
    ts.forEachChild(node, (child) => {
      if (!(ts.isJsxText(child) && !child.text.trim()))
        children.push(canonical(child));
    });
    const value = ts.isIdentifier(node)
      ? node.text
      : ts.isJsxText(node)
        ? node.text.replace(/\s+/g, " ").trim()
        : "text" in node && typeof node.text === "string"
          ? node.text
          : null;
    return [node.kind, value, children];
  }
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const name = node.tagName.getText(ast);
      // New container -> view bindings have no visible markup of their own.
      if (!/^[A-Z]\w*View$/.test(name)) {
        result.push({
          tag: name,
          attributes: node.attributes.properties.map(canonical),
        });
      }
    }
    if (ts.isJsxText(node)) {
      const text = node.text.replace(/\s+/g, " ").trim();
      if (text) result.push({ text });
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return result;
}
module.exports = { renderSignature };
