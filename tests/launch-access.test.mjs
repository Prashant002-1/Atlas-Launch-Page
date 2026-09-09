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
    process.env.RESEND_API_KEY = originalEnv.key;
    process.env.ATLAS_ACCESS_RECIPIENT = originalEnv.recipient;
    process.env.ATLAS_ACCESS_FROM = originalEnv.sender;
  }
});
