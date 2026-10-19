import test from "node:test";
import assert from "node:assert/strict";

import handler from "../api/inquiry.js";

function responseRecorder() {
  return {
    code: 200,
    body: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function configureDelivery(t, fetchImpl) {
  const values = {
    RESEND_API_KEY: "test-key",
    ATLAS_ACCESS_RECIPIENT: "private-inbox@example.com",
    ATLAS_ACCESS_FROM: "Atlas <notifications@example.com>",
  };
  const originalEnv = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  Object.assign(process.env, values);
  t.mock.method(globalThis, "fetch", fetchImpl);
  t.after(() => {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

function clearDelivery(t) {
  const keys = ["RESEND_API_KEY", "ATLAS_ACCESS_RECIPIENT", "ATLAS_ACCESS_FROM"];
  const originalEnv = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  t.after(() => {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

const inquiry = {
  name: "Jordan Lee",
  email: "jordan@example.edu",
  role: "Teacher",
  interest: "AI Assignments",
  organization: "Example University",
  context: "First-year economics, 31 students.",
  question: "How does the agent stay grounded in the course reading?",
  source: "Atlas website",
};

const contactMessage = {
  kind: "contact",
  name: "Jordan Lee",
  email: "jordan@example.edu",
  topic: "Feedback",
  message: "Loved the film. <script>alert('test')</script>",
};

test("rejects non-POST requests", async () => {
  const res = responseRecorder();
  await handler({ method: "GET" }, res);
  assert.equal(res.code, 405);
  assert.equal(res.headers.Allow, "POST");
});

test("rejects incomplete submissions", async () => {
  const res = responseRecorder();
  await handler({ method: "POST", body: { name: "Jordan" } }, res);
  assert.equal(res.code, 400);
  assert.equal(res.body.error, "Complete the required fields.");
});

test("rejects unknown interests, invalid emails, and unknown request types", async (t) => {
  const send = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Invalid input must not reach delivery");
  });
  for (const patch of [{ interest: "Unknown" }, { email: "invalid" }, { kind: "unknown" }, { question: " " }]) {
    const res = responseRecorder();
    await handler({ method: "POST", body: { ...inquiry, ...patch } }, res);
    assert.equal(res.code, 400);
    assert.equal(res.body.ok, undefined);
  }
  assert.equal(send.mock.callCount(), 0);
});

test("rejects cross-site submissions", async () => {
  const res = responseRecorder();
  await handler(
    {
      method: "POST",
      headers: { origin: "https://example.com", host: "atlas-lms.com" },
      body: {},
    },
    res,
  );
  assert.equal(res.code, 403);
});

test("quietly accepts honeypot submissions without sending", async (t) => {
  const send = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Honeypot submissions must not reach delivery");
  });
  const res = responseRecorder();
  await handler({ method: "POST", body: { ...inquiry, website: "https://spam.example" } }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal(send.mock.callCount(), 0);
});

test("does not accept an inquiry when delivery is not configured", async (t) => {
  clearDelivery(t);
  const res = responseRecorder();
  await handler({ method: "POST", body: inquiry }, res);
  assert.equal(res.code, 503);
  assert.equal(res.body.error, "The form is not configured yet. Please try again shortly.");
});

test("delivers an inquiry to the private configured inbox", async (t) => {
  let notification;
  configureDelivery(t, async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    notification = JSON.parse(options.body);
    return { ok: true };
  });
  const res = responseRecorder();
  await handler(
    {
      method: "POST",
      body: { ...inquiry, name: "Jordan\nLee", to: "override@example.com", legacyField: "ignored" },
    },
    res,
  );
  assert.equal(res.code, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.deepEqual(notification.to, ["private-inbox@example.com"]);
  assert.equal(notification.reply_to, "jordan@example.edu");
  assert.equal(notification.subject, "Atlas inquiry (AI Assignments): Jordan Lee");
  assert.match(notification.text, /Role: Teacher/);
  assert.match(notification.text, /Organization: Example University/);
  assert.match(notification.text, /What they are working on:\nFirst-year economics/);
  assert.match(notification.text, /What they want to know:\nHow does the agent/);
  assert.doesNotMatch(notification.text, /legacyField|ignored/);
  assert.doesNotMatch(JSON.stringify(res.body), /@|test-key/);
});

test("treats organization and context as optional", async (t) => {
  let notification;
  configureDelivery(t, async (url, options) => {
    notification = JSON.parse(options.body);
    return { ok: true };
  });
  const res = responseRecorder();
  const { organization, context, ...minimal } = inquiry;
  await handler({ method: "POST", body: minimal }, res);
  assert.equal(res.code, 200);
  assert.match(notification.text, /Organization: Not provided/);
  assert.match(notification.text, /What they are working on:\nNot provided/);
});

test("delivers a contact message without inquiry fields", async (t) => {
  let notification;
  configureDelivery(t, async (url, options) => {
    notification = JSON.parse(options.body);
    return { ok: true };
  });
  const res = responseRecorder();
  await handler({ method: "POST", body: contactMessage }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal(notification.reply_to, contactMessage.email);
  assert.equal(notification.subject, "Atlas contact (Feedback): Jordan Lee");
  assert.match(notification.text, /Loved the film/);
  assert.doesNotMatch(notification.text, /Curious about|What they want to know/);
  assert.doesNotMatch(notification.html, /<script>/);
  assert.match(notification.html, /&lt;script&gt;/);
});

test("rejects missing messages and unsupported contact topics without sending", async (t) => {
  const send = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Invalid input must not reach delivery");
  });
  for (const patch of [{ message: " " }, { topic: "Unknown" }, { email: "invalid" }]) {
    const res = responseRecorder();
    await handler({ method: "POST", body: { ...contactMessage, ...patch } }, res);
    assert.equal(res.code, 400);
    assert.equal(res.body.ok, undefined);
  }
  assert.equal(send.mock.callCount(), 0);
});

for (const failure of ["provider rejection", "network failure"]) {
  test(`does not confirm delivery after ${failure}`, async (t) => {
    configureDelivery(t, async () => {
      if (failure === "network failure") throw new Error("Offline");
      return { ok: false, status: 403 };
    });
    const res = responseRecorder();
    await handler({ method: "POST", body: contactMessage }, res);
    assert.equal(res.code, 502);
    assert.deepEqual(res.body, { error: "The message could not be delivered." });
  });
}

test("rejects non-object JSON without throwing", async () => {
  for (const body of ["null", "[]", "42"]) {
    const res = responseRecorder();
    await handler({ method: "POST", body }, res);
    assert.equal(res.code, 400);
  }
});
