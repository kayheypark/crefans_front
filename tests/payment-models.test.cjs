const test = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { create, act } = require("react-test-renderer");
const { loadTypeScript } = require("./load-typescript.cjs");

function paymentModel(params, confirmPayment) {
  let state,
    refreshed = 0,
    tree;
  const search = new URLSearchParams(params);
  const { usePaymentSuccessPageModel } = loadTypeScript(
    "features/payment-success/usePaymentSuccessPageModel.ts",
    {
      "@/contexts/AuthContext": {
        useAuth: () => ({
          refreshUser: async () => {
            refreshed++;
          },
        }),
      },
      "next/navigation": {
        useRouter: () => ({ push() {} }),
        useSearchParams: () => search,
      },
      "@/lib/api/payment": { paymentAPI: { confirmPayment } },
    },
  );
  function Probe() {
    state = usePaymentSuccessPageModel();
    return null;
  }
  return {
    get state() {
      return state;
    },
    get refreshed() {
      return refreshed;
    },
    async mount() {
      await act(async () => {
        tree = create(React.createElement(Probe));
      });
    },
    rerender() {
      act(() => tree.update(React.createElement(Probe)));
    },
    close() {
      act(() => tree.unmount());
    },
  };
}

test("payment confirmation keeps its payload, refreshes the user, and survives rerenders without repeating", async () => {
  const requests = [];
  let resolve;
  const model = paymentModel(
    { paymentKey: "test-key", orderId: "test-order", amount: "10000" },
    (data) => {
      requests.push(data);
      return new Promise((done) => {
        resolve = done;
      });
    },
  );
  await model.mount();
  model.rerender();
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0], {
    paymentKey: "test-key",
    orderId: "test-order",
    amount: 10000,
  });
  assert.equal(model.state.isConfirming, true);
  await act(async () =>
    resolve({
      success: true,
      data: { token: { symbol: "BEAN", amount: 100 } },
    }),
  );
  assert.equal(model.refreshed, 1);
  assert.equal(model.state.confirmResult.success, true);
  assert.equal(model.state.confirmResult.token.amount, 100);
  assert.equal(model.state.isConfirming, false);
  model.close();
});

test("missing payment query parameters never invoke the payment API", async () => {
  let calls = 0;
  const model = paymentModel({ orderId: "test-order" }, async () => {
    calls++;
  });
  await model.mount();
  assert.equal(calls, 0);
  assert.equal(model.state.confirmResult.success, false);
  assert.equal(model.state.isConfirming, false);
  model.close();
});

test("a rejected confirmation is not presented as successful and does not refresh balance", async () => {
  const model = paymentModel(
    { paymentKey: "test", orderId: "test", amount: "100" },
    async () => ({ success: false, message: "declined" }),
  );
  await model.mount();
  assert.equal(model.state.confirmResult.message, "declined");
  assert.equal(model.state.confirmResult.success, false);
  assert.equal(model.refreshed, 0);
  model.close();
});

test("subscription cancellation runs only when its action is invoked and reloads server data", async () => {
  const calls = [],
    notices = [];
  let state, tree;
  const { useMySubscriptionsPageModel } = loadTypeScript(
    "features/subscription-manage/useMySubscriptionsPageModel.ts",
    {
      "next/navigation": { useRouter: () => ({ push() {} }) },
      "@/contexts/AuthContext": {
        useAuth: () => ({ user: { username: "test" } }),
      },
      "@/lib/api/subscriptionBilling": {
        subscriptionBillingAPI: {
          getMyBillingSubscriptions: async () => {
            calls.push("list");
            return { success: true, data: { subscriptions: [] } };
          },
          cancelBillingSubscription: async (id) => {
            calls.push(`cancel:${id}`);
            return { success: true };
          },
        },
      },
    },
  );
  const message = Object.fromEntries(
    ["success", "error", "warning", "info"].map((kind) => [
      kind,
      (text) => notices.push({ kind, text }),
    ]),
  );
  function Probe() {
    state = useMySubscriptionsPageModel({ message });
    return null;
  }
  await act(async () => {
    tree = create(React.createElement(Probe));
  });
  assert.deepEqual(calls, ["list"]);
  await act(async () =>
    state.cancelSubscription({ subscriptionId: "test-subscription" }),
  );
  assert.deepEqual(calls, ["list", "cancel:test-subscription", "list"]);
  assert.equal(state.canceling, null);
  assert.equal(notices[0].kind, "success");
  act(() => tree.unmount());
});
