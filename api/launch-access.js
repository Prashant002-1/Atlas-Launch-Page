const MAX_BODY_BYTES = 48_000;
const ORGANIZATION_TYPES = new Set([
  "Institution",
  "Department or program",
  "Course team",
  "Individual",
]);
const INTERESTS = new Set([
  "Product demo",
  "First-course launch",
  "Institutional rollout",
  "Individual access",
  "Research or conversation",
  "Product updates",
]);

function text(value, max = 2_000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function singleLine(value, max = 200) {
  return text(value, max).replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") {
    if (Buffer.byteLength(JSON.stringify(req.body), "utf8") > MAX_BODY_BYTES) {
      throw new Error("Request is too large.");
    }
    return req.body;
  }
  if (typeof req.body !== "string") return {};
  if (Buffer.byteLength(req.body, "utf8") > MAX_BODY_BYTES) {
    throw new Error("Request is too large.");
  }
  return JSON.parse(req.body);
}

function hasValidOrigin(req) {
  const origin = req.headers?.origin;
  const host = req.headers?.host;
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function line(label, value) {
  return `${label}: ${value || "Not provided"}`;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!hasValidOrigin(req)) {
    return res.status(403).json({ error: "The request origin is not allowed." });
  }

  let body;
  try {
    body = parseBody(req);
  } catch {
    return res.status(400).json({ error: "The request could not be read." });
  }

  if (text(body.website, 200)) {
    return res.status(200).json({ ok: true });
  }

  const submission = {
    name: singleLine(body.name, 160),
    email: singleLine(body.email, 254).toLowerCase(),
    role: singleLine(body.role, 120),
    organizationType: singleLine(body.organizationType, 120),
    institution: singleLine(body.institution, 200),
    title: singleLine(body.title, 160),
    courseCount: singleLine(body.courseCount, 80),
    learnerCount: singleLine(body.learnerCount, 80),
    timeline: singleLine(body.timeline, 120),
    useCase: text(body.useCase, 4_000),
    currentApproach: text(body.currentApproach, 2_500),
    source: singleLine(body.source, 180),
    consent: singleLine(body.consent, 20),
    interests: Array.isArray(body.interests)
      ? body.interests
          .map((item) => singleLine(item, 120))
          .filter((item) => INTERESTS.has(item))
          .slice(0, 12)
      : [singleLine(body.interests, 120)].filter((item) => INTERESTS.has(item)),
  };

  const required = [
    submission.name,
    submission.email,
    submission.role,
    submission.organizationType,
    submission.useCase,
    submission.consent,
  ];

  if (required.some((value) => !value) || submission.interests.length === 0) {
    return res.status(400).json({ error: "Complete the required fields." });
  }

  if (!validEmail(submission.email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  if (!ORGANIZATION_TYPES.has(submission.organizationType)) {
    return res.status(400).json({ error: "Choose how you are approaching Atlas." });
  }

  if (submission.consent !== "yes") {
    return res.status(400).json({ error: "Consent is required to send this request." });
  }

  if (submission.organizationType !== "Individual" && !submission.institution) {
    return res
      .status(400)
      .json({ error: "Enter your institution or organization." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.ATLAS_ACCESS_RECIPIENT;
  const sender = process.env.ATLAS_ACCESS_FROM;

  if (!apiKey || !recipient || !sender) {
    return res.status(503).json({
      error:
        "The request form is not configured yet. Please try again shortly.",
    });
  }

  const subject = `Atlas launch access: ${submission.name}`;
  const rows = [
    line("Name", submission.name),
    line("Email", submission.email),
    line("Role", submission.role),
    line("Title", submission.title),
    line("Organization type", submission.organizationType),
    line("Institution", submission.institution),
    line("Interests", submission.interests.join(", ")),
    line("Course scope", submission.courseCount),
    line("Learner scope", submission.learnerCount),
    line("Timeline", submission.timeline),
    line("How they found Atlas", submission.source),
    "",
    "Use case:",
    submission.useCase,
    "",
    "Current approach:",
    submission.currentApproach || "Not provided",
  ];

  const htmlRows = rows
    .map((row) => (row ? `<p>${escapeHtml(row)}</p>` : "<br>"))
    .join("");

  let response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: submission.email,
        subject,
        text: rows.join("\n"),
        html: htmlRows,
      }),
    });
  } catch {
    return res
      .status(502)
      .json({ error: "The request could not be delivered." });
  }

  if (!response.ok) {
    return res
      .status(502)
      .json({ error: "The request could not be delivered." });
  }

  return res.status(200).json({ ok: true });
}
