import math
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# --- 1. GPX & Coordinate Utilities ---
def deg2num(lat_deg, lon_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return xtile, ytile

def num2deg(xtile, ytile, zoom):
    n = 2.0 ** zoom
    lon_deg = xtile / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
    lat_deg = math.degrees(lat_rad)
    return lat_deg, lon_deg

def parse_gpx(gpx_path):
    import xml.etree.ElementTree as ET
    tree = ET.parse(gpx_path)
    root = tree.getroot()
    ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
    points = []
    total_dist = 0.0
    total_ele_gain = 0.0
    prev_pt = None
    
    for trkpt in root.findall('.//gpx:trkpt', ns):
        lat = float(trkpt.attrib['lat'])
        lon = float(trkpt.attrib['lon'])
        ele_elem = trkpt.find('gpx:ele', ns)
        ele = float(ele_elem.text) if ele_elem is not None else 0.0
        
        if prev_pt:
            R = 6371.0 # km
            dlat = math.radians(lat - prev_pt['lat'])
            dlon = math.radians(lon - prev_pt['lon'])
            a = math.sin(dlat/2)**2 + math.cos(math.radians(prev_pt['lat'])) * math.cos(math.radians(lat)) * math.sin(dlon/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            dist = R * c
            total_dist += dist
            
            dele = ele - prev_pt['ele']
            if dele > 0:
                total_ele_gain += dele
        
        pt_data = {
            'lat': lat,
            'lon': lon,
            'ele': ele,
            'dist_km': total_dist,
            'ele_gain_m': total_ele_gain
        }
        points.append(pt_data)
        prev_pt = pt_data
        
    return points

# --- 2. Tile Fetcher & Mosaic ---
def download_tile(args):
    z, x, y, cache_dir = args
    tile_file = os.path.join(cache_dir, f"tile_{z}_{x}_{y}.jpg")
    if os.path.exists(tile_file) and os.path.getsize(tile_file) > 1000:
        return x, y, tile_file
    url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read()
            with open(tile_file, 'wb') as f:
                f.write(data)
        return x, y, tile_file
    except Exception:
        return x, y, None

def get_mosaic(min_lat, max_lat, min_lon, max_lon, zoom=15):
    cache_dir = os.path.join("data", "tiles_cache")
    os.makedirs(cache_dir, exist_ok=True)
    
    x1, y1 = deg2num(max_lat, min_lon, zoom)
    x2, y2 = deg2num(min_lat, max_lon, zoom)
    min_x, max_x = min(x1, x2), max(x1, x2)
    min_y, max_y = min(y1, y2), max(y1, y2)
    
    tasks = [(zoom, x, y, cache_dir) for x in range(min_x, max_x + 1) for y in range(min_y, max_y + 1)]
    with ThreadPoolExecutor(max_workers=16) as executor:
        results = list(executor.map(download_tile, tasks))
        
    width = (max_x - min_x + 1) * 256
    height = (max_y - min_y + 1) * 256
    mosaic = np.zeros((height, width, 3), dtype=np.uint8)
    
    for x, y, tile_path in results:
        if tile_path and os.path.exists(tile_path):
            img = cv2.imread(tile_path)
            if img is not None:
                ox = (x - min_x) * 256
                oy = (y - min_y) * 256
                mosaic[oy:oy+256, ox:ox+256] = img
                
    return mosaic, min_x, min_y, zoom

def latlon_to_pixel(lat, lon, min_x, min_y, zoom):
    n = 2.0 ** zoom
    fx = (lon + 180.0) / 360.0 * n
    lat_rad = math.radians(lat)
    fy = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
    px = (fx - min_x) * 256.0
    py = (fy - min_y) * 256.0
    return px, py

# --- 3. Main Video Renderer ---
def render_reel():
    print("[*] Initialisation de la generation du Reel Fly 3D...")
    gpx_path = 'public/itineraires/tmv-valescure-43km.gpx'
    points = parse_gpx(gpx_path)
    total_pts = len(points)
    print(f"[+] {total_pts} points GPS charges. Distance: {points[-1]['dist_km']:.2f} km, D+: {points[-1]['ele_gain_m']:.0f} m")

    lats = [p['lat'] for p in points]
    lons = [p['lon'] for p in points]
    min_lat, max_lat = min(lats) - 0.012, max(lats) + 0.012
    min_lon, max_lon = min(lons) - 0.012, max(lons) + 0.012

    zoom = 15
    mosaic, min_x, min_y, zoom = get_mosaic(min_lat, max_lat, min_lon, max_lon, zoom=zoom)
    mos_h, mos_w = mosaic.shape[:2]
    print(f"[+] Mosaique satellite prete: {mos_w} x {mos_h} px")

    # Convert all GPX points to mosaic pixel coordinates
    pixel_coords = []
    for p in points:
        px, py = latlon_to_pixel(p['lat'], p['lon'], min_x, min_y, zoom)
        pixel_coords.append((px, py))
    pixel_coords = np.array(pixel_coords, dtype=np.float32)

    # Video Settings
    W, H = 720, 1280
    FPS = 30
    TOTAL_FRAMES = 720 # 24 seconds
    out_file = 'public/itineraires/valescure_reel_runvaucluse.mp4'

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(out_file, fourcc, FPS, (W, H))

    # Font setup
    font_bold_path = "C:\\Windows\\Fonts\\impact.ttf"
    font_title_path = "C:\\Windows\\Fonts\\arialbd.ttf"
    font_sub_path = "C:\\Windows\\Fonts\\arial.ttf"

    font_brand = ImageFont.truetype(font_bold_path, 22)
    font_title = ImageFont.truetype(font_bold_path, 34)
    font_sub = ImageFont.truetype(font_title_path, 16)
    font_hook = ImageFont.truetype(font_bold_path, 20)
    font_metric_val = ImageFont.truetype(font_bold_path, 36)
    font_metric_lbl = ImageFont.truetype(font_title_path, 13)
    font_pin = ImageFont.truetype(font_bold_path, 14)

    # Precalculate elevation min & max for chart
    all_eles = [p['ele'] for p in points]
    min_ele = min(all_eles)
    max_ele = max(all_eles)
    total_dist_official = 43.0

    # Smooth camera center points
    all_cam_centers = []
    for f in range(TOTAL_FRAMES):
        if f < 60:
            # Intro: interpolate from center of whole map to start point
            t_ratio = f / 60.0
            # Easing
            t_smooth = t_ratio * t_ratio * (3 - 2 * t_ratio)
            start_px, start_py = pixel_coords[0]
            center_map_x, center_map_y = mos_w / 2.0, mos_h / 2.0
            cx = center_map_x * (1 - t_smooth) + start_px * t_smooth
            cy = center_map_y * (1 - t_smooth) + start_py * t_smooth
            crop_w = int(W * (2.4 * (1 - t_smooth) + 1.2 * t_smooth))
        elif f < 640:
            # Active tracking
            progress = (f - 60) / 580.0
            pt_idx = int(progress * (total_pts - 1))
            cx, cy = pixel_coords[pt_idx]
            crop_w = int(W * 1.15)
        else:
            # Outro: zoom out to whole map
            t_ratio = (f - 640) / 80.0
            t_smooth = t_ratio * t_ratio * (3 - 2 * t_ratio)
            last_px, last_py = pixel_coords[-1]
            center_map_x, center_map_y = mos_w / 2.0, mos_h / 2.0
            cx = last_px * (1 - t_smooth) + center_map_x * t_smooth
            cy = last_py * (1 - t_smooth) + center_map_y * t_smooth
            crop_w = int(W * (1.15 * (1 - t_smooth) + 2.5 * t_smooth))
            
        all_cam_centers.append((cx, cy, crop_w))

    # Apply 25-frame moving average smoothing to camera centers
    smoothed_cam = []
    window = 25
    for i in range(TOTAL_FRAMES):
        start_idx = max(0, i - window)
        end_idx = min(TOTAL_FRAMES, i + window + 1)
        cxs = [all_cam_centers[k][0] for k in range(start_idx, end_idx)]
        cys = [all_cam_centers[k][1] for k in range(start_idx, end_idx)]
        cws = [all_cam_centers[k][2] for k in range(start_idx, end_idx)]
        smoothed_cam.append((float(np.mean(cxs)), float(np.mean(cys)), float(np.mean(cws))))

    print(f"[*] Rendu des {TOTAL_FRAMES} images en cours...")

    for f in range(TOTAL_FRAMES):
        if f % 120 == 0:
            print(f"  Frame {f}/{TOTAL_FRAMES} ({(f/TOTAL_FRAMES*100):.1f}%)...")

        # 1. Camera crop & scale
        cx, cy, crop_w = smoothed_cam[f]
        crop_w = int(crop_w)
        crop_h = int(crop_w * (H / W))
        
        x0 = int(cx - crop_w / 2.0)
        y0 = int(cy - crop_h / 2.0)
        
        # Clamp bounds
        pad_x1 = max(0, -x0)
        pad_y1 = max(0, -y0)
        pad_x2 = max(0, (x0 + crop_w) - mos_w)
        pad_y2 = max(0, (y0 + crop_h) - mos_h)
        
        src_x1 = int(max(0, x0))
        src_y1 = int(max(0, y0))
        src_x2 = int(min(mos_w, x0 + crop_w))
        src_y2 = int(min(mos_h, y0 + crop_h))
        
        crop_img = mosaic[src_y1:src_y2, src_x1:src_x2].copy()
        if pad_x1 > 0 or pad_y1 > 0 or pad_x2 > 0 or pad_y2 > 0:
            crop_img = cv2.copyMakeBorder(crop_img, int(pad_y1), int(pad_y2), int(pad_x1), int(pad_x2), cv2.BORDER_CONSTANT, value=[15, 20, 25])
            
        # Draw path on the cropped view
        # Current progress index
        official_dplus = 1905.0
        dplus_factor = official_dplus / max(1.0, points[-1]['ele_gain_m'])

        if f < 60:
            active_idx = 0
            cur_dist = 0.0
            cur_ele_gain = 0.0
            cur_ele = points[0]['ele']
        elif f < 640:
            progress = (f - 60) / 580.0
            active_idx = int(progress * (total_pts - 1))
            cur_dist = points[active_idx]['dist_km']
            cur_ele_gain = points[active_idx]['ele_gain_m'] * dplus_factor
            cur_ele = points[active_idx]['ele']
        else:
            active_idx = total_pts - 1
            cur_dist = points[-1]['dist_km']
            cur_ele_gain = official_dplus
            cur_ele = points[-1]['ele']

        # Transformation from mosaic to crop
        scale_x = W / float(crop_w)
        scale_y = H / float(crop_h)

        # Draw full course ghost line (subtle grey/red)
        pts_view = []
        for px, py in pixel_coords:
            vx = int((px - x0) * scale_x)
            vy = int((py - y0) * scale_y)
            pts_view.append([vx, vy])
        pts_view = np.array(pts_view, dtype=np.int32)
        
        # Resize crop_img to (W, H)
        frame_bgr = cv2.resize(crop_img, (W, H), interpolation=cv2.INTER_LINEAR)
        
        # Subtle ghost path
        cv2.polylines(frame_bgr, [pts_view], isClosed=False, color=(50, 50, 120), thickness=3, lineType=cv2.LINE_AA)

        # Active glowing red path up to active_idx
        if active_idx > 1:
            active_pts = pts_view[:active_idx+1]
            # Outer neon glow (red/orange)
            cv2.polylines(frame_bgr, [active_pts], isClosed=False, color=(20, 40, 240), thickness=8, lineType=cv2.LINE_AA)
            # Inner bright yellow/white core
            cv2.polylines(frame_bgr, [active_pts], isClosed=False, color=(80, 220, 255), thickness=3, lineType=cv2.LINE_AA)
            
            # Current runner position head
            hx, hy = active_pts[-1]
            # Pulsing halo
            pulse = int(12 + 4 * math.sin(f * 0.3))
            cv2.circle(frame_bgr, (hx, hy), pulse, (0, 100, 255), -1, lineType=cv2.LINE_AA)
            cv2.circle(frame_bgr, (hx, hy), 6, (255, 255, 255), -1, lineType=cv2.LINE_AA)
            cv2.circle(frame_bgr, (hx, hy), pulse, (255, 255, 255), 2, lineType=cv2.LINE_AA)
            
            # Kilometer pin above runner (e.g. KM 10, KM 20...)
            if 60 <= f <= 640 and int(cur_dist) > 0:
                pin_text = f"KM {int(cur_dist)}"
                pin_w, pin_h = 58, 24
                px1 = hx - pin_w // 2
                py1 = hy - 40
                if 10 < px1 < W - 70 and 50 < py1 < H - 200:
                    cv2.rectangle(frame_bgr, (px1, py1), (px1 + pin_w, py1 + pin_h), (20, 20, 30), -1)
                    cv2.rectangle(frame_bgr, (px1, py1), (px1 + pin_w, py1 + pin_h), (50, 100, 255), 2)
                    cv2.putText(frame_bgr, pin_text, (px1 + 8, py1 + 17), cv2.FONT_HERSHEY_DUPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
                    cv2.line(frame_bgr, (hx, py1 + pin_h), (hx, hy - pulse), (255, 255, 255), 2, cv2.LINE_AA)

        # Convert to PIL for ultra-sharp typography & HUD overlays
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(frame_rgb)
        draw = ImageDraw.Draw(pil_img, "RGBA")

        # Top Vignette Gradient
        top_grad = Image.new('RGBA', (W, 260), (0, 0, 0, 0))
        top_draw = ImageDraw.Draw(top_grad)
        for y in range(260):
            alpha = int(220 * (1 - y / 260.0)**1.2)
            top_draw.line([(0, y), (W, y)], fill=(10, 12, 16, alpha))
        pil_img.paste(top_grad, (0, 0), top_grad)

        # Bottom Vignette Gradient
        bot_grad = Image.new('RGBA', (W, 360), (0, 0, 0, 0))
        bot_draw = ImageDraw.Draw(bot_grad)
        for y in range(360):
            alpha = int(240 * (y / 360.0)**1.3)
            bot_draw.line([(0, y), (W, y)], fill=(10, 12, 16, alpha))
        pil_img.paste(bot_grad, (0, H - 360), bot_grad)

        # --- TOP HEADER ---
        # RunVaucluse Brand Pill
        draw.rounded_rectangle([(30, 40), (220, 76)], radius=8, fill=(15, 18, 22, 230), outline=(235, 94, 40, 220), width=2)
        draw.text((45, 46), "RUNVAUCLUSE.FR", font=font_brand, fill=(246, 200, 59, 255))
        
        # Subtitle
        draw.text((30, 88), "TRAIL DES MONTS DE VAUCLUSE • 7E ÉDITION", font=font_sub, fill=(246, 200, 59, 240))
        # Main Title
        draw.text((30, 110), "LES CRÊTES DE VALESCURE", font=font_title, fill=(255, 255, 255, 255))
        
        # Hook badge
        draw.rounded_rectangle([(30, 160), (380, 196)], radius=6, fill=(225, 30, 45, 240))
        draw.text((42, 166), "TOUT LE PARCOURS EN 24 SECONDES", font=font_hook, fill=(255, 255, 255, 255))
        
        draw.text((30, 206), "SAUMANE-DE-VAUCLUSE • 1ER NOVEMBRE 2026", font=font_sub, fill=(210, 215, 225, 220))

        # --- BOTTOM HUD (TELEMETRY & PROFILE) ---
        # Distance & D+ Metrics
        dist_str = f"{cur_dist:.1f}".replace('.', ',')
        draw.text((40, H - 290), f"{dist_str} KM", font=font_metric_val, fill=(255, 255, 255, 255))
        draw.text((40, H - 250), f"KILOMÈTRE {int(cur_dist)}", font=font_metric_lbl, fill=(180, 185, 195, 240))

        ele_str = f"+{int(cur_ele_gain)} M"
        ele_bbox = draw.textbbox((0, 0), ele_str, font=font_metric_val)
        ele_w = ele_bbox[2] - ele_bbox[0]
        draw.text((W - 40 - ele_w, H - 290), ele_str, font=font_metric_val, fill=(246, 200, 59, 255))
        lbl_d = "DÉNIVELÉ D+"
        lbl_bbox = draw.textbbox((0, 0), lbl_d, font=font_metric_lbl)
        lbl_w = lbl_bbox[2] - lbl_bbox[0]
        draw.text((W - 40 - lbl_w, H - 250), lbl_d, font=font_metric_lbl, fill=(180, 185, 195, 240))

        # Center Elevation Profile Box
        chart_x1 = 40
        chart_x2 = W - 40
        chart_y1 = H - 225
        chart_y2 = H - 95
        chart_w = chart_x2 - chart_x1
        chart_h = chart_y2 - chart_y1

        # Box background
        draw.rounded_rectangle([(chart_x1, chart_y1), (chart_x2, chart_y2)], radius=10, fill=(15, 18, 24, 220), outline=(225, 40, 50, 180), width=2)
        
        # Grid line & text
        draw.text((chart_x1 + 12, chart_y1 + 8), f"ALTITUDE ACTUELLE : {int(cur_ele)} M", font=font_sub, fill=(246, 200, 59, 230))
        draw.text((chart_x2 - 110, chart_y1 + 8), f"MAX : {int(max_ele)} M", font=font_sub, fill=(200, 205, 215, 200))

        # Plot profile curve
        curve_pts = []
        n_samples = 200
        step = max(1, total_pts // n_samples)
        sample_indices = list(range(0, total_pts, step))
        if sample_indices[-1] != total_pts - 1:
            sample_indices.append(total_pts - 1)

        for s_idx in sample_indices:
            p_dist = points[s_idx]['dist_km']
            p_ele = points[s_idx]['ele']
            cx_plot = chart_x1 + 15 + (p_dist / total_dist_official) * (chart_w - 30)
            cy_plot = chart_y2 - 15 - ((p_ele - min_ele) / (max_ele - min_ele + 1e-5)) * (chart_h - 45)
            curve_pts.append((cx_plot, cy_plot))

        # Draw profile background line
        draw.line(curve_pts, fill=(80, 90, 110, 200), width=2)

        # Active progress on profile
        active_plot_idx = int((active_idx / (total_pts - 1)) * (len(curve_pts) - 1))
        if active_plot_idx > 0:
            draw.line(curve_pts[:active_plot_idx+1], fill=(240, 60, 60, 255), width=3)
            # Dot on curve
            dot_x, dot_y = curve_pts[active_plot_idx]
            draw.ellipse([(dot_x - 5, dot_y - 5), (dot_x + 5, dot_y + 5)], fill=(255, 255, 255, 255), outline=(235, 40, 50, 255), width=2)

        # Distance ticks under curve
        draw.text((chart_x1 + 15, chart_y2 - 20), "0 KM", font=font_metric_lbl, fill=(150, 155, 165, 200))
        draw.text((chart_x1 + chart_w // 2 - 15, chart_y2 - 20), "22 KM", font=font_metric_lbl, fill=(150, 155, 165, 200))
        draw.text((chart_x2 - 50, chart_y2 - 20), "43 KM", font=font_metric_lbl, fill=(150, 155, 165, 200))

        # --- OUTRO OVERLAY CARD (Frames 650 to 720) ---
        if f >= 650:
            fade = min(1.0, (f - 650) / 30.0)
            card_alpha = int(245 * fade)
            overlay_card = Image.new('RGBA', (W - 80, 420), (12, 14, 18, card_alpha))
            c_draw = ImageDraw.Draw(overlay_card)
            c_draw.rounded_rectangle([(0, 0), (W - 80, 420)], radius=16, outline=(235, 94, 40, int(255 * fade)), width=3)
            
            # Text inside card
            c_draw.text((30, 30), "DÉFIEZ LES MONTS DE VAUCLUSE", font=font_title, fill=(255, 255, 255, int(255 * fade)))
            c_draw.text((30, 80), "43 KM • 1 905M D+ • 7E ÉDITION", font=font_brand, fill=(246, 200, 59, int(255 * fade)))
            c_draw.text((30, 125), "QUALIFICATIF CHAMPIONNATS DE FRANCE", font=font_sub, fill=(230, 235, 245, int(240 * fade)))
            
            c_draw.rounded_rectangle([(30, 175), (W - 110, 235)], radius=8, fill=(225, 30, 45, int(240 * fade)))
            c_draw.text((50, 192), "INSCRIPTIONS SUR NIKROME.COM", font=font_hook, fill=(255, 255, 255, int(255 * fade)))
            
            c_draw.text((30, 260), "TRACÉS GPX & INFOS OFFICIELLES SUR :", font=font_sub, fill=(180, 185, 195, int(240 * fade)))
            c_draw.text((30, 290), "WWW.RUNVAUCLUSE.FR", font=font_title, fill=(246, 200, 59, int(255 * fade)))
            c_draw.text((30, 345), "Enregistre ce Reel pour ton entraînement !", font=font_sub, fill=(255, 255, 255, int(230 * fade)))
            
            pil_img.paste(overlay_card, (40, 280), overlay_card)

        # Write final frame to MP4
        final_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        writer.write(final_bgr)

    writer.release()
    print(f"\n[SUCCESS] Video Reel MP4 generee avec succes : {out_file}")
    print(f"Poids du fichier : {(os.path.getsize(out_file) / (1024*1024)):.2f} MB")

    # Copy to Desktop and Downloads
    import shutil
    home = os.path.expanduser('~')
    desktop = os.path.join(home, 'Desktop', 'valescure_reel_runvaucluse.mp4')
    downloads = os.path.join(home, 'Downloads', 'valescure_reel_runvaucluse.mp4')
    shutil.copyfile(out_file, desktop)
    shutil.copyfile(out_file, downloads)
    print(f"[+] Copie directement sur votre Bureau : {desktop}")
    print(f"[+] Copie directement dans vos Telechargements : {downloads}")

if __name__ == '__main__':
    render_reel()
