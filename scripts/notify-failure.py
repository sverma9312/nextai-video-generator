#!/usr/bin/env python3
import os
import json
import urllib.request
import ssl
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def main():
    resend_key = os.environ.get('RESEND_API_KEY')
    smtp_pass = os.environ.get('NOTIFY_EMAIL_PASS')
    recipient = os.environ.get('NOTIFY_EMAIL_TO', 'contact@nextai-apps.com')
    repo = os.environ.get('REPO_NAME', 'sverma9312/nextai-video-generator')
    run_number = os.environ.get('RUN_NUMBER', '0')
    run_id = os.environ.get('RUN_ID', '0')
    actor = os.environ.get('ACTOR', 'system')
    event = os.environ.get('EVENT_NAME', 'workflow_dispatch')

    subject = f"🚨 [{repo}] AIShort Video Pipeline Failure Alert (Run #{run_number})"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #e2e8f0; margin: 0; padding: 24px; }}
        .card {{ background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; max-width: 600px; margin: 0 auto; overflow: hidden; }}
        .header {{ background-color: #1f1315; border-bottom: 1px solid #371b20; padding: 20px 24px; }}
        .badge {{ display: inline-block; background-color: #FF4820; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 8px; border-radius: 4px; }}
        .title {{ margin: 12px 0 0 0; color: #ffffff; font-size: 20px; font-weight: 600; }}
        .content {{ padding: 24px; }}
        .desc {{ color: #94a3b8; font-size: 14px; line-height: 1.5; margin-top: 0; }}
        .table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }}
        .table td {{ padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #cbd5e1; }}
        .table td.label {{ color: #64748b; font-weight: 500; width: 35%; }}
        .btn-container {{ margin-top: 28px; text-align: center; }}
        .btn {{ display: inline-block; background-color: #FF4820; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; }}
        .footer {{ border-top: 1px solid #1e293b; padding: 16px 24px; font-size: 12px; color: #475569; text-align: center; }}
        .note {{ background-color: #1e1b18; border-left: 3px solid #f59e0b; padding: 12px 14px; margin-top: 16px; border-radius: 0 6px 6px 0; font-size: 13px; color: #d97706; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="badge">NextAI Production Alert</span>
          <h1 class="title">🚨 AIShort Video Pipeline Execution Failed</h1>
        </div>
        <div class="content">
          <p class="desc">A failure occurred during social media distribution (YouTube or Instagram). Please check the details below.</p>
          
          <table class="table">
            <tr>
              <td class="label">Repository</td>
              <td><strong>{repo}</strong></td>
            </tr>
            <tr>
              <td class="label">Workflow Run</td>
              <td>#{run_number}</td>
            </tr>
            <tr>
              <td class="label">Triggered By</td>
              <td>{actor} ({event})</td>
            </tr>
            <tr>
              <td class="label">Primary Impact</td>
              <td>Social Upload Incomplete</td>
            </tr>
          </table>

          <div class="note">
            <strong>💡 Deduplication Ledger Preserved:</strong><br/>
            If one platform succeeded (e.g. YouTube or Instagram), its published URL was safely recorded in Git. Running a Retry will skip already published channels and only retry the failed platform.
          </div>

          <div class="btn-container">
            <a href="https://github.com/{repo}/actions/runs/{run_id}" class="btn">View Failed Run & Logs in GitHub</a>
          </div>
        </div>
        <div class="footer">
          Autonomous Pipeline Monitor · NextAI Studio Ops
        </div>
      </div>
    </body>
    </html>
    """

    sent = False

    # Strategy 1: Resend API
    if resend_key:
        print("📡 Attempting notification via Resend API...")
        payload = {
            "from": "NextAI Alerts <alerts@nextai-apps.com>",
            "to": [recipient],
            "subject": subject,
            "html": html_body
        }
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=json.dumps(payload).encode('utf-8'),
            headers={
                "Authorization": f"Bearer {resend_key}",
                "Content-Type": "application/json",
                "User-Agent": "NextAI-Workflow-Bot"
            }
        )
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode())
                print(f"✅ Alert email delivered via Resend to {recipient}! (ID: {data.get('id')})")
                sent = True
        except urllib.error.HTTPError as e:
            err_body = e.read().decode()
            print(f"⚠️ Resend HTTP {e.code}: {err_body}")
        except Exception as e:
            print(f"⚠️ Resend dispatch error: {e}")

    # Strategy 2: Fallback to SMTP if NOTIFY_EMAIL_PASS is provided
    if not sent and smtp_pass:
        print("📡 Attempting notification via Gmail SMTP...")
        try:
            sender = os.environ.get('NOTIFY_EMAIL_USER', 'nextaiapps.team@gmail.com')
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"NextAI Bot <{sender}>"
            msg['To'] = recipient
            msg.attach(MIMEText(html_body, 'html'))
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
                server.login(sender, smtp_pass)
                server.sendmail(sender, [recipient], msg.as_string())
            print(f"✅ Alert email delivered via Gmail SMTP to {recipient}!")
            sent = True
        except Exception as e:
            print(f"⚠️ SMTP dispatch error: {e}")

    if not sent and not resend_key and not smtp_pass:
        print("ℹ️ Neither RESEND_API_KEY nor NOTIFY_EMAIL_PASS is configured. Skipping email dispatch.")

if __name__ == '__main__':
    main()
