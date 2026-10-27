import json
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build

key_path = r'C:\Users\vince\Downloads\studio-4444256527-34873-549d736fc5f4.json'
creds = service_account.Credentials.from_service_account_file(
    key_path,
    scopes=['https://www.googleapis.com/auth/webmasters.readonly']
)
service = build('searchconsole', 'v1', credentials=creds)
site_url = 'sc-domain:runvaucluse.fr'

end_date = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')
start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')

# Global totals
totals_req = {
    'startDate': start_date,
    'endDate': end_date
}
res_total = service.searchanalytics().query(siteUrl=site_url, body=totals_req).execute()

# Device breakdown
device_req = {
    'startDate': start_date,
    'endDate': end_date,
    'dimensions': ['device']
}
res_device = service.searchanalytics().query(siteUrl=site_url, body=device_req).execute()

# Top 20 queries
q_req = {
    'startDate': start_date,
    'endDate': end_date,
    'dimensions': ['query'],
    'rowLimit': 20
}
res_q = service.searchanalytics().query(siteUrl=site_url, body=q_req).execute()

# Top 20 pages
p_req = {
    'startDate': start_date,
    'endDate': end_date,
    'dimensions': ['page'],
    'rowLimit': 20
}
res_p = service.searchanalytics().query(siteUrl=site_url, body=p_req).execute()

# Sitemaps
sitemaps = service.sitemaps().list(siteUrl=site_url).execute()

# Daily trend
dates_req = {
    'startDate': start_date,
    'endDate': end_date,
    'dimensions': ['date']
}
res_dates = service.searchanalytics().query(siteUrl=site_url, body=dates_req).execute()

output = {
    'period': f'{start_date} -> {end_date}',
    'totals': res_total.get('rows', []),
    'devices': res_device.get('rows', []),
    'daily': sorted(res_dates.get('rows', []), key=lambda x: x['keys'][0])[-14:],
    'top_queries': res_q.get('rows', []),
    'top_pages': res_p.get('rows', []),
    'sitemaps': sitemaps.get('sitemap', [])
}

print(json.dumps(output, indent=2, ensure_ascii=False))
