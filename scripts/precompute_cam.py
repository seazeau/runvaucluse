import json
import math

with open('public/itineraires/tmv_valescure_3d_data.json', 'r', encoding='utf-8') as f:
    track_data = json.load(f)

N = len(track_data)
TOTAL_FRAMES = 900 # 30.0 seconds at 30 fps
official_dplus = 1905.0
gain_factor = official_dplus / track_data[-1]['gain']

# 1. Smooth runner coordinates for camera center (18 points window to kill GPS noise while staying tight on runner)
smooth_coords = []
window_center = 18
for i in range(N):
    st = max(0, i - window_center)
    en = min(N, i + window_center + 1)
    sub = track_data[st:en]
    avg_lon = sum(p['lon'] for p in sub) / len(sub)
    avg_lat = sum(p['lat'] for p in sub) / len(sub)
    smooth_coords.append([round(avg_lon, 6), round(avg_lat, 6)])

cam_frames = []

for f in range(TOTAL_FRAMES):
    if f < 75:
        # Intro: swoop in from wide mountain view down into close runner tracking
        t = f / 75.0
        t_smooth = t * t * (3 - 2 * t)
        active_idx = 0
        cur_dist = 0.0
        cur_gain = 0.0
        cur_ele = track_data[0]['ele']
        
        # Start at zoom 12.8 -> swoop down to 14.65
        zoom = 12.8 * (1 - t_smooth) + 14.65 * t_smooth
        pitch = 50.0 * (1 - t_smooth) + 64.0 * t_smooth
        bearing = 25.0 * (1 - t_smooth) + 28.0 * t_smooth
        
        # Camera center starts slightly offset to show valley, then locks on start point
        start_pt = smooth_coords[0]
        cam_lon = (start_pt[0] - 0.008) * (1 - t_smooth) + start_pt[0] * t_smooth
        cam_lat = (start_pt[1] - 0.005) * (1 - t_smooth) + start_pt[1] * t_smooth
        
    elif f < 810:
        # Active race tracking: CLOSE UP!
        progress = (f - 75) / 735.0
        p_idx = int(progress * (N - 1))
        active_idx = p_idx
        cur_dist = track_data[active_idx]['dist']
        cur_gain = track_data[active_idx]['gain'] * gain_factor
        cur_ele = track_data[active_idx]['ele']
        
        zoom = 14.65  # Close up, high detail!
        pitch = 64.0  # Dramatic 3D relief perspective!
        
        # Steady cinematic bearing drift (25° -> 42° -> 28° across the massif)
        progress_race = (f - 75) / 735.0
        bearing = 28.0 + 14.0 * math.sin(progress_race * math.pi)
        
        # Camera tracks runner tightly
        cam_lon = smooth_coords[active_idx][0]
        cam_lat = smooth_coords[active_idx][1]
        
    else:
        # Outro: pull up to grand panoramic view of the entire 43km loop
        t = (f - 810) / 90.0
        t_smooth = t * t * (3 - 2 * t)
        active_idx = N - 1
        cur_dist = 42.9
        cur_gain = official_dplus
        cur_ele = track_data[-1]['ele']
        
        end_pt = smooth_coords[-1]
        massif_lon, massif_lat = 5.1408, 43.9427
        
        zoom = 14.65 * (1 - t_smooth) + 11.75 * t_smooth
        pitch = 64.0 * (1 - t_smooth) + 50.0 * t_smooth
        bearing = 28.0 * (1 - t_smooth) + 32.0 * t_smooth
        
        cam_lon = end_pt[0] * (1 - t_smooth) + massif_lon * t_smooth
        cam_lat = end_pt[1] * (1 - t_smooth) + massif_lat * t_smooth

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

# Apply 15-frame smoothing to camera centers to ensure fluid camera tracking
smoothed_centers = []
for i in range(TOTAL_FRAMES):
    st = max(0, i - 12)
    en = min(TOTAL_FRAMES, i + 13)
    lons = [cam_frames[k]['camCenter'][0] for k in range(st, en)]
    lats = [cam_frames[k]['camCenter'][1] for k in range(st, en)]
    smoothed_centers.append([round(sum(lons)/len(lons), 5), round(sum(lats)/len(lats), 5)])

for i in range(TOTAL_FRAMES):
    cam_frames[i]['camCenter'] = smoothed_centers[i]

with open('public/itineraires/tmv_cam_frames.json', 'w', encoding='utf-8') as f:
    json.dump(cam_frames, f)

print(f"Precomputed {len(cam_frames)} CLOSE-UP camera frames (zoom 14.65)!")
