const test = require("node:test");
const assert = require("node:assert/strict");
const { loadTypeScript } = require("./load-typescript.cjs");
function client() {
  const calls = [];
  const apiClient = Object.fromEntries(
    ["get", "post", "put", "patch", "delete"].map((method) => [
      method,
      async (...args) => {
        calls.push({ method, args });
        return { data: { success: true, data: {} } };
      },
    ]),
  );
  return { calls, apiClient };
}
test("auth transport preserves request bodies and credential policies", async () => {
  const c = client();
  const { authAPI } = loadTypeScript("lib/api/auth.ts", { "./client": c });
  await authAPI.signin("test@example.test", "test-only");
  await authAPI.signup({ email: "test@example.test" });
  await authAPI.confirmEmailVerification("test@example.test", "1234");
  assert.deepEqual(c.calls[0], {
    method: "post",
    args: [
      "/auth/signin",
      { email: "test@example.test", password: "test-only" },
      { withCredentials: true },
    ],
  });
  assert.equal(c.calls[1].args[2].withCredentials, false);
  assert.deepEqual(c.calls[2].args[1], {
    params: { email: "test@example.test", code: "1234" },
    withCredentials: false,
  });
});
test("posting transport preserves methods and query parameters", async () => {
  const c = client();
  const { postingApi } = loadTypeScript("lib/api/posting.ts", {
    "./client": c,
  });
  await postingApi.createPosting({ title: "test" });
  await postingApi.getPostings({
    page: 2,
    is_membership: false,
    search: "hello world",
  });
  await postingApi.updatePosting("post-id", { title: "changed" });
  await postingApi.deletePosting("post-id");
  assert.deepEqual(
    c.calls.map((call) => call.method),
    ["post", "get", "patch", "delete"],
  );
  assert.equal(
    c.calls[1].args[0],
    "/postings?page=2&is_membership=false&search=hello+world",
  );
  assert.equal(c.calls[2].args[0], "/postings/post-id");
});
test("posting errors retain server messages for mutations and existing read fallbacks", async () => {
  const reject = async () => {
    throw { response: { data: { message: "server detail" } } };
  };
  const { postingApi } = loadTypeScript("lib/api/posting.ts", {
    "./client": { apiClient: { post: reject, get: reject } },
  });
  await assert.rejects(postingApi.createPosting({}), /server detail/);
  await assert.rejects(
    postingApi.getPosting("test"),
    /포스팅 조회에 실패했습니다/,
  );
});
