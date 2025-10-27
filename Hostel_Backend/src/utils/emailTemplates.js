export const loginSuccessTemplate = ({ name, when, ipInfo }) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Login Notification</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f4f6f8; margin:0; padding:0 }
    .container { max-width:680px; margin:32px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 6px 24px rgba(20,30,60,0.08) }
    .header { background:linear-gradient(90deg,#0ea5a4,#4338ca); color:#fff; padding:20px }
    .body { padding:24px; color:#0f172a }
    h1 { margin:0 0 8px; font-size:20px }
    p { margin:8px 0 0; color:#334155 }
    .footer { padding:16px; font-size:12px; color:#94a3b8; text-align:center; background:#f8fafc }
    .meta { margin-top:12px; padding:12px; background:#f1f5f9; border-radius:6px; font-size:13px }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Successful Login</h2>
    </div>
    <div class="body">
      <h1>Hello ${name || 'User'},</h1>
      <p>We detected a successful sign-in to your account.</p>
      <div class="meta">
        <strong>When:</strong> ${when || new Date().toUTCString()}<br />
        ${ipInfo ? `
        <strong>IP:</strong> ${ipInfo.ip || 'Unknown'}<br />
        <strong>Location:</strong> ${[ipInfo.city, ipInfo.region, ipInfo.country].filter(Boolean).join(', ') || 'Unknown'}<br />
        <strong>ISP/Org:</strong> ${ipInfo.org || 'Unknown'}<br />
        ` : ''}
        If this wasn't you, please reset your password immediately or contact support.
      </div>
      <p style="margin-top:16px">Thanks,<br/>Hostel Management Team</p>
    </div>
    <div class="footer">This is an automated message — please do not reply to this email.</div>
  </div>
</body>
</html>
`;

export const welcomeTemplate = ({ name, id, role }) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Welcome to Hostel</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; background:#f4f6f8; margin:0 }
    .card{max-width:700px;margin:28px auto;background:#fff;border-radius:8px;padding:20px;box-shadow:0 6px 20px rgba(20,30,60,0.06)}
    .logo{height:36px}
    h1{font-size:20px;margin:0 0 8px}
    p{color:#334155}
    .cta{display:inline-block;margin-top:16px;padding:10px 16px;background:#4338ca;color:#fff;border-radius:6px;text-decoration:none}
    .meta{margin-top:12px;padding:12px;background:#f8fafc;border-radius:6px;font-size:13px}
  </style>
</head>
<body>
  <div class="card">
    <h1>Welcome ${name || 'User'}!</h1>
    <p>Your account has been created with role <strong>${role}</strong>.</p>
    <div class="meta">
      <strong>Account ID:</strong> ${id || 'N/A'}
    </div>
    <p style="margin-top:12px">You can now log in using your email. If you did not request this account, contact your administrator.</p>
    <a class="cta" href="#">Go to Portal</a>
  </div>
</body>
</html>
`;

export const mealNotificationTemplate = ({ studentName, action, foodName, quantity, date, price, total, addedBy }) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Meal Update</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;background:#f4f6f8;margin:0}
    .card{max-width:680px;margin:28px auto;background:#fff;padding:20px;border-radius:8px;box-shadow:0 6px 20px rgba(20,30,60,0.06)}
    h1{font-size:18px;margin:0}
    p{color:#334155}
    .meta{margin-top:12px;padding:12px;background:#f8fafc;border-radius:6px}
  </style>
</head>
<body>
  <div class="card">
    <h1>Meal ${action}</h1>
    <p>Hi ${studentName || 'Student'},</p>
    <p>Your meal record has been <strong>${action}</strong>.</p>
    <div class="meta">
      <strong>Food:</strong> ${foodName || 'Unknown'}<br />
      <strong>Quantity:</strong> ${quantity || 1}<br />
      <strong>Price (per item):</strong> ${typeof price !== 'undefined' ? ('\u20B9 ' + price) : 'N/A'}<br />
      <strong>Total:</strong> ${typeof total !== 'undefined' ? ('\u20B9 ' + total) : 'N/A'}<br />
      <strong>Date / Time:</strong> ${date || new Date().toLocaleString()}<br />
      <strong>Added by:</strong> ${addedBy || 'Administrator'}
    </div>
    <p style="margin-top:12px">If you have questions about your meals, contact administration.</p>
  </div>
</body>
</html>
`;

export const monthlyReportTemplate = ({ studentName, studentId, month, items, total }) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Monthly Meal Report</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;background:#f4f6f8;margin:0}
    .card{max-width:900px;margin:20px auto;background:#fff;padding:20px;border-radius:8px;box-shadow:0 6px 20px rgba(20,30,60,0.06)}
    table{width:100%;border-collapse:collapse}
    th,td{padding:8px;border:1px solid #e6eef6;text-align:left}
    th{background:#f1f5f9}
    h1{font-size:18px;margin:0 0 12px}
  </style>
</head>
<body>
  <div class="card">
    <h1>Monthly Meal Report — ${month}</h1>
    <p>Student: <strong>${studentName || studentId}</strong> (${studentId})</p>
    <table>
      <thead><tr><th>Date</th><th>Food</th><th>Qty</th><th>Price</th><th>Line Total</th></tr></thead>
      <tbody>
        ${items && items.length ? items.map(it => `<tr><td>${it.date}</td><td>${it.foodName}</td><td>${it.quantity}</td><td>₹ ${it.price}</td><td>₹ ${it.line_total}</td></tr>`).join('') : '<tr><td colspan="5">No meals recorded for this period.</td></tr>'}
      </tbody>
      <tfoot>
        <tr><td colspan="4" style="text-align:right"><strong>Monthly Total</strong></td><td><strong>₹ ${total}</strong></td></tr>
      </tfoot>
    </table>
    <p style="margin-top:12px">If you have questions, contact your administration.</p>
  </div>
</body>
</html>
`;

export const weeklyReportTemplate = ({ studentName, studentId, weekStart, weekEnd, items, total }) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Weekly Meal Report</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;background:#f4f6f8;margin:0}
    .card{max-width:900px;margin:20px auto;background:#fff;padding:20px;border-radius:8px;box-shadow:0 6px 20px rgba(20,30,60,0.06)}
    table{width:100%;border-collapse:collapse}
    th,td{padding:8px;border:1px solid #e6eef6;text-align:left}
    th{background:#f1f5f9}
    h1{font-size:18px;margin:0 0 12px}
  </style>
</head>
<body>
  <div class="card">
    <h1>Weekly Meal Report</h1>
    <p>Student: <strong>${studentName || studentId}</strong> (${studentId})</p>
    <p>Week: <strong>${weekStart}</strong> — <strong>${weekEnd}</strong></p>
    <table>
      <thead><tr><th>Date</th><th>Food</th><th>Qty</th><th>Price</th><th>Line Total</th></tr></thead>
      <tbody>
        ${items && items.length ? items.map(it => `<tr><td>${it.date}</td><td>${it.foodName}</td><td>${it.quantity}</td><td>₹ ${it.price}</td><td>₹ ${it.line_total}</td></tr>`).join('') : '<tr><td colspan="5">No meals recorded for this period.</td></tr>'}
      </tbody>
      <tfoot>
        <tr><td colspan="4" style="text-align:right"><strong>Weekly Total</strong></td><td><strong>₹ ${total}</strong></td></tr>
      </tfoot>
    </table>
  </div>
</body>
</html>
`;

export const paymentNotificationTemplate = ({ studentName, studentId, month, total, payUrl, paymentId, due }) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Payment Due</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;background:#f4f6f8;margin:0}
    .card{max-width:680px;margin:28px auto;background:#fff;padding:20px;border-radius:8px;box-shadow:0 6px 20px rgba(20,30,60,0.06)}
    .btn{display:inline-block;padding:10px 14px;background:#0ea5a4;color:#fff;border-radius:6px;text-decoration:none}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    th,td{padding:8px;border:1px solid #eef4fb;text-align:left}
  </style>
</head>
<body>
  <div class="card">
    <h2>Payment Notice</h2>
    <p>Hi ${studentName || studentId},</p>
    <p>Your monthly payment for <strong>${month}</strong> has been generated.</p>
    <table>
      <tr><th>Payment ID</th><td>${paymentId}</td></tr>
      <tr><th>Student</th><td>${studentName || studentId} (${studentId})</td></tr>
      <tr><th>Amount Due</th><td>₹ ${total}</td></tr>
      ${due ? `<tr><th>Due</th><td>${due}</td></tr>` : ''}
    </table>
    <p style="margin-top:12px"><a class="btn" href="${payUrl}">Pay Now</a></p>
    <p style="margin-top:12px">If you have already paid, please ignore this message.</p>
  </div>
</body>
</html>
`;
