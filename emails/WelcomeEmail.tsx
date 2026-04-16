interface WelcomeEmailProps {
  confirmUrl: string
}

export function renderWelcomeEmail({ confirmUrl }: WelcomeEmailProps): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0A0C10;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:40px 24px;">
<tr><td>
  <div style="width:24px;height:2px;background:#C9A227;margin-bottom:8px;"></div>
  <div style="font-size:20px;font-weight:600;color:#EAE8E0;">Eight <span style="color:#C9A227;">Wide</span></div>
  <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#3E4A58;margin-top:4px;">LEGO Speed Champions</div>
</td></tr>
<tr><td style="padding-top:32px;">
  <h1 style="font-size:28px;font-weight:700;color:#EAE8E0;margin:0 0 12px;">Potvrd svuj email</h1>
  <p style="font-size:15px;color:#8B95A8;line-height:1.65;margin:0 0 24px;">
    Dekujeme za prihlaseni k newsletteru Eight Wide. Klikni na tlacitko nize pro potvrzeni — pak ti kazde pondeli posleme ceny, DNA clanky a novinky.
  </p>
  <a href="${confirmUrl}" style="display:inline-block;padding:14px 28px;background:#C9A227;color:#000;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:8px;">
    Potvrdit odber →
  </a>
  <p style="font-size:12px;color:#3E4A58;margin-top:24px;line-height:1.5;">
    Pokud jsi se neprihlasil/a, tento email muzes ignorovat.
  </p>
</td></tr>
<tr><td style="padding-top:40px;border-top:1px solid rgba(255,255,255,0.07);margin-top:40px;">
  <div style="font-size:11px;color:#3E4A58;">© Eight Wide · speedchampions.cz</div>
</td></tr>
</table>
</body>
</html>`
}
