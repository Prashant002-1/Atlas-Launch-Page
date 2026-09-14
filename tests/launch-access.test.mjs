import test from "node:test";
import assert from "node:assert/strict";

import handler from "../api/launch-access.js";

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

test("rejects incomplete submissions", async () => {
  const res = responseRecorder();
  await handler({ method: "POST", body: { name: "Jordan" } }, res);
  assert.equal(res.code, 400);
  assert.equal(res.body.error, "Complete the required fields.");
});

test("requires an institution for organizational requests", async () => {
  const res = responseRecorder();
  await handler(
    {
      method: "POST",
      body: {
        name: "Jordan Lee",
        email: "jordan@example.edu",
        role: "Teacher or professor",
        organizationType: "Course team",
        interests: ["AI Assignments"],
        courseContext: "ECON-241, 31 undergraduate students",
        useCase: "Bring the course into Atlas for a bounded evaluation.",
      },
    },
    res,
  );
  assert.equal(res.code, 400);
  assert.equal(res.body.error, "Enter your institution or organization.");
});

test("rejects cross-site submissions", async () => {
  const crossSite = responseRecorder();
  await handler(
    {
      method: "POST",
      headers: { origin: "https://example.com", host: "atlas-lms.com" },
      body: {},
    },
    crossSite,
  );
  assert.equal(crossSite.code, 403);
});

test("does not accept a request when delivery is not configured", async () => {
  const originalEnv = {
    key: process.env.RESEND_API_KEY,
    recipient: process.env.ATLAS_ACCESS_RECIPIENT,
    sender: process.env.ATLAS_ACCESS_FROM,
  };

  delete process.env.RESEND_API_KEY;
  delete process.env.ATLAS_ACCESS_RECIPIENT;
  delete process.env.ATLAS_ACCESS_FROM;

  try {
    const res = responseRecorder();
    await handler(
      {
        method: "POST",
        body: {
          name: "Jordan Lee",
          email: "jordan@example.edu",
          role: "Student",
          organizationType: "Individual",
          interests: ["Product conversation"],
          courseContext: "Undergraduate economics",
          useCase: "Inspect a student assignment session.",
        },
      },
      res,
    );

    assert.equal(res.code, 503);
    assert.equal(
      res.body.error,
      "The request form is not configured yet. Please try again shortly.",
    );
  } finally {
    if (originalEnv.key === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalEnv.key;
    if (originalEnv.recipient === undefined) {
      delete process.env.ATLAS_ACCESS_RECIPIENT;
    } else {
      process.env.ATLAS_ACCESS_RECIPIENT = originalEnv.recipient;
    }
    if (originalEnv.sender === undefined) delete process.env.ATLAS_ACCESS_FROM;
    else process.env.ATLAS_ACCESS_FROM = originalEnv.sender;
  }
});

test("delivers an individual request without a consent checkbox and ignores removed fields", async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = {
    key: process.env.RESEND_API_KEY,
    recipient: process.env.ATLAS_ACCESS_RECIPIENT,
    sender: process.env.ATLAS_ACCESS_FROM,
  };

  process.env.RESEND_API_KEY = "test-key";
  process.env.ATLAS_ACCESS_RECIPIENT = "launch@example.com";
  process.env.ATLAS_ACCESS_FROM = "Atlas <atlas@example.com>";

  let providerRequest;
  globalThis.fetch = async (url, options) => {
    providerRequest = { url, options };
    return { ok: true };
  };

  try {
    const res = responseRecorder();
    await handler(
      {
        method: "POST",
        body: {
          name: "Jordan\nLee",
          email: "jordan@example.edu",
          role: "Student",
          organizationType: "Individual",
          interests: ["Atlas Course", "AI Assignments"],
          courseContext: "Undergraduate economics",
          useCase: "Run one governed pricing assignment.",
          currentApproach: "Legacy field that should no longer be collected",
        },
      },
      res,
    );

    assert.equal(res.code, 200);
    assert.deepEqual(res.body, { ok: true });
    assert.equal(providerRequest.url, "https://api.resend.com/emails");

    const providerBody = JSON.parse(providerRequest.options.body);
    assert.equal(providerBody.reply_to, "jordan@example.edu");
    assert.equal(providerBody.subject, "Atlas launch access: Jordan Lee");
    assert.match(providerBody.text, /Atlas Course, AI Assignments/);
    assert.match(providerBody.text, /Course or institutional context:\nUndergraduate economics/);
    assert.match(providerBody.text, /What they want to test:\nRun one governed pricing assignment/);
    assert.doesNotMatch(providerBody.text, /Current approach|Legacy field/);
    assert.doesNotMatch(providerBody.html, /Current approach|Legacy field/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalEnv.key === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalEnv.key;
    if (originalEnv.recipient === undefined) delete process.env.ATLAS_ACCESS_RECIPIENT;
    else process.env.ATLAS_ACCESS_RECIPIENT = originalEnv.recipient;
    if (originalEnv.sender === undefined) delete process.env.ATLAS_ACCESS_FROM;
    else process.env.ATLAS_ACCESS_FROM = originalEnv.sender;
  }
});

const contactMessage = {
  kind: "contact",
  name: "Jordan Lee",
  email: "jordan@example.edu",
  topic: "Privacy request",
  message: "Please delete my pilot request. <script>alert('test')</script>",
};

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

test("delivers a contact message without pilot fields to the private configured inbox", async (t) => {
  let notification;
  configureDelivery(t, async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    notification = JSON.parse(options.body);
    return { ok: true };
  });
  const res = responseRecorder();
  await handler({ method: "POST", body: { ...contactMessage, to: "override@example.com" } }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.deepEqual(notification.to, ["private-inbox@example.com"]);
  assert.equal(notification.reply_to, contactMessage.email);
  assert.equal(notification.subject, "Atlas contact (Privacy request): Jordan Lee");
  assert.match(notification.text, /Please delete my pilot request/);
  assert.doesNotMatch(notification.text, /Course or institutional context|What they want to test/);
  assert.doesNotMatch(notification.html, /<script>/);
  assert.match(notification.html, /&lt;script&gt;/);
  assert.doesNotMatch(JSON.stringify(res.body), /@|test-key/);
});

test("rejects missing messages, unsupported topics, and unknown request types without sending", async (t) => {
  const send = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Invalid input must not reach delivery");
  });
  for (const patch of [{ message: " " }, { topic: "Unknown" }, { email: "invalid" }, { kind: "unknown" }]) {
    const res = responseRecorder();
    await handler({ method: "POST", body: { ...contactMessage, ...patch } }, res);
    assert.equal(res.code, 400);
    assert.equal(res.body.ok, undefined);
  }
  assert.equal(send.mock.callCount(), 0);
});

for (const failure of ["provider rejection", "network failure"]) {
  test(`does not confirm contact delivery after ${failure}`, async (t) => {
    configureDelivery(t, async () => {
      if (failure === "network failure") throw new Error("Offline");
      return { ok: false, status: 403 };
    });
    const res = responseRecorder();
    await handler({ method: "POST", body: contactMessage }, res);
    assert.equal(res.code, 502);
    assert.deepEqual(res.body, { error: "The request could not be delivered." });
  });
}

test("rejects non-object JSON without throwing", async () => {
  for (const body of ["null", "[]", "42"]) {
    const res = responseRecorder();
    await handler({ method: "POST", body }, res);
    assert.equal(res.code, 400);
  }
});
