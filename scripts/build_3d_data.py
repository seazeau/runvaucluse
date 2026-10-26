import math
import json
import xml.etree.ElementTree as ET

def build_3d_track_data():
    gpx_path = 'public/itineraires/tmv-valescure-43km.gpx'
    tree = ET.parse(gpx_path)
    root = tree.getroot()
    ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
    
    raw_points = []
    for trkpt in root.findall('.//gpx:trkpt', ns):
        lat = float(trkpt.attrib['lat'])
        lon = float(trkpt.attrib['lon'])
        ele_elem = trkpt.find('gpx:ele', ns)
        ele = float(ele_elem.text) if ele_elem is not None else 0.0
        raw_points.append({'lat': lat, 'lon': lon, 'ele': ele})

    print(f"Loaded {len(raw_points)} raw points")

    # Cumulative dist and bearing
    processed = []
    total_dist = 0.0
    total_ele_gain = 0.0
    prev_pt = None

    for i, pt in enumerate(raw_points):
        lat, lon, ele = pt['lat'], pt['lon'], pt['ele']
        bearing = 0.0
        
        if prev_pt:
            R = 6371.0
            dlat = math.radians(lat - prev_pt['lat'])
            dlon = math.radians(lon - prev_pt['lon'])
            a = math.sin(dlat/2)**2 + math.cos(math.radians(prev_pt['lat'])) * math.cos(math.radians(lat)) * math.sin(dlon/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            dist = R * c
            total_dist += dist

            dele = ele - prev_pt['ele']
            if dele > 0:
                total_ele_gain += dele

            # Calculate forward bearing
            y = math.sin(dlon) * math.cos(math.radians(lat))
            x = math.cos(math.radians(prev_pt['lat'])) * math.sin(math.radians(lat)) - math.sin(math.radians(prev_pt['lat'])) * math.cos(math.radians(lat)) * math.cos(dlon)
            bearing = (math.degrees(math.atan2(y, x)) + 360) % 360
        else:
            bearing = 45.0

        processed.append({
            'lat': round(lat, 6),
            'lon': round(lon, 6),
            'ele': round(ele, 1),
            'dist': round(total_dist, 2),
            'gain': round(total_ele_gain, 1),
            'bearing': round(bearing, 1)
        })
        prev_pt = pt

    # Smooth bearings to avoid jerky camera rotation
    smooth_window = 15
    for i in range(len(processed)):
        start = max(0, i - smooth_window)
        end = min(len(processed), i + smooth_window + 1)
        # Circular mean for angles
        sin_sum = sum(math.sin(math.radians(processed[k]['bearing'])) for k in range(start, end))
        cos_sum = sum(math.cos(math.radians(processed[k]['bearing'])) for k in range(start, end))
        avg_bearing = (math.degrees(math.atan2(sin_sum, cos_sum)) + 360) % 360
        processed[i]['bearing'] = round(avg_bearing, 1)

    out_file = 'public/itineraires/tmv_valescure_3d_data.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(processed, f)
    print(f"Saved {len(processed)} points to {out_file}")

if __name__ == '__main__':
    build_3d_track_data()
