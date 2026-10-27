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

q_req = {
    'startDate': start_date,
    'endDate': end_date,
    'dimensions': ['query'],
    'rowLimit': 250
}
res_q = service.searchanalytics().query(siteUrl=site_url, body=q_req).execute()
rows = res_q.get('rows', [])

# 1. High impressions, CTR < 15% (Opportunities)
opps = [r for r in rows if r['impressions'] >= 100 and r['ctr'] < 0.15]
print("=== OPPORTUNITES DE GAIN DE CLICS (Forte visibilité, CTR < 15%) ===")
for r in sorted(opps, key=lambda x: x['impressions'], reverse=True)[:15]:
    q = r['keys'][0]
    imp = r['impressions']
    cl = r['clicks']
    ctr = r['ctr'] * 100
    pos = r['position']
    print(f"{q:<40} | Impr: {imp:<5} | Clics: {cl:<4} | CTR: {ctr:4.1f}% | Pos: {pos:.1f}")

# 2. Queries on "résultats" / "classement"
res_queries = [r for r in rows if any(k in r['keys'][0].lower() for k in ['resultat', 'résultat', 'classement', 'chrono'])]
print("\n=== REQUETES 'RESULTATS' / 'CLASSEMENT' ===")
for r in sorted(res_queries, key=lambda x: x['impressions'], reverse=True)[:15]:
    q = r['keys'][0]
    imp = r['impressions']
    cl = r['clicks']
    ctr = r['ctr'] * 100
    pos = r['position']
    print(f"{q:<40} | Impr: {imp:<5} | Clics: {cl:<4} | CTR: {ctr:4.1f}% | Pos: {pos:.1f}")

# 3. High potential Generic Queries (calendrier, course vaucluse...)
gen_queries = [r for r in rows if any(k in r['keys'][0].lower() for k in ['course', 'trail', 'calendrier', 'running', 'marathon']) and not any(city in r['keys'][0].lower() for city in ['papes', 'ventouret', 'saumane', 'pernes', 'cavaillon', 'mathias', 'pontet'])]
print("\n=== REQUETES GENERIQUES / DECOUVRABILITE ===")
for r in sorted(gen_queries, key=lambda x: x['impressions'], reverse=True)[:15]:
    q = r['keys'][0]
    imp = r['impressions']
    cl = r['clicks']
    ctr = r['ctr'] * 100
    pos = r['position']
    print(f"{q:<40} | Impr: {imp:<5} | Clics: {cl:<4} | CTR: {ctr:4.1f}% | Pos: {pos:.1f}")
