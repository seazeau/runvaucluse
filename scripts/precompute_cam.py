import json
import math

with open('public/itineraires/tmv_valescure_3d_data.json', 'r', encoding='utf-8') as f:
    track_data = json.load(f)

N = len(track_data)
TOTAL_FRAMES = 900 # 30.0 seconds at 30 fps
official_dplus = 1905.0
gain_factor = official_dplus / track_data[-1]['gain']

# 900 frames:
# Frames 0..75 (2.5s): Intro swoop to start
# Frames 75..810 (24.5s): Course flyover
# Frames 810..900 (3.0s): Outro panorama + card

window = 450
cam_frames = []

for f in range(TOTAL_FRAMES):
    if f < 75:
        t = f / 75.0
        t_smooth = t * t * (3 - 2 * t)
        p_idx = 0
        active_idx = 0
        cur_dist = 0.0
        cur_gain = 0.0
        cur_ele = track_data[0]['ele']
        
        zoom = 12.2 * (1 - t_smooth) + 13.0 * t_smooth
        pitch = 48.0 * (1 - t_smooth) + 59.0 * t_smooth
        bearing = 22.0 * (1 - t_smooth) + 26.0 * t_smooth
    elif f < 810:
        progress = (f - 75) / 735.0
        p_idx = int(progress * (N - 1))
        active_idx = p_idx
        cur_dist = track_data[active_idx]['dist']
        cur_gain = track_data[active_idx]['gain'] * gain_factor
        cur_ele = track_data[active_idx]['ele']
        
        zoom = 13.05
        pitch = 59.0
        # Gentle panoramic drift across the massif
        progress_race = (f - 75) / 735.0
        bearing = 26.0 + 16.0 * math.sin(progress_race * math.pi)
    else:
        t = (f - 810) / 90.0
        t_smooth = t * t * (3 - 2 * t)
        active_idx = N - 1
        p_idx = N - 1
        cur_dist = 42.9
        cur_gain = official_dplus
        cur_ele = track_data[-1]['ele']
        
        zoom = 13.05 * (1 - t_smooth) + 11.75 * t_smooth
        pitch = 59.0 * (1 - t_smooth) + 50.0 * t_smooth
        bearing = 26.0 * (1 - t_smooth) + 32.0 * t_smooth

    # Sliding window average of runner position for steadycam
    start_i = max(0, p_idx - window)
    end_i = min(N, p_idx + window + 1)
    sub = track_data[start_i:end_i]
    cam_lon = sum(p['lon'] for p in sub) / len(sub)
    cam_lat = sum(p['lat'] for p in sub) / len(sub)
    
    # In outro, pull gently to center of whole massif
    if f >= 810:
        massif_lon, massif_lat = 5.1408, 43.9427
        cam_lon = cam_lon * (1 - t_smooth) + massif_lon * t_smooth
        cam_lat = cam_lat * (1 - t_smooth) + massif_lat * t_smooth

    cam_frames.append({
        'camCenter': [round(cam_lon, 5), round(cam_lat, 5)],
        'camZoom': round(zoom, 2),
        'camPitch': round(pitch, 1),
        'camBearing': round(bearing, 1),
        'activeIdx': active_idx,
        'curDist': round(cur_dist, 1),
        'curGain': round(cur_gain),
        'curEle': round(cur_ele)
    })

# Apply 35-frame moving average for 100% butter-smooth flight
smoothed_centers = []
for i in range(TOTAL_FRAMES):
    st = max(0, i - 30)
    en = min(TOTAL_FRAMES, i + 31)
    lons = [cam_frames[k]['camCenter'][0] for k in range(st, en)]
    lats = [cam_frames[k]['camCenter'][1] for k in range(st, en)]
    smoothed_centers.append([round(sum(lons)/len(lons), 5), round(sum(lats)/len(lats), 5)])

for i in range(TOTAL_FRAMES):
    cam_frames[i]['camCenter'] = smoothed_centers[i]

with open('public/itineraires/tmv_cam_frames.json', 'w', encoding='utf-8') as f:
    json.dump(cam_frames, f)

print(f"Precomputed {len(cam_frames)} ultra-smooth camera frames (30.0s)!")
