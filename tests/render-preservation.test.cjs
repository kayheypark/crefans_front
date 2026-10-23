const crypto = require("node:crypto");
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { renderSignature } = require("./render-signature.cjs");
const baseline = require("./fixtures/render-baseline.json");
for (const [file, expected] of Object.entries(baseline)) {
  test(`${file}: preserves existing markup, styles and UI bindings`, () => {
    const source = fs.readFileSync(path.resolve(__dirname, "..", file), "utf8");
    const signature = renderSignature(file, source);
    assert.deepEqual(
      {
        entries: signature.length,
        sha256: crypto
          .createHash("sha256")
          .update(JSON.stringify(signature))
          .digest("hex"),
      },
      expected,
    );
  });
}
