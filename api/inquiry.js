const MAX_BODY_BYTES = 48_000;
const INTERESTS = new Set([
  "AI Assignments",
  "Atlas Course",
  "Assessment workflow",
  "Integrations",
  "Atlas LMS",
  "How it was built",
  "Something else",
]);
const CONTACT_TOPICS = new Set([
  "General question",
  "Contributing or forking",
  "Security concern",
  "Feedback",
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

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "The request could not be read." });
  }

  const kind = body.kind ?? "inquiry";
  if (kind !== "inquiry" && kind !== "contact") {
    return res.status(400).json({ error: "Choose a valid request type." });
  }
  const isContact = kind === "contact";

  // Honeypot: bots that fill the hidden field get a quiet success.
  if (text(body.website, 200)) {
    return res.status(200).json({ ok: true });
  }

  const submission = {
    name: singleLine(body.name, 160),
    email: singleLine(body.email, 254).toLowerCase(),
    topic: singleLine(body.topic, 120),
    message: text(body.message, 4_000),
    role: singleLine(body.role, 120),
    interest: singleLine(body.interest, 120),
    organization: singleLine(body.organization, 200),
    context: text(body.context, 3_000),
    question: text(body.question, 4_000),
    source: singleLine(body.source, 180),
  };

  const required = isContact
    ? [submission.name, submission.email, submission.topic, submission.message]
    : [submission.name, submission.email, submission.role, submission.interest, submission.question];

  if (required.some((value) => !value)) {
    return res.status(400).json({ error: "Complete the required fields." });
  }

  if (!validEmail(submission.email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  if (isContact && !CONTACT_TOPICS.has(submission.topic)) {
    return res.status(400).json({ error: "Choose a valid topic." });
  }

  if (!isContact && !INTERESTS.has(submission.interest)) {
    return res.status(400).json({ error: "Choose what you are curious about." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.ATLAS_ACCESS_RECIPIENT;
  const sender = process.env.ATLAS_ACCESS_FROM;

  if (!apiKey || !recipient || !sender) {
    return res.status(503).json({
      error: "The form is not configured yet. Please try again shortly.",
    });
  }

  const subject = isContact
    ? `Atlas contact (${submission.topic}): ${submission.name}`
    : `Atlas inquiry (${submission.interest}): ${submission.name}`;
  const rows = isContact
    ? [
        line("Name", submission.name),
        line("Email", submission.email),
        line("Topic", submission.topic),
        "",
        "Message:",
        submission.message,
      ]
    : [
        line("Name", submission.name),
        line("Email", submission.email),
        line("Role", submission.role),
        line("Organization", submission.organization),
        line("Curious about", submission.interest),
        line("Source", submission.source),
        "",
        "What they are working on:",
        submission.context || "Not provided",
        "",
        "What they want to know:",
        submission.question,
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
    return res.status(502).json({ error: "The message could not be delivered." });
  }

  if (!response.ok) {
    return res.status(502).json({ error: "The message could not be delivered." });
  }

  return res.status(200).json({ ok: true });
}
