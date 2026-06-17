import "server-only";

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Send an email via Resend if RESEND_API_KEY is configured.
 * In development (no key) the message is logged to the server console instead,
 * so flows like password reset are testable without an email provider.
 */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Shadowy <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(
      `\n[email:dev] Nav RESEND_API_KEY - vēstule netiek sūtīta.\n  to: ${to}\n  subject: ${subject}\n  html:\n${html}\n`
    );
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error(`[email] Resend kļūda (${res.status}): ${detail}`);
    throw new Error("email_send_failed");
  }
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
  weekHours: number;
  teamSize: number;
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const subject = `Shadowy - iknedēļas pārskats`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:520px">
      <div style="margin-bottom:24px">
        <h2 style="margin:0 0 4px">Iknedēļas pārskats</h2>
        <p style="color:#888;margin:0;font-size:14px">${escapeHtml(opts.orgName)} · Sveiks, ${escapeHtml(opts.managerName)}!</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
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
            <div style="font-size:28px;font-weight:700;line-height:1">${opts.weekHours}h</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Apst. stundas</div>
          </td>
          <td style="width:12px"></td>
          <td style="background:#f5f5f5;border-radius:8px;padding:14px 18px;width:25%;text-align:center">
            <div style="font-size:28px;font-weight:700;line-height:1">${opts.teamSize}</div>
            <div style="font-size:12px;color:#888;margin-top:4px">Komandas lielums</div>
          </td>
        </tr>
      </table>

      ${opts.pendingCount > 0 ? `
        <p style="color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:14px;margin-bottom:20px">
          ⏳ Jums ir <strong>${opts.pendingCount}</strong> ieraksti, kas gaida izskatīšanu.
        </p>
      ` : `
        <p style="color:#065f46;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:12px 16px;font-size:14px;margin-bottom:20px">
          ✓ Visi ieraksti ir izskatīti.
        </p>
      `}

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
