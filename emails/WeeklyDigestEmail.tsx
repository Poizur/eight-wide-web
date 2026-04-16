interface DigestArticle {
  title: string
  slug: string
  brand: string
  series: string
}

interface WeeklyDigestProps {
  articles: DigestArticle[]
  saleCount: number
  baseUrl: string
}

export function renderWeeklyDigestEmail({ articles, saleCount, baseUrl }: WeeklyDigestProps): string {
  const articleRows = articles
    .map(
      (a) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
        <div style="font-size:10px;color:#C9A227;text-transform:uppercase;letter-spacing:0.16em;font-weight:700;">${a.series} · ${a.brand}</div>
        <a href="${baseUrl}/${a.series}/${a.slug}" style="font-size:16px;font-weight:700;color:#EAE8E0;text-decoration:none;line-height:1.3;">${a.title}</a>
      </td>
    </tr>`
    )
    .join('')

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
  <h1 style="font-size:24px;font-weight:700;color:#EAE8E0;margin:0 0 8px;">Tydenni prehled</h1>
  <p style="font-size:14px;color:#8B95A8;margin:0 0 24px;">Novy obsah + ${saleCount} aktivnich slev tento tyden.</p>
  <table width="100%" cellpadding="0" cellspacing="0">${articleRows}</table>
  <a href="${baseUrl}/ceny" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#C9A227;color:#000;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:8px;">
    Vsechny ceny →
  </a>
</td></tr>
<tr><td style="padding-top:40px;border-top:1px solid rgba(255,255,255,0.07);">
  <div style="font-size:11px;color:#3E4A58;">
    © Eight Wide · speedchampions.cz ·
    <a href="${baseUrl}/api/confirm?action=unsubscribe&token=UNSUB_TOKEN" style="color:#3E4A58;">Odhlasit</a>
  </div>
</td></tr>
</table>
</body>
</html>`
}
