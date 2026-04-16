interface PriceAlertEmailProps {
  setName: string
  setNumber: string
  store: string
  currentPrice: number
  targetPrice: number
  url?: string
}

export function renderPriceAlertEmail({
  setName,
  setNumber,
  store,
  currentPrice,
  targetPrice,
  url,
}: PriceAlertEmailProps): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0A0C10;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:40px 24px;">
<tr><td>
  <div style="width:24px;height:2px;background:#C9A227;margin-bottom:8px;"></div>
  <div style="font-size:20px;font-weight:600;color:#EAE8E0;">Eight <span style="color:#C9A227;">Wide</span></div>
</td></tr>
<tr><td style="padding-top:32px;">
  <div style="display:inline-block;padding:4px 10px;background:rgba(39,174,96,0.15);color:#27AE60;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;border-radius:4px;margin-bottom:16px;">
    Price Alert
  </div>
  <h1 style="font-size:24px;font-weight:700;color:#EAE8E0;margin:0 0 8px;">${setName}</h1>
  <p style="font-size:13px;color:#3E4A58;margin:0 0 20px;">Set ${setNumber}</p>
  <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="padding:12px 20px;background:#111620;border:1px solid rgba(255,255,255,0.07);border-radius:8px 0 0 8px;">
        <div style="font-size:10px;color:#3E4A58;text-transform:uppercase;letter-spacing:0.14em;">Aktualni cena</div>
        <div style="font-size:28px;font-weight:900;color:#27AE60;">${currentPrice} Kc</div>
        <div style="font-size:11px;color:#3E4A58;">${store}</div>
      </td>
      <td style="padding:12px 20px;background:#111620;border:1px solid rgba(255,255,255,0.07);border-radius:0 8px 8px 0;">
        <div style="font-size:10px;color:#3E4A58;text-transform:uppercase;letter-spacing:0.14em;">Tvuj alert</div>
        <div style="font-size:28px;font-weight:900;color:#8B95A8;">${targetPrice} Kc</div>
        <div style="font-size:11px;color:#3E4A58;">cilova cena</div>
      </td>
    </tr>
  </table>
  ${url ? `<a href="${url}" style="display:inline-block;padding:14px 28px;background:#C9A227;color:#000;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:8px;">Koupit ted →</a>` : ''}
</td></tr>
<tr><td style="padding-top:40px;border-top:1px solid rgba(255,255,255,0.07);">
  <div style="font-size:11px;color:#3E4A58;">© Eight Wide · speedchampions.cz</div>
</td></tr>
</table>
</body>
</html>`
}
