#!/usr/bin/env python3
import os
import json
import urllib.request
import ssl
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def format_platform_status(name, data):
    status = data.get('status', 'SKIPPED')
    url = data.get('url')
    error = data.get('error')

    if status == 'PUBLISHED':
        link_html = f' &bull; <a href="{url}" style="color:#38bdf8;text-decoration:none;font-weight:600;" target="_blank">View on {name} &rarr;</a>' if url else ''
        return f'<span style="display:inline-block;padding:2px 8px;background:#064e3b;color:#34d399;border-radius:4px;font-weight:700;font-size:12px;">✅ PUBLISHED</span>{link_html}'
    elif status == 'FAILED':
        err_msg = f'<div style="font-size:12px;color:#f87171;margin-top:4px;font-family:monospace;background:#2d1518;padding:6px 8px;border-radius:4px;word-break:break-word;">{error}</div>' if error else ''
        return f'<span style="display:inline-block;padding:2px 8px;background:#4c0519;color:#f43f5e;border-radius:4px;font-weight:700;font-size:12px;">❌ UPLOAD FAILED</span>{err_msg}'
    else:
        return f'<span style="display:inline-block;padding:2px 8px;background:#1e293b;color:#94a3b8;border-radius:4px;font-size:12px;">⏩ Skipped / Paused</span>'

def main():
    resend_key = os.environ.get('RESEND_API_KEY')
    smtp_pass = os.environ.get('NOTIFY_EMAIL_PASS')
    recipient = os.environ.get('NOTIFY_EMAIL_TO', 'contact@nextai-apps.com')
    repo = os.environ.get('REPO_NAME', 'sverma9312/nextai-video-generator')
    run_number = os.environ.get('RUN_NUMBER', '0')
    run_id = os.environ.get('RUN_ID', '0')
    actor = os.environ.get('ACTOR', 'system')
    event = os.environ.get('EVENT_NAME', 'workflow_dispatch')

    summary_file = os.path.join(os.getcwd(), 'build', 'failure_summary.json')
    summary_data = {}
    if os.path.exists(summary_file):
        try:
            with open(summary_file, 'r', encoding='utf-8') as f:
                summary_data = json.load(f)
        except Exception as e:
            print(f"⚠️ Could not read {summary_file}: {e}")

    failed_platforms = summary_data.get('failedPlatforms', [])
    topic_title = summary_data.get('topicTitle', '')
    company = summary_data.get('company', '')
    yt_data = summary_data.get('youtube', {})
    ig_data = summary_data.get('instagram', {})

    # Determine dynamic Subject and Headline
    if 'YouTube' in failed_platforms and 'Instagram' in failed_platforms:
        subject = f"🚨 [{repo}] Both YouTube & Instagram Failed: \"{topic_title}\""
        headline = "Both YouTube & Instagram Upload Failed"
        badge_text = "MULTI-PLATFORM FAILURE"
        badge_bg = "#dc2626"
    elif 'YouTube' in failed_platforms:
        subject = f"🚨 [{repo}] YouTube Upload Failed: \"{topic_title}\""
        headline = "YouTube Shorts Upload Failed"
        badge_text = "YOUTUBE FAILED"
        badge_bg = "#e11d48"
    elif 'Instagram' in failed_platforms:
        subject = f"🚨 [{repo}] Instagram Reel Upload Failed: \"{topic_title}\""
        headline = "Instagram Reel Upload Failed"
        badge_text = "INSTAGRAM FAILED"
        badge_bg = "#e11d48"
    elif topic_title:
        subject = f"🚨 [{repo}] Pipeline Execution Failed: \"{topic_title}\""
        headline = "Pipeline Execution Failed"
        badge_text = "PIPELINE FAILED"
        badge_bg = "#ea580c"
    else:
        subject = f"🚨 [{repo}] Video Generation / Render Failed (Run #{run_number})"
        headline = "Video Generation & Render Failed"
        badge_text = "RENDER FAILED"
        badge_bg = "#ea580c"

    yt_status_html = format_platform_status('YouTube', yt_data) if yt_data else '<span style="color:#94a3b8;">Not attempted</span>'
    ig_status_html = format_platform_status('Instagram', ig_data) if ig_data else '<span style="color:#94a3b8;">Not attempted</span>'

    topic_row = f"""
    <tr>
      <td class="label">News Story</td>
      <td><strong style="color:#ffffff;">{topic_title}</strong> {f'<span style="color:#94a3b8;">({company})</span>' if company else ''}</td>
    </tr>
    """ if topic_title else ""

    run_url = f"https://github.com/{repo}/actions/runs/{run_id}"
    workflow_url = f"https://github.com/{repo}/actions"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08090B; color: #e2e8f0; margin: 0; padding: 24px; }}
        .card {{ background-color: #0f1217; border: 1px solid #1f2937; border-radius: 12px; max-width: 620px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
        .header {{ background-color: #170d10; border-bottom: 1px solid #2d1518; padding: 22px 26px; }}
        .badge {{ display: inline-block; background-color: {badge_bg}; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 4px; }}
        .title {{ margin: 12px 0 0 0; color: #ffffff; font-size: 21px; font-weight: 700; }}
        .content {{ padding: 26px; }}
        .desc {{ color: #94a3b8; font-size: 14px; line-height: 1.5; margin-top: 0; }}
        .table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }}
        .table td {{ padding: 12px 14px; border-bottom: 1px solid #1e2633; color: #cbd5e1; vertical-align: top; }}
        .table td.label {{ color: #64748b; font-weight: 600; width: 32%; }}
        .btn-container {{ margin-top: 28px; text-align: center; }}
        .btn-primary {{ display: inline-block; background-color: #FF4820; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 8px; margin-right: 10px; }}
        .btn-secondary {{ display: inline-block; background-color: #1e293b; color: #cbd5e1 !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 20px; border-radius: 8px; }}
        .footer {{ border-top: 1px solid #1e2633; padding: 16px 26px; font-size: 12px; color: #475569; text-align: center; }}
        .note {{ background-color: #1a1712; border-left: 3px solid #f59e0b; padding: 12px 14px; margin-top: 20px; border-radius: 0 6px 6px 0; font-size: 13px; color: #d97706; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="badge">{badge_text}</span>
          <h1 class="title">🚨 {headline}</h1>
        </div>
        <div class="content">
          <p class="desc">The autonomous AIShort video pipeline encountered an error during distribution. Review the platform status and error trace below.</p>
          
          <table class="table">
            {topic_row}
            <tr>
              <td class="label">YouTube Shorts</td>
              <td>{yt_status_html}</td>
            </tr>
            <tr>
              <td class="label">Instagram Reels</td>
              <td>{ig_status_html}</td>
            </tr>
            <tr>
              <td class="label">Repository</td>
              <td><code style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#f1f5f9;">{repo}</code></td>
            </tr>
            <tr>
              <td class="label">Workflow Run</td>
              <td>#{run_number} &bull; <span style="color:#94a3b8;">Triggered by {actor} ({event})</span></td>
            </tr>
          </table>

          <div class="note">
            <strong>💡 Deduplication Ledger Safe:</strong><br/>
            Any platform marked as <strong style="color:#34d399;">PUBLISHED</strong> above has been recorded in Git. Running <em>Retry Last Video</em> will skip already published channels and only retry the failed platform.
          </div>

          <div class="btn-container">
            <a href="{run_url}" class="btn-primary" target="_blank">View Failed Run Logs &rarr;</a>
            <a href="{workflow_url}" class="btn-secondary" target="_blank">Open Workflow</a>
          </div>
        </div>
        <div class="footer">
          Autonomous AIShort Video Pipeline Monitor &bull; NextAI Studio Ops
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
