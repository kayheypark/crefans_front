const test = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { create, act } = require("react-test-renderer");
const { loadTypeScript } = require("./load-typescript.cjs");

const { createComponentFixtures } = loadTypeScript(
  "features/design-system/catalog.ts",
);

test("catalog fixture changes exercise empty lists and long content without sharing mutable records", () => {
  const normal = createComponentFixtures("normal");
  const long = createComponentFixtures("long");
  const empty = createComponentFixtures("empty");
  assert.deepEqual(empty, { memberships: [], payments: [], media: [] });
  assert.ok(
    long.memberships[0].name.length > normal.memberships[0].name.length,
  );
  assert.ok(long.memberships[0].price > normal.memberships[0].price);
  normal.media.splice(0, 1);
  assert.equal(createComponentFixtures("normal").media.length, 3);
});

test("design-system route bypasses session providers while service routes retain them", () => {
  let pathname = "/design-system";
  let authMounts = 0,
    notificationMounts = 0;
  function AuthProvider({ children }) {
    authMounts++;
    return children;
  }
  function NotificationProvider({ children }) {
    notificationMounts++;
    return children;
  }
  const { default: ApplicationProviders } = loadTypeScript(
    "components/providers/ApplicationProviders.tsx",
    {
      "next/navigation": { usePathname: () => pathname },
      "@/contexts/AuthContext": { AuthProvider },
      "@/contexts/NotificationContext": { NotificationProvider },
    },
  );
  let tree;
  act(() => {
    tree = create(
      React.createElement(
        ApplicationProviders,
        null,
        React.createElement("span", null, "catalog"),
      ),
    );
  });
  assert.equal(authMounts, 0);
  assert.equal(notificationMounts, 0);
  assert.equal(tree.toJSON().children[0], "catalog");
  pathname = "/feed";
  act(() =>
    tree.update(
      React.createElement(
        ApplicationProviders,
        null,
        React.createElement("span", null, "feed"),
      ),
    ),
  );
  assert.equal(authMounts, 1);
  assert.equal(notificationMounts, 1);
  act(() => tree.unmount());
});
