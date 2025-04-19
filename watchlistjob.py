import os
import requests
import datetime
import smtplib
from email.mime.text import MIMEText
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Email credentials
EMAIL_ADDRESS = "ENTER_SENDER_ADDRESS_HERE"
EMAIL_PASSWORD = "ENTER_SENDER_PASSWORD_HERE"

# FDA recall date range for the past day
today = datetime.date.today()
yesterday = today - datetime.timedelta(days=1)
start = yesterday.strftime("%Y%m%d")
end = today.strftime("%Y%m%d")
fda_url = f"https://api.fda.gov/drug/enforcement.json?search=report_date:[{start}+TO+{end}]&limit=400"
# https://api.fda.gov/drug/enforcement.json?search=report_date:[20250322+TO+20250419]&limit=400
# Fetch recalls from FDA API
try:
    response = requests.get(fda_url)
    if response.status_code == 404:
        print("⚠️ No new recalls in the past day.")
        recalls = []
    else:
        response.raise_for_status()
        recalls = response.json().get("results", [])
except Exception as e:
    print("❌ FDA API call failed:", e)
    recalls = []

# Fetch user watchlist from Supabase
try:
    watchlist_data = supabase.table("watchlist").select("*").execute().data
except Exception as e:
    print("❌ Failed to load watchlist from Supabase:", e)
    watchlist_data = []

# Match recalls per user
user_notifications = {}

for item in watchlist_data:
    user_email = item.get("email")
    med_name = item.get("medication_name", "").lower()

    if not user_email or not med_name:
        continue

    for recall in recalls:
        recall_text = " ".join(
            [
                str(recall.get("product_description", "")),
                str(recall.get("brand_name", "")),
                str(recall.get("generic_name", "")),
            ]
        ).lower()

        if med_name in recall_text:
            if user_email not in user_notifications:
                user_notifications[user_email] = []
            if med_name not in user_notifications[user_email]:
                user_notifications[user_email].append(med_name)


# Email sender function
def send_email(to, meds):
    subject = "FDA Recall Alert: Your Medication Watchlist"
    body = (
        f"🚨 The following medication(s) on your watchlist were recalled in the past 24 hours:\n\n"
        + "\n".join(f"- {med}" for med in meds)
        + "\n\nYou can view full recall details at: https://your-app-url.com/recall-info"
    )

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
        print(f"✅ Email sent to {to}")
    except Exception as e:
        print(f"❌ Failed to send email to {to}: {e}")


# Send notifications to each user
for email, meds in user_notifications.items():
    send_email(email, meds)
devEmails = [
    "jcmisawesome789@gmail.com",
    "mjcastillo@cpp.edu",
    "mphamlq@gmail.com",
    "student.joshuaestrada@gmail.com",
]
for email in devEmails:
    send_email(email, ["weed, cocaine"])
