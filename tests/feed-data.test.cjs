const test = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { create, act } = require("react-test-renderer");
const { loadTypeScript } = require("./load-typescript.cjs");

function setup() {
  const calls = [];
  const request = (mode) => (query, signal) =>
    new Promise((resolve) => calls.push({ mode, query, signal, resolve }));
  const { useFeedData } = loadTypeScript("features/feed/useFeedData.ts", {
    "@/lib/api/feed": {
      feedAPI: {
        getFeed: request("private"),
        getPublicFeed: request("public"),
      },
    },
  });
  let state;
  function Probe(props) {
    state = useFeedData(props.user, props.filter);
    return null;
  }
  let tree;
  return {
    calls,
    get state() {
      return state;
    },
    mount(user = "user-a", filter = "all") {
      act(() => {
        tree = create(React.createElement(Probe, { user, filter }));
      });
    },
    update(user, filter) {
      act(() => tree.update(React.createElement(Probe, { user, filter })));
    },
    close() {
      act(() => tree.unmount());
    },
  };
}
const response = (ids, hasMore = true) => ({
  success: true,
  data: ids.map((id) => ({ id, isLiked: id === "liked" })),
  pagination: { page: 1, limit: 10, hasMore, total: 20 },
});

test("initial load occurs once and concurrent load-more calls are coalesced", async () => {
  const s = setup();
  s.mount();
  assert.equal(s.calls.length, 1);
  assert.equal(s.calls[0].query.page, 1);
  await act(async () => {
    s.calls[0].resolve(response(["liked"]));
  });
  assert.deepEqual(s.state.likedPosts, ["liked"]);
  act(() => {
    s.state.loadMoreData();
    s.state.loadMoreData();
  });
  assert.equal(s.calls.length, 2);
  assert.equal(s.calls[1].query.page, 2);
  await act(async () => {
    s.calls[1].resolve(response(["liked", "next"], false));
  });
  assert.deepEqual(
    s.state.posts.map((post) => post.id),
    ["liked", "next"],
  );
  act(() => {
    s.state.loadMoreData();
  });
  assert.equal(s.calls.length, 2);
  s.close();
});

test("filter change restarts at page one and ignores a late old response", async () => {
  const s = setup();
  s.mount();
  await act(async () => {
    s.calls[0].resolve(response(["old"]));
  });
  act(() => {
    s.state.loadMoreData();
  });
  s.update("user-a", "membership");
  assert.equal(s.calls[1].signal.aborted, true);
  assert.equal(s.calls[2].query.page, 1);
  assert.equal(s.calls[2].query.filter, "membership");
  await act(async () => {
    s.calls[2].resolve(response(["new"]));
  });
  await act(async () => {
    s.calls[1].resolve(response(["stale"]));
  });
  assert.deepEqual(
    s.state.posts.map((post) => post.id),
    ["new"],
  );
  s.close();
});

test("logout switches to public data and cannot be overwritten by a private response", async () => {
  const s = setup();
  s.mount();
  s.update(null, "all");
  assert.equal(s.calls[0].signal.aborted, true);
  assert.equal(s.calls[1].mode, "public");
  await act(async () => {
    s.calls[1].resolve(response(["public"]));
    s.calls[0].resolve(response(["private"]));
  });
  assert.deepEqual(
    s.state.posts.map((post) => post.id),
    ["public"],
  );
  s.close();
});

test("unmount aborts requests; failed requests release loading state", async () => {
  const s = setup();
  s.mount();
  await act(async () => {
    s.calls[0].resolve({ success: false, message: "offline" });
  });
  assert.equal(s.state.loading, false);
  assert.equal(s.state.error, "offline");
  s.update("user-a", "public");
  s.close();
  assert.equal(s.calls[1].signal.aborted, true);
  await act(async () => {
    s.calls[1].resolve(response(["late"]));
  });
});
