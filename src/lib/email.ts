import "server-only";
import { getSiteUrl } from "@/lib/site-url";
import { formatDurationLV, pluralEntriesLV } from "@/lib/utils";

const RESEND_API_URL = "https://api.resend.com/emails";
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "artemijlucin@gmail.com";

/** Best-effort plain-text fallback derived from an email's HTML body. */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, label) => {
      const cleanLabel = label.replace(/<[^>]+>/g, "").trim();
      return `${cleanLabel}: ${href}`;
    })
    .replace(/<(br|\/p|\/div|\/tr|\/h[1-6])\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Send an email via Resend if RESEND_API_KEY is configured.
 * In development (no key) the message is logged to the server console instead,
 * so flows like password reset are testable without an email provider.
 */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Shadowy <onboarding@resend.dev>";

  if (!apiKey) {
    // The body is never logged: it carries password-reset links, client names
    // and report fragments, and logs are retained far longer than the links are
    // valid. Locally the full message can be re-enabled on purpose.
    if (process.env.EMAIL_DEBUG_LOG_BODY === "1" && process.env.NODE_ENV !== "production") {
      console.log(`\n[email:dev] to: ${to}\n  subject: ${subject}\n  html:\n${html}\n`);
      return;
    }
    console.warn(
      `[email] RESEND_API_KEY nav iestatīts - vēstule netiek nosūtīta (subject: ${subject}).`,
    );
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text: htmlToText(html), reply_to: REPLY_TO }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error(`[email] Resend kļūda (${res.status}): ${detail}`);
    throw new Error("email_send_failed");
  }
}

/**
 * Seed/demo accounts (…@demo.lv) hard-bounce and end up on Resend's
 * suppression list - skip them in automated sends to save quota and keep
 * delivery logs clean.
 */
export function isDemoEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@demo.lv");
}

/** Escape user-controlled text before interpolating it into an HTML email. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  password: string,
  role: "MANAGER" | "EMPLOYEE"
): Promise<void> {
  const appUrl = getSiteUrl("http://localhost:3000");
  const roleLabel = role === "MANAGER" ? "vadītājs" : "darbinieks";
  const subject = "Shadowy - jūsu pieslēgšanās dati";
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:480px">
      <h2 style="margin-bottom:4px">Sveiks, ${escapeHtml(name)}!</h2>
      <p style="color:#555;margin-top:0">Jūs esat pievienots Shadowy kā <strong>${roleLabel}</strong>.</p>
      <table style="background:#f5f5f5;border-radius:8px;padding:16px 20px;margin:20px 0;width:100%;border-collapse:collapse">
        <tr><td style="color:#888;font-size:13px;padding:4px 0">E-pasts</td><td style="font-weight:600;padding:4px 0">${escapeHtml(to)}</td></tr>
        <tr><td style="color:#888;font-size:13px;padding:4px 0">Parole</td><td style="font-weight:600;padding:4px 0;font-family:monospace">${password}</td></tr>
      </table>
      <p>
        <a href="${appUrl}/login" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
          Pieslēgties →
        </a>
      </p>
      <p style="color:#888;font-size:13px">
        Pēc pirmās pieslēgšanās iesakām nomainīt paroli sadaļā <em>Mans profils</em>.
      </p>
    </div>
  `;
  await sendEmail(to, subject, html);
}

export async function sendPilotInquiry(data: {
  name: string;
  company: string;
  email: string;
  teamSize: string;
  comment: string;
}): Promise<void> {
  const subject = `Shadowy pilots - ${data.company}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:520px">
      <h2 style="margin-bottom:16px">Jauns pilota pieteikums</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="color:#888;font-size:13px;padding:6px 0;width:140px">Vārds</td><td style="font-weight:600">${escapeHtml(data.name)}</td></tr>
        <tr><td style="color:#888;font-size:13px;padding:6px 0">Uzņēmums</td><td style="font-weight:600">${escapeHtml(data.company)}</td></tr>
        <tr><td style="color:#888;font-size:13px;padding:6px 0">E-pasts</td><td><a href="mailto:${encodeURIComponent(data.email)}">${escapeHtml(data.email)}</a></td></tr>
        <tr><td style="color:#888;font-size:13px;padding:6px 0">Komandas lielums</td><td>${escapeHtml(data.teamSize)}</td></tr>
        <tr><td style="color:#888;font-size:13px;padding:6px 0;vertical-align:top">Komentārs</td><td style="white-space:pre-wrap">${data.comment ? escapeHtml(data.comment) : "-"}</td></tr>
      </table>
    </div>
  `;
  const adminEmail = process.env.NOTIFICATION_EMAIL ?? process.env.SUPERADMIN_EMAIL;
  if (!adminEmail) {
    console.log("[email] NOTIFICATION_EMAIL not set, skipping pilot inquiry notification");
    return;
  }
  await sendEmail(adminEmail, subject, html);
}

export async function sendEntrySubmittedEmail(opts: {
  to: string;
  managerName: string;
  employeeName: string;
  entryTitle: string;
}): Promise<void> {
  const appUrl = getSiteUrl("http://localhost:3000");
  const subject = `Shadowy - jauns ieraksts no ${opts.employeeName}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:480px">
      <h2 style="margin-bottom:4px">Jauns ieraksts gaida izskatīšanu</h2>
      <p style="color:#555;margin-top:0">Sveiks, ${escapeHtml(opts.managerName)}!</p>
      <table style="background:#f5f5f5;border-radius:8px;padding:16px 20px;margin:20px 0;width:100%;border-collapse:collapse">
        <tr><td style="color:#888;font-size:13px;padding:4px 0">Darbinieks</td><td style="font-weight:600;padding:4px 0">${escapeHtml(opts.employeeName)}</td></tr>
        <tr><td style="color:#888;font-size:13px;padding:4px 0">Ieraksts</td><td style="font-weight:600;padding:4px 0">${escapeHtml(opts.entryTitle)}</td></tr>
      </table>
      <p>
        <a href="${appUrl}/manager/entries" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
          Apskatīt ierakstus →
        </a>
      </p>
    </div>
  `;
  await sendEmail(opts.to, subject, html);
}

export async function sendEntryReviewedEmail(opts: {
  to: string;
  employeeName: string;
  entryTitle: string;
  status: "APPROVED" | "REJECTED" | "RETURNED";
  comment: string | null;
}): Promise<void> {
  const appUrl = getSiteUrl("http://localhost:3000");
  const statusLabel =
    opts.status === "APPROVED" ? "apstiprināts" :
    opts.status === "REJECTED" ? "noraidīts" : "atgriezts labošanai";
  const statusColor =
    opts.status === "APPROVED" ? "#0f9d58" :
    opts.status === "REJECTED" ? "#d32f2f" : "#f59e0b";
  const subject = `Shadowy - jūsu ieraksts ir ${statusLabel}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:480px">
      <h2 style="margin-bottom:4px">Ieraksts izskatīts</h2>
      <p style="color:#555;margin-top:0">Sveiks, ${escapeHtml(opts.employeeName)}!</p>
      <table style="background:#f5f5f5;border-radius:8px;padding:16px 20px;margin:20px 0;width:100%;border-collapse:collapse">
        <tr><td style="color:#888;font-size:13px;padding:4px 0">Ieraksts</td><td style="font-weight:600;padding:4px 0">${escapeHtml(opts.entryTitle)}</td></tr>
        <tr><td style="color:#888;font-size:13px;padding:4px 0">Statuss</td><td style="font-weight:600;padding:4px 0;color:${statusColor}">${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}</td></tr>
        ${opts.comment ? `<tr><td style="color:#888;font-size:13px;padding:4px 0;vertical-align:top">Komentārs</td><td style="padding:4px 0;white-space:pre-wrap">${escapeHtml(opts.comment)}</td></tr>` : ""}
      </table>
      <p>
        <a href="${appUrl}/employee/history" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
          Apskatīt vēsturi →
        </a>
      </p>
    </div>
  `;
  await sendEmail(opts.to, subject, html);
}

export async function sendBonusRequestEmail(opts: {
  to: string;
  managerName: string;
  employeeName: string;
  ruleName: string;
}): Promise<void> {
  const appUrl = getSiteUrl("http://localhost:3000");
  const subject = `Shadowy - bonusa pieprasījums no ${opts.employeeName}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:480px">
      <h2 style="margin-bottom:4px">Jauns bonusa pieprasījums</h2>
      <p style="color:#555;margin-top:0">Sveiks, ${escapeHtml(opts.managerName)}!</p>
      <table style="background:#f5f5f5;border-radius:8px;padding:16px 20px;margin:20px 0;width:100%;border-collapse:collapse">
        <tr><td style="color:#888;font-size:13px;padding:4px 0">Darbinieks</td><td style="font-weight:600;padding:4px 0">${escapeHtml(opts.employeeName)}</td></tr>
        <tr><td style="color:#888;font-size:13px;padding:4px 0">Noteikums</td><td style="font-weight:600;padding:4px 0">${escapeHtml(opts.ruleName)}</td></tr>
      </table>
      <p>
        <a href="${appUrl}/manager/bonus-requests" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
          Apskatīt pieprasījumu →
        </a>
      </p>
    </div>
  `;
  await sendEmail(opts.to, subject, html);
}

export async function sendWeeklyManagerReport(opts: {
  to: string;
  managerName: string;
  orgName: string;
  pendingCount: number;
  weekEntries: number;
  weekMinutes: number;
  teamSize: number;
  entriesTrend: string | null;
  hoursTrend: string | null;
  costEur: number;
  rateEur: number;
  employeeBreakdown: { name: string; count: number; minutes: number }[];
  categoryBreakdown: { label: string; count: number; minutes: number; topTitles: { title: string; count: number }[] }[];
  clientBreakdown: { name: string; minutes: number }[];
  inactiveEmployeeNames: string[];
}): Promise<void> {
  const appUrl = getSiteUrl("http://localhost:3000");
  const subject = `Shadowy - iknedēļas pārskats`;

  const listSection = (title: string, rows: string) =>
    rows
      ? `
      <div style="margin-bottom:20px">
        <div style="font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:8px">${title}</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      </div>`
      : "";

  const employeeRows = opts.employeeBreakdown
    .map(
      (e) => `
        <tr>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#333">${escapeHtml(e.name)}</td>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#888;text-align:right;white-space:nowrap">${pluralEntriesLV(e.count)} · ${formatDurationLV(e.minutes)}</td>
        </tr>`
    )
    .join("");

  const categoryRows = opts.categoryBreakdown
    .map((c) => {
      const titlesLine = c.topTitles
        .map((t) => (t.count > 1 ? `${escapeHtml(t.title)} (${t.count}×)` : escapeHtml(t.title)))
        .join(", ");
      return `
        <tr>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#333">${escapeHtml(c.label)}</td>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#888;text-align:right;white-space:nowrap">${pluralEntriesLV(c.count)} · ${formatDurationLV(c.minutes)}</td>
        </tr>
        ${titlesLine ? `
        <tr>
          <td colspan="2" style="padding:0 0 8px;color:#aaa;font-size:12px">↳ ${titlesLine}</td>
        </tr>` : ""}`;
    })
    .join("");

  const clientRows = opts.clientBreakdown
    .map(
      (c) => `
        <tr>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#333">${escapeHtml(c.name)}</td>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#888;text-align:right;white-space:nowrap">${formatDurationLV(c.minutes)}</td>
        </tr>`
    )
    .join("");

  const trendLine =
    opts.entriesTrend || opts.hoursTrend
      ? `
      <p style="color:#888;font-size:13px;margin-bottom:16px">
        ${[opts.entriesTrend, opts.hoursTrend].filter(Boolean).join(" · ")}
      </p>`
      : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:520px">
      <div style="margin-bottom:24px">
        <h2 style="margin:0 0 4px">Iknedēļas pārskats</h2>
        <p style="color:#888;margin:0;font-size:14px">${escapeHtml(opts.orgName)} · Sveiks, ${escapeHtml(opts.managerName)}!</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
        <tr>
          <td style="background:#f5f5f5;border-radius:8px;padding:14px 18px;width:25%;text-align:center">
            <div style="font-size:28px;font-weight:700;line-height:1">${opts.pendingCount}</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Gaida izskatīšanu</div>
          </td>
          <td style="width:12px"></td>
          <td style="background:#f5f5f5;border-radius:8px;padding:14px 18px;width:25%;text-align:center">
            <div style="font-size:28px;font-weight:700;line-height:1">${opts.weekEntries}</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Ieraksti nedēļā</div>
          </td>
          <td style="width:12px"></td>
          <td style="background:#f5f5f5;border-radius:8px;padding:14px 18px;width:25%;text-align:center">
            <div style="font-size:28px;font-weight:700;line-height:1">${formatDurationLV(opts.weekMinutes)}</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Apst. stundas</div>
          </td>
          <td style="width:12px"></td>
          <td style="background:#f5f5f5;border-radius:8px;padding:14px 18px;width:25%;text-align:center">
            <div style="font-size:28px;font-weight:700;line-height:1">${opts.teamSize}</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Komandas lielums</div>
          </td>
        </tr>
      </table>

      ${trendLine}

      ${opts.pendingCount > 0 ? `
        <p style="color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:14px;margin-bottom:20px">
          ⏳ Jums ir <strong>${opts.pendingCount}</strong> ieraksti, kas gaida izskatīšanu.
        </p>
      ` : `
        <p style="color:#065f46;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:12px 16px;font-size:14px;margin-bottom:20px">
          ✓ Visi ieraksti ir izskatīti.
        </p>
      `}

      <p style="color:#3b3b3b;background:#f5f5f5;border-radius:8px;padding:12px 16px;font-size:14px;margin-bottom:20px">
        💶 Pagājušās nedēļas neredzamā darba izmaksas: <strong>€${opts.costEur}</strong>
        <br/><span style="color:#888;font-size:12px">Aprēķināts ar vidējo likmi €${opts.rateEur}/h - aptuvena vērtība, nevis precīzs budžeta zaudējums.</span>
      </p>

      ${opts.inactiveEmployeeNames.length > 0 ? `
        <p style="color:#555;background:#f5f5f5;border-radius:8px;padding:12px 16px;font-size:14px;margin-bottom:20px">
          👤 Pagājušajā nedēļā nav iesnieguši nevienu ierakstu: <strong>${escapeHtml(opts.inactiveEmployeeNames.join(", "))}</strong>
        </p>
      ` : ""}

      ${listSection("Sadalījums pa darbiniekiem", employeeRows)}
      ${listSection("Sadalījums pa kategorijām", categoryRows)}
      ${listSection("Sadalījums pa klientiem", clientRows)}

      <p>
        <a href="${appUrl}/manager/entries" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
          Apskatīt komandas ierakstus →
        </a>
      </p>
      <p style="color:#aaa;font-size:12px;margin-top:24px">
        Shadowy · Šis e-pasts tiek sūtīts katru pirmdienu automātiski.
      </p>
    </div>
  `;
  await sendEmail(opts.to, subject, html);
}

/**
 * The administrator's counterpart to the manager report: the same week, but
 * across the whole organisation, with the per-manager split an administrator
 * cannot get from a single team's report.
 */
export async function sendWeeklyAdminReport(opts: {
  to: string;
  adminName: string;
  orgName: string;
  pendingCount: number;
  weekEntries: number;
  weekMinutes: number;
  employeeCount: number;
  activeEmployeeCount: number;
  entriesTrend: string | null;
  hoursTrend: string | null;
  costEur: number;
  rateEur: number;
  managerBreakdown: { name: string; count: number; minutes: number; pending: number }[];
  employeeBreakdown: { name: string; count: number; minutes: number }[];
  categoryBreakdown: { label: string; count: number; minutes: number }[];
  clientBreakdown: { name: string; minutes: number }[];
  inactiveEmployeeNames: string[];
}): Promise<void> {
  const appUrl = getSiteUrl("http://localhost:3000");
  const subject = `Shadowy - organizācijas pārskats par pagājušo nedēļu`;

  const listSection = (title: string, rows: string) =>
    rows
      ? `
      <div style="margin-bottom:20px">
        <div style="font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:8px">${title}</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      </div>`
      : "";

  const row = (left: string, right: string, note?: string) => `
        <tr>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#333">${left}</td>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#888;text-align:right;white-space:nowrap">${right}</td>
        </tr>
        ${note ? `
        <tr>
          <td colspan="2" style="padding:0 0 8px;color:#aaa;font-size:12px">↳ ${note}</td>
        </tr>` : ""}`;

  const managerRows = opts.managerBreakdown
    .map((m) =>
      row(
        escapeHtml(m.name),
        `${pluralEntriesLV(m.count)} · ${formatDurationLV(m.minutes)}`,
        m.pending > 0 ? `${m.pending} gaida izskatīšanu` : undefined,
      ),
    )
    .join("");

  const employeeRows = opts.employeeBreakdown
    .map((e) => row(escapeHtml(e.name), `${pluralEntriesLV(e.count)} · ${formatDurationLV(e.minutes)}`))
    .join("");

  const categoryRows = opts.categoryBreakdown
    .map((c) => row(escapeHtml(c.label), `${pluralEntriesLV(c.count)} · ${formatDurationLV(c.minutes)}`))
    .join("");

  const clientRows = opts.clientBreakdown
    .map((c) => row(escapeHtml(c.name), formatDurationLV(c.minutes)))
    .join("");

  const trendLine =
    opts.entriesTrend || opts.hoursTrend
      ? `
      <p style="color:#888;font-size:13px;margin-bottom:16px">
        ${[opts.entriesTrend, opts.hoursTrend].filter(Boolean).join(" · ")}
      </p>`
      : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:520px">
      <div style="margin-bottom:24px">
        <h2 style="margin:0 0 4px">Organizācijas pārskats</h2>
        <p style="color:#888;margin:0;font-size:14px">${escapeHtml(opts.orgName)} · par pagājušo nedēļu · Sveiks, ${escapeHtml(opts.adminName)}!</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
        <tr>
          <td style="background:#f5f5f5;border-radius:8px;padding:14px 18px;width:25%;text-align:center">
            <div style="font-size:28px;font-weight:700;line-height:1">${opts.pendingCount}</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Gaida izskatīšanu</div>
          </td>
          <td style="width:12px"></td>
          <td style="background:#f5f5f5;border-radius:8px;padding:14px 18px;width:25%;text-align:center">
            <div style="font-size:28px;font-weight:700;line-height:1">${opts.weekEntries}</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Ieraksti nedēļā</div>
          </td>
          <td style="width:12px"></td>
          <td style="background:#f5f5f5;border-radius:8px;padding:14px 18px;width:25%;text-align:center">
            <div style="font-size:28px;font-weight:700;line-height:1">${formatDurationLV(opts.weekMinutes)}</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Apst. stundas</div>
          </td>
          <td style="width:12px"></td>
          <td style="background:#f5f5f5;border-radius:8px;padding:14px 18px;width:25%;text-align:center">
            <div style="font-size:28px;font-weight:700;line-height:1">${opts.activeEmployeeCount}/${opts.employeeCount}</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Aktīvie darbinieki</div>
          </td>
        </tr>
      </table>

      ${trendLine}

      ${opts.pendingCount > 0 ? `
        <p style="color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:14px;margin-bottom:20px">
          ⏳ Organizācijā <strong>${opts.pendingCount}</strong> ieraksti gaida vadītāju izskatīšanu.
        </p>
      ` : `
        <p style="color:#065f46;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:12px 16px;font-size:14px;margin-bottom:20px">
          ✓ Visi ieraksti ir izskatīti.
        </p>
      `}

      <p style="color:#3b3b3b;background:#f5f5f5;border-radius:8px;padding:12px 16px;font-size:14px;margin-bottom:20px">
        💶 Pagājušās nedēļas neredzamā darba izmaksas: <strong>€${opts.costEur}</strong>
        <br/><span style="color:#888;font-size:12px">Aprēķināts ar vidējo likmi €${opts.rateEur}/h - aptuvena vērtība, nevis precīzs budžeta zaudējums.</span>
      </p>

      ${opts.inactiveEmployeeNames.length > 0 ? `
        <p style="color:#555;background:#f5f5f5;border-radius:8px;padding:12px 16px;font-size:14px;margin-bottom:20px">
          👤 Pagājušajā nedēļā nav iesnieguši nevienu ierakstu: <strong>${escapeHtml(opts.inactiveEmployeeNames.join(", "))}</strong>
        </p>
      ` : ""}

      ${listSection("Sadalījums pa vadītājiem", managerRows)}
      ${listSection("Sadalījums pa darbiniekiem", employeeRows)}
      ${listSection("Sadalījums pa kategorijām", categoryRows)}
      ${listSection("Sadalījums pa klientiem", clientRows)}

      <p>
        <a href="${appUrl}/admin/insights" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
          Atvērt procesu analīzi →
        </a>
      </p>
      <p style="color:#aaa;font-size:12px;margin-top:24px">
        Shadowy · Šis e-pasts tiek sūtīts katru pirmdienu automātiski. To var izslēgt sadaļā Iestatījumi → E-pasta paziņojumi.
      </p>
    </div>
  `;
  await sendEmail(opts.to, subject, html);
}

export async function sendMorningReminder(opts: {
  to: string;
  employeeName: string;
  orgName: string;
}): Promise<void> {
  const appUrl = getSiteUrl("http://localhost:3000");
  const subject = `Shadowy - labrīt!`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:520px">
      <div style="margin-bottom:16px">
        <h2 style="margin:0 0 4px">Labrīt, ${escapeHtml(opts.employeeName)}! ☀️</h2>
        <p style="color:#888;margin:0;font-size:14px">${escapeHtml(opts.orgName)}</p>
      </div>

      <p style="color:#333;font-size:14px">
        Vēl viena darba diena priekšā - neaizmirsti šodien pierakstīt neredzamo darbu, kas paliek ārpus ierastajiem uzdevumiem.
      </p>

      <p>
        <a href="${appUrl}/employee/new-entry" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
          Pievienot ierakstu →
        </a>
      </p>
      <p style="color:#aaa;font-size:12px;margin-top:24px">
        Shadowy · Šis e-pasts tiek sūtīts katru darba dienu no rīta automātiski.
      </p>
    </div>
  `;
  await sendEmail(opts.to, subject, html);
}

export async function sendMiddayReminder(opts: {
  to: string;
  employeeName: string;
  orgName: string;
}): Promise<void> {
  const appUrl = getSiteUrl("http://localhost:3000");
  const subject = `Shadowy - neaizmirsti pierakstīt šodienas darbu`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:520px">
      <div style="margin-bottom:16px">
        <h2 style="margin:0 0 4px">Puse dienas aizvadīta</h2>
        <p style="color:#888;margin:0;font-size:14px">${escapeHtml(opts.orgName)} · Sveiks, ${escapeHtml(opts.employeeName)}!</p>
      </div>

      <p style="color:#333;font-size:14px">
        Shadowy sistēmā no tevis šodien vēl nav neviena ieraksta. Neaizmirsti pierakstīt to, kas šodien jau aizņēmis laiku ārpus ierastā.
      </p>

      <p>
        <a href="${appUrl}/employee/new-entry" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
          Pievienot ierakstu →
        </a>
      </p>
      <p style="color:#aaa;font-size:12px;margin-top:24px">
        Shadowy · Šis e-pasts tiek sūtīts katru darba dienu ap pusdienlaiku automātiski, ja vēl nav neviena ieraksta.
      </p>
    </div>
  `;
  await sendEmail(opts.to, subject, html);
}

export async function sendEveningReminder(opts: {
  to: string;
  employeeName: string;
  orgName: string;
}): Promise<void> {
  const appUrl = getSiteUrl("http://localhost:3000");
  const subject = `Shadowy - neaizmirsti pierakstīt šodienas darbu`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:520px">
      <div style="margin-bottom:16px">
        <h2 style="margin:0 0 4px">Diena tuvojas noslēgumam</h2>
        <p style="color:#888;margin:0;font-size:14px">${escapeHtml(opts.orgName)} · Sveiks, ${escapeHtml(opts.employeeName)}!</p>
      </div>

      <p style="color:#333;font-size:14px">
        Shadowy sistēmā no tevis šodien vēl nav neviena ieraksta. Pirms beidz darba dienu - neaizmirsti pierakstīt to, kas šodien aizņēma laiku ārpus ierastā.
      </p>

      <p>
        <a href="${appUrl}/employee/new-entry" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
          Pievienot ierakstu →
        </a>
      </p>
      <p style="color:#aaa;font-size:12px;margin-top:24px">
        Shadowy · Šis e-pasts tiek sūtīts katru darba dienu pēcpusdienā automātiski, ja vēl nav neviena ieraksta.
      </p>
    </div>
  `;
  await sendEmail(opts.to, subject, html);
}

export async function sendEmptyWeekNudge(opts: {
  to: string;
  employeeName: string;
  orgName: string;
}): Promise<void> {
  const appUrl = getSiteUrl("http://localhost:3000");
  const subject = `Shadowy - pagājušajā nedēļā nav neviena ieraksta`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:520px">
      <div style="margin-bottom:20px">
        <h2 style="margin:0 0 4px">Pagājušajā nedēļā tu neko neaizpildīji</h2>
        <p style="color:#888;margin:0;font-size:14px">${escapeHtml(opts.orgName)} · Sveiks, ${escapeHtml(opts.employeeName)}!</p>
      </div>

      <p style="color:#333;font-size:14px">
        Shadowy sistēmā no tevis pagājušajā nedēļā nav neviena ieraksta.
      </p>

      <p style="color:#333;font-size:14px">
        Shadowy neko neuzspiež un neseko līdzi ar spiedienu - tas nav paredzēts kā kontrole. Mērķis ir palīdzēt padarīt redzamu darbu, kas citādi paliek nepamanīts, lai tev un komandai būtu vieglāk strādāt efektīvāk.
      </p>

      <p style="color:#333;font-size:14px;margin-bottom:8px">
        Pirms turpini nedēļu - pajautā sev, kāpēc tā sanācis (atbildi šeit rakstīt nevajag):
      </p>
      <ul style="color:#333;font-size:14px;padding-left:20px;margin-top:0">
        <li>Vai biji prombūtnē (atvaļinājumā, slimības lapā u.tml.)? Ja jā - viss kārtībā, tas nav pārmetums.</li>
        <li>Vai tiešām nebija nekāda papildu vai neredzama darba?</li>
        <li>Vai vienkārši aizmirsi to pierakstīt?</li>
        <li>Vai negribējies to darīt?</li>
        <li>Vai nesaskati jēgu, kāpēc tas būtu jādara?</li>
      </ul>

      <p style="color:#888;background:#f5f5f5;border-radius:8px;padding:12px 16px;font-size:13px;margin-bottom:20px">
        Par atbildi parunāsim klātienē - šis e-pasts ir tikai atgādinājums padomāt par to iepriekš.
      </p>

      <p>
        <a href="${appUrl}/employee/new-entry" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
          Pievienot ierakstu →
        </a>
      </p>
      <p style="color:#aaa;font-size:12px;margin-top:24px">
        Shadowy · Šis e-pasts tiek sūtīts katru pirmdienu automātiski.
      </p>
    </div>
  `;
  await sendEmail(opts.to, subject, html);
}

export async function sendWeeklyEmployeeDigest(opts: {
  to: string;
  employeeName: string;
  orgName: string;
  weekEntries: number;
  weekMinutes: number;
  helpedCount: number;
  entriesTrend: string | null;
  hoursTrend: string | null;
  topCategoryLabel: string | null;
  recommendation: string;
  categoryBreakdown: { label: string; count: number; minutes: number }[];
  clientBreakdown: { name: string; minutes: number }[];
  entryList: { title: string; category: string; durationMinutes: number }[];
  entryListMoreCount: number;
}): Promise<void> {
  const appUrl = getSiteUrl("http://localhost:3000");
  const subject = `Shadowy - tava nedēļa`;

  const listSection = (title: string, rows: string) =>
    rows
      ? `
      <div style="margin-bottom:20px">
        <div style="font-size:13px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:8px">${title}</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      </div>`
      : "";

  const categoryRows = opts.categoryBreakdown
    .map(
      (c) => `
        <tr>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#333">${escapeHtml(c.label)}</td>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#888;text-align:right;white-space:nowrap">${pluralEntriesLV(c.count)} · ${formatDurationLV(c.minutes)}</td>
        </tr>`
    )
    .join("");

  const clientRows = opts.clientBreakdown
    .map(
      (c) => `
        <tr>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#333">${escapeHtml(c.name)}</td>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#888;text-align:right;white-space:nowrap">${formatDurationLV(c.minutes)}</td>
        </tr>`
    )
    .join("");

  const entryRows =
    opts.entryList
      .map(
        (e) => `
        <tr>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#333">${escapeHtml(e.title)}<br/><span style="color:#aaa;font-size:12px">${escapeHtml(e.category)}</span></td>
          <td style="padding:6px 0;border-top:1px solid #eee;color:#888;text-align:right;white-space:nowrap;vertical-align:top">${formatDurationLV(e.durationMinutes)}</td>
        </tr>`
      )
      .join("") +
    (opts.entryListMoreCount > 0
      ? `<tr><td colspan="2" style="padding:6px 0;border-top:1px solid #eee;color:#aaa;font-size:12px">+${opts.entryListMoreCount} citi ieraksti</td></tr>`
      : "");

  const trendLine =
    opts.entriesTrend || opts.hoursTrend
      ? `
      <p style="color:#888;font-size:13px;margin-bottom:16px">
        ${[opts.entriesTrend, opts.hoursTrend].filter(Boolean).join(" · ")}
      </p>`
      : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:520px">
      <div style="margin-bottom:24px">
        <h2 style="margin:0 0 4px">Tava nedēļa</h2>
        <p style="color:#888;margin:0;font-size:14px">${escapeHtml(opts.orgName)} · Sveiks, ${escapeHtml(opts.employeeName)}!</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
        <tr>
          <td style="background:#f5f5f5;border-radius:8px;padding:14px 18px;width:33%;text-align:center">
            <div style="font-size:28px;font-weight:700;line-height:1">${opts.weekEntries}</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Ieraksti nedēļā</div>
          </td>
          <td style="width:12px"></td>
          <td style="background:#f5f5f5;border-radius:8px;padding:14px 18px;width:33%;text-align:center">
            <div style="font-size:28px;font-weight:700;line-height:1">${formatDurationLV(opts.weekMinutes)}</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Nostrādāts</div>
          </td>
          <td style="width:12px"></td>
          <td style="background:#f5f5f5;border-radius:8px;padding:14px 18px;width:33%;text-align:center">
            <div style="font-size:28px;font-weight:700;line-height:1">${opts.helpedCount}</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Reizes palīdzēji</div>
          </td>
        </tr>
      </table>

      ${trendLine}

      ${opts.topCategoryLabel ? `
        <p style="color:#555;font-size:14px;margin-bottom:16px">
          Visvairāk laika pagājušajā nedēļā aizņēma: <strong>${escapeHtml(opts.topCategoryLabel)}</strong>.
        </p>
      ` : ""}

      <p style="color:#3b3b3b;background:#f5f5f5;border-radius:8px;padding:12px 16px;font-size:14px;margin-bottom:20px">
        💡 ${escapeHtml(opts.recommendation)}
      </p>

      ${listSection("Sadalījums pa kategorijām", categoryRows)}
      ${listSection("Sadalījums pa klientiem", clientRows)}
      ${listSection("Ieraksti pagājušajā nedēļā", entryRows)}

      <p>
        <a href="${appUrl}/employee/dashboard" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">
          Apskatīt pārskatu →
        </a>
      </p>
      <p style="color:#aaa;font-size:12px;margin-top:24px">
        Shadowy · Šis e-pasts tiek sūtīts katru pirmdienu automātiski.
      </p>
    </div>
  `;
  await sendEmail(opts.to, subject, html);
}

export async function sendInviteEmail(
  to: string,
  name: string,
  role: "MANAGER" | "EMPLOYEE",
  inviteUrl: string
): Promise<void> {
  const roleLabel = role === "MANAGER" ? "vadītājs" : "darbinieks";
  const subject = "Shadowy - jūsu uzaicinājums";
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:480px">
      <h2 style="margin-bottom:4px">Sveiks, ${escapeHtml(name)}!</h2>
      <p style="color:#555;margin-top:0">Jūs esat uzaicināts pievienoties Shadowy kā <strong>${roleLabel}</strong>.</p>
      <p>Lai iestatītu savu paroli un sāktu lietot platformu, noklikšķiniet uz pogas zemāk:</p>
      <p>
        <a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Iestatīt paroli →
        </a>
      </p>
      <p style="color:#888;font-size:13px">Saite ir derīga 7 dienas. Ja jūs nesaņēmāt šo uzaicinājumu, ignorējiet šo vēstuli.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const subject = "Shadowy - paroles atjaunošana";
  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6;">
      <h2>Paroles atjaunošana</h2>
      <p>Saņēmām pieprasījumu atjaunot jūsu Shadowy paroli. Lai iestatītu jaunu paroli, noklikšķiniet uz saites:</p>
      <p><a href="${resetLink}" style="display:inline-block;padding:10px 18px;background:#0f9d58;color:#fff;border-radius:8px;text-decoration:none;">Atjaunot paroli</a></p>
      <p style="color:#666;font-size:14px;">Saite ir derīga 60 minūtes. Ja jūs nepieprasījāt paroles maiņu, vienkārši ignorējiet šo vēstuli.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
}
