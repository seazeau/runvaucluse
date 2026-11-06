import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

KEY_PATH = r'C:\Users\vince\Downloads\studio-4444256527-34873-549d736fc5f4.json'
PROPERTY_ID = '559898249'

def get_analytics_summary(days=30):
    creds = service_account.Credentials.from_service_account_file(
        KEY_PATH,
        scopes=['https://www.googleapis.com/auth/analytics.readonly']
    )
    service = build('analyticsdata', 'v1beta', credentials=creds)
    property_name = f'properties/{PROPERTY_ID}'

    # 1. Overall totals
    totals_res = service.properties().runReport(
        property=property_name,
        body={
            'dateRanges': [{'startDate': f'{days}daysAgo', 'endDate': 'today'}],
            'metrics': [
                {'name': 'activeUsers'},
                {'name': 'newUsers'},
                {'name': 'sessions'},
                {'name': 'screenPageViews'},
                {'name': 'averageSessionDuration'}
            ]
        }
    ).execute()

    # 2. Top pages
    pages_res = service.properties().runReport(
        property=property_name,
        body={
            'dateRanges': [{'startDate': f'{days}daysAgo', 'endDate': 'today'}],
            'dimensions': [{'name': 'pagePath'}],
            'metrics': [
                {'name': 'screenPageViews'},
                {'name': 'activeUsers'}
            ],
            'limit': 15
        }
    ).execute()

    # 3. Traffic sources / acquisition
    sources_res = service.properties().runReport(
        property=property_name,
        body={
            'dateRanges': [{'startDate': f'{days}daysAgo', 'endDate': 'today'}],
            'dimensions': [{'name': 'sessionSourceMedium'}],
            'metrics': [
                {'name': 'sessions'},
                {'name': 'activeUsers'}
            ],
            'limit': 10
        }
    ).execute()

    # 4. Real-time active users (last 30 min)
    try:
        realtime_res = service.properties().runRealtimeReport(
            property=property_name,
            body={
                'metrics': [{'name': 'activeUsers'}]
            }
        ).execute()
        realtime_users = realtime_res.get('rows', [{'metricValues': [{'value': '0'}]}])[0]['metricValues'][0]['value']
    except Exception:
        realtime_users = 'N/A'

    return {
        'period': f'Derniers {days} jours',
        'realtime_active_users_30min': realtime_users,
        'totals': totals_res.get('rows', []),
        'top_pages': [
            {
                'page': row['dimensionValues'][0]['value'],
                'views': row['metricValues'][0]['value'],
                'users': row['metricValues'][1]['value']
            }
            for row in pages_res.get('rows', [])
        ],
        'top_sources': [
            {
                'source': row['dimensionValues'][0]['value'],
                'sessions': row['metricValues'][0]['value'],
                'users': row['metricValues'][1]['value']
            }
            for row in sources_res.get('rows', [])
        ]
    }

if __name__ == '__main__':
    try:
        data = get_analytics_summary(30)
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}")
