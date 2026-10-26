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

# --- Official RunVaucluse Brand Identity & DA ---
COLOR_DARK_INK = (17, 20, 23)        # #111417 (Dark Ink)
COLOR_GOLD = (246, 200, 59)          # #F6C83B (Vaucluse Gold / Ochre)
COLOR_CREAM = (250, 247, 242)        # #FAF7F2 (RunVaucluse Off-White)
COLOR_ORANGE = (235, 94, 40)         # #EB5E28 (Ventoux Orange)
COLOR_MUTED = (140, 150, 160)        # #8C96A0 (Muted Steel)

def draw_logo_icon_pil(size=36, color=COLOR_GOLD):
    """Renders the official RunVaucluse vector emblem with anti-aliasing."""
    scale = 4
    S = size * scale
    canvas = np.zeros((S, S, 4), dtype=np.uint8)
    s = S / 48.0
    c_bgr = (color[2], color[1], color[0], 255)
    
    # Outer circle
    cv2.circle(canvas, (int(24 * s), int(24 * s)), int(21 * s), c_bgr, int(3 * s), lineType=cv2.LINE_AA)
    # Head
    cv2.circle(canvas, (int(28 * s), int(13 * s)), int(3.2 * s), c_bgr, -1, lineType=cv2.LINE_AA)
    
    # R Loop
    pts_r = []
    for t in np.linspace(0, 1, 30):
        x = (1-t)**3 * 18 + 3*(1-t)**2*t * 24 + 3*(1-t)*t**2 * 31 + t**3 * 22
        y = (1-t)**3 * 19 + 3*(1-t)**2*t * 14 + 3*(1-t)*t**2 * 18 + t**3 * 26
        pts_r.append([int(x * s), int(y * s)])
    cv2.polylines(canvas, [np.array(pts_r, dtype=np.int32)], False, c_bgr, int(3.5 * s), lineType=cv2.LINE_AA)
    
    # V Stride
    v_pts = np.array([[int(15 * s), int(34 * s)], [int(22 * s), int(26 * s)], [int(31 * s), int(34 * s)]], dtype=np.int32)
    cv2.polylines(canvas, [v_pts], False, c_bgr, int(3.5 * s), lineType=cv2.LINE_AA)
    
    canvas_small = cv2.resize(canvas, (size, size), interpolation=cv2.INTER_AREA)
    return Image.fromarray(cv2.cvtColor(canvas_small, cv2.COLOR_BGRA2RGBA))

# --- GPX Utilities ---
def deg2num(lat_deg, lon_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return xtile, ytile

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

def get_mosaic(min_lat, max_lat, min_lon, max_lon, zoom=15):
    cache_dir = os.path.join("data", "tiles_cache")
    x1, y1 = deg2num(max_lat, min_lon, zoom)
    x2, y2 = deg2num(min_lat, max_lon, zoom)
    min_x, max_x = min(x1, x2), max(x1, x2)
    min_y, max_y = min(y1, y2), max(y1, y2)
    
    width = (max_x - min_x + 1) * 256
    height = (max_y - min_y + 1) * 256
    mosaic = np.zeros((height, width, 3), dtype=np.uint8)
    
    for x in range(min_x, max_x + 1):
        for y in range(min_y, max_y + 1):
            tile_path = os.path.join(cache_dir, f"tile_{zoom}_{x}_{y}.jpg")
            if os.path.exists(tile_path):
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

# --- Main Video Renderer with RunVaucluse Brand DA ---
def render_reel():
    print("[*] Initialisation de la generation du Reel aux couleurs de RUNVAUCLUSE.FR...")
    gpx_path = 'public/itineraires/tmv-valescure-43km.gpx'
    points = parse_gpx(gpx_path)
    total_pts = len(points)
    print(f"[+] {total_pts} points GPS charges. Distance: {points[-1]['dist_km']:.2f} km")

    lats = [p['lat'] for p in points]
    lons = [p['lon'] for p in points]
    min_lat, max_lat = min(lats) - 0.012, max(lats) + 0.012
    min_lon, max_lon = min(lons) - 0.012, max(lons) + 0.012

    zoom = 15
    mosaic, min_x, min_y, zoom = get_mosaic(min_lat, max_lat, min_lon, max_lon, zoom=zoom)
    mos_h, mos_w = mosaic.shape[:2]
    print(f"[+] Mosaique satellite: {mos_w} x {mos_h} px")

    # Mosaic Coordinates
    pixel_coords = []
    for p in points:
        px, py = latlon_to_pixel(p['lat'], p['lon'], min_x, min_y, zoom)
        pixel_coords.append((px, py))
    pixel_coords = np.array(pixel_coords, dtype=np.float32)

    # Video Settings
    W, H = 720, 1280
    FPS = 30
    TOTAL_FRAMES = 720 # 24.0 seconds
    out_file = 'public/itineraires/valescure_reel_runvaucluse.mp4'

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(out_file, fourcc, FPS, (W, H))

    # Official Typography (Bebas Neue, Plus Jakarta Sans, Space Mono)
    font_display_huge = ImageFont.truetype("public/fonts/BebasNeue-Regular.ttf", 54)
    font_display_large = ImageFont.truetype("public/fonts/BebasNeue-Regular.ttf", 40)
    font_display_brand = ImageFont.truetype("public/fonts/BebasNeue-Regular.ttf", 34)
    font_display_stat = ImageFont.truetype("public/fonts/BebasNeue-Regular.ttf", 50)

    font_sans_bold = ImageFont.truetype("public/fonts/PlusJakartaSans.ttf", 15)
    font_sans_sub = ImageFont.truetype("public/fonts/PlusJakartaSans.ttf", 13)
    
    font_mono_stat = ImageFont.truetype("public/fonts/SpaceMono-Bold.ttf", 12)
    font_mono_pill = ImageFont.truetype("public/fonts/SpaceMono-Bold.ttf", 11)
    font_mono_val = ImageFont.truetype("public/fonts/SpaceMono-Bold.ttf", 13)

    # Official Logo Icon in Vaucluse Gold
    logo_icon = draw_logo_icon_pil(34, COLOR_GOLD)

    # Stats calibration
    official_dplus = 1905.0
    dplus_factor = official_dplus / max(1.0, points[-1]['ele_gain_m'])
    total_dist_official = 43.0
    all_eles = [p['ele'] for p in points]
    min_ele = min(all_eles)
    max_ele = max(all_eles)

    # Camera trajectory precalculation
    all_cam_centers = []
    for f in range(TOTAL_FRAMES):
        if f < 60:
            t_smooth = (f / 60.0)**2 * (3 - 2 * (f / 60.0))
            cx = (mos_w / 2.0) * (1 - t_smooth) + pixel_coords[0][0] * t_smooth
            cy = (mos_h / 2.0) * (1 - t_smooth) + pixel_coords[0][1] * t_smooth
            crop_w = int(W * (2.4 * (1 - t_smooth) + 1.15 * t_smooth))
        elif f < 640:
            progress = (f - 60) / 580.0
            pt_idx = int(progress * (total_pts - 1))
            cx, cy = pixel_coords[pt_idx]
            crop_w = int(W * 1.15)
        else:
            t_smooth = ((f - 640) / 80.0)**2 * (3 - 2 * ((f - 640) / 80.0))
            cx = pixel_coords[-1][0] * (1 - t_smooth) + (mos_w / 2.0) * t_smooth
            cy = pixel_coords[-1][1] * (1 - t_smooth) + (mos_h / 2.0) * t_smooth
            crop_w = int(W * (1.15 * (1 - t_smooth) + 2.5 * t_smooth))
        all_cam_centers.append((cx, cy, crop_w))

    smoothed_cam = []
    window = 25
    for i in range(TOTAL_FRAMES):
        start_idx = max(0, i - window)
        end_idx = min(TOTAL_FRAMES, i + window + 1)
        cxs = [all_cam_centers[k][0] for k in range(start_idx, end_idx)]
        cys = [all_cam_centers[k][1] for k in range(start_idx, end_idx)]
        cws = [all_cam_centers[k][2] for k in range(start_idx, end_idx)]
        smoothed_cam.append((float(np.mean(cxs)), float(np.mean(cys)), float(np.mean(cws))))

    # Precalculate elevation curve samples
    curve_pts_base = []
    n_samples = 220
    step = max(1, total_pts // n_samples)
    sample_indices = list(range(0, total_pts, step))
    if sample_indices[-1] != total_pts - 1:
        sample_indices.append(total_pts - 1)

    cx1 = 32
    cx2 = W - 32
    cy1 = H - 228
    cy2 = H - 90
    cw = cx2 - cx1
    ch = cy2 - cy1

    for s_idx in sample_indices:
        p_dist = points[s_idx]['dist_km']
        p_ele = points[s_idx]['ele']
        cx_plot = cx1 + 18 + (p_dist / total_dist_official) * (cw - 36)
        cy_plot = cy2 - 16 - ((p_ele - min_ele) / (max_ele - min_ele + 1e-5)) * (ch - 48)
        curve_pts_base.append((cx_plot, cy_plot))

    print(f"[*] Rendu des {TOTAL_FRAMES} images en cours...")

    for f in range(TOTAL_FRAMES):
        if f % 120 == 0:
            print(f"  Frame {f}/{TOTAL_FRAMES} ({(f/TOTAL_FRAMES*100):.1f}%)...")

        cx, cy, crop_w = smoothed_cam[f]
        crop_w = int(crop_w)
        crop_h = int(crop_w * (H / W))
        
        x0 = int(cx - crop_w / 2.0)
        y0 = int(cy - crop_h / 2.0)

        pad_x1 = int(max(0, -x0))
        pad_y1 = int(max(0, -y0))
        pad_x2 = int(max(0, (x0 + crop_w) - mos_w))
        pad_y2 = int(max(0, (y0 + crop_h) - mos_h))

        src_x1 = int(max(0, x0))
        src_y1 = int(max(0, y0))
        src_x2 = int(min(mos_w, x0 + crop_w))
        src_y2 = int(min(mos_h, y0 + crop_h))

        crop_img = mosaic[src_y1:src_y2, src_x1:src_x2].copy()
        if pad_x1 > 0 or pad_y1 > 0 or pad_x2 > 0 or pad_y2 > 0:
            crop_img = cv2.copyMakeBorder(crop_img, pad_y1, pad_y2, pad_x1, pad_x2, cv2.BORDER_CONSTANT, value=[17, 20, 23])

        scale_x = W / float(crop_w)
        scale_y = H / float(crop_h)

        pts_view = []
        for px, py in pixel_coords:
            pts_view.append([int((px - x0) * scale_x), int((py - y0) * scale_y)])
        pts_view = np.array(pts_view, dtype=np.int32)

        frame_bgr = cv2.resize(crop_img, (W, H), interpolation=cv2.INTER_LINEAR)

        # Ghost path: Dark Charcoal with subtle boundary
        cv2.polylines(frame_bgr, [pts_view], False, (10, 12, 16), 5, lineType=cv2.LINE_AA)
        cv2.polylines(frame_bgr, [pts_view], False, (70, 80, 95), 2, lineType=cv2.LINE_AA)

        # Active progress index & telemetry
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

        hx, hy = pts_view[active_idx]

        # Active path glow: Ventoux Orange + Vaucluse Gold + White Core
        if active_idx > 1:
            active_pts = pts_view[:active_idx+1]
            cv2.polylines(frame_bgr, [active_pts], False, (30, 80, 230), 8, lineType=cv2.LINE_AA)
            cv2.polylines(frame_bgr, [active_pts], False, (59, 200, 246), 4, lineType=cv2.LINE_AA)
            cv2.polylines(frame_bgr, [active_pts], False, (255, 255, 255), 1, lineType=cv2.LINE_AA)

            # Runner Marker (Target reticle & pulse)
            pulse = int(14 + 5 * math.sin(f * 0.35))
            cv2.circle(frame_bgr, (hx, hy), pulse, (59, 200, 246), 2, lineType=cv2.LINE_AA)
            cv2.circle(frame_bgr, (hx, hy), 9, (17, 20, 23), -1, lineType=cv2.LINE_AA)
            cv2.circle(frame_bgr, (hx, hy), 7, (59, 200, 246), -1, lineType=cv2.LINE_AA)
            cv2.circle(frame_bgr, (hx, hy), 3, (255, 255, 255), -1, lineType=cv2.LINE_AA)

            # Kilometer Pin line
            if 60 <= f <= 640 and int(cur_dist) > 0:
                pin_w, pin_h = 62, 26
                px1 = hx - pin_w // 2
                py1 = hy - 44
                if 10 < px1 < W - 75 and 50 < py1 < H - 200:
                    cv2.rectangle(frame_bgr, (px1, py1), (px1 + pin_w, py1 + pin_h), (17, 20, 23), -1)
                    cv2.rectangle(frame_bgr, (px1, py1), (px1 + pin_w, py1 + pin_h), (59, 200, 246), 2)
                    cv2.line(frame_bgr, (hx, py1 + pin_h), (hx, hy - pulse), (59, 200, 246), 2, cv2.LINE_AA)

        # Convert to PIL for razor-sharp typography
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(frame_rgb)
        draw = ImageDraw.Draw(pil_img, "RGBA")

        # Vignette gradients (RunVaucluse Dark Ink #111417)
        top_grad = Image.new('RGBA', (W, 280), (0, 0, 0, 0))
        top_draw = ImageDraw.Draw(top_grad)
        for y in range(280):
            alpha = int(245 * (1 - y / 280.0)**1.25)
            top_draw.line([(0, y), (W, y)], fill=(17, 20, 23, alpha))
        pil_img.paste(top_grad, (0, 0), top_grad)

        bot_grad = Image.new('RGBA', (W, 360), (0, 0, 0, 0))
        bot_draw = ImageDraw.Draw(bot_grad)
        for y in range(360):
            alpha = int(250 * (y / 360.0)**1.3)
            bot_draw.line([(0, y), (W, y)], fill=(17, 20, 23, alpha))
        pil_img.paste(bot_grad, (0, H - 360), bot_grad)

        # --- TOP BRAND HEADER (RunVaucluse Studio Standard) ---
        header_y = 44
        pil_img.paste(logo_icon, (32, header_y - 2), logo_icon)
        draw.text((74, header_y), "RUNVAUCLUSE", font=font_display_brand, fill=COLOR_CREAM)

        # Official Pill: OFFICIEL 84
        draw.rounded_rectangle([(W - 130, header_y + 2), (W - 32, header_y + 28)], radius=13, fill=COLOR_GOLD)
        draw.text((W - 120, header_y + 7), "OFFICIEL 84", font=font_mono_pill, fill=COLOR_DARK_INK)

        # Date & Location: Space Mono in Gold
        draw.text((34, header_y + 44), "01 NOVEMBRE 2026 • SAUMANE-DE-VAUCLUSE", font=font_mono_stat, fill=COLOR_GOLD)

        # Course Title in Bebas Neue
        draw.text((32, header_y + 64), "LES CRÊTES DE VALESCURE", font=font_display_huge, fill=COLOR_CREAM)

        # Hook Pill: Dark Ink with orange accent
        hook_box = [(32, header_y + 124), (430, header_y + 158)]
        draw.rounded_rectangle(hook_box, radius=8, fill=(17, 20, 23, 230), outline=(235, 94, 40, 200), width=1)
        draw.text((46, header_y + 132), "TRAIL 43 KM • LE PARCOURS EN 24 SECONDES", font=font_sans_bold, fill=COLOR_CREAM)

        # Kilometer Pin label inside PIL
        if 60 <= f <= 640 and int(cur_dist) > 0:
            pin_text = f"KM {int(cur_dist)}"
            px1 = hx - 31
            py1 = hy - 44
            if 10 < px1 < W - 75 and 50 < py1 < H - 200:
                draw.text((px1 + 12, py1 + 6), pin_text, font=font_mono_pill, fill=COLOR_CREAM)

        # --- BOTTOM HUD (TELEMETRY & PROFILE) ---
        # Distance Metric
        dist_str = f"{cur_dist:.1f}".replace('.', ',')
        draw.text((36, H - 306), f"{dist_str} KM", font=font_display_stat, fill=COLOR_CREAM)
        draw.text((38, H - 252), "DISTANCE PARCOURUE", font=font_mono_stat, fill=COLOR_MUTED)

        # D+ Metric
        ele_str = f"+{int(cur_ele_gain)} M"
        ele_bbox = draw.textbbox((0, 0), ele_str, font=font_display_stat)
        ele_w = ele_bbox[2] - ele_bbox[0]
        draw.text((W - 36 - ele_w, H - 306), ele_str, font=font_display_stat, fill=COLOR_GOLD)
        lbl_d = "DÉNIVELÉ D+"
        lbl_bbox = draw.textbbox((0, 0), lbl_d, font=font_mono_stat)
        lbl_w = lbl_bbox[2] - lbl_bbox[0]
        draw.text((W - 36 - lbl_w, H - 252), lbl_d, font=font_mono_stat, fill=COLOR_MUTED)

        # Elevation Profile Box
        draw.rounded_rectangle([(cx1, cy1), (cx2, cy2)], radius=12, fill=(17, 20, 23, 235), outline=(250, 247, 242, 45), width=1)
        draw.text((cx1 + 16, cy1 + 10), f"ALTITUDE : {int(cur_ele)} M", font=font_mono_val, fill=COLOR_GOLD)
        draw.text((cx2 - 110, cy1 + 10), "MAX : 673 M", font=font_mono_val, fill=COLOR_CREAM)

        # Profile Lines
        draw.line(curve_pts_base, fill=(55, 65, 80, 200), width=2)
        active_plot_idx = int((active_idx / (total_pts - 1)) * (len(curve_pts_base) - 1))
        if active_plot_idx > 0:
            draw.line(curve_pts_base[:active_plot_idx+1], fill=COLOR_GOLD, width=3)
            dot_x, dot_y = curve_pts_base[active_plot_idx]
            draw.ellipse([(dot_x - 5, dot_y - 5), (dot_x + 5, dot_y + 5)], fill=COLOR_CREAM, outline=COLOR_GOLD, width=2)

        # Axis ticks
        draw.text((cx1 + 18, cy2 - 18), "0 KM", font=font_mono_pill, fill=COLOR_MUTED)
        draw.text((cx1 + cw // 2 - 16, cy2 - 18), "22 KM", font=font_mono_pill, fill=COLOR_MUTED)
        draw.text((cx2 - 46, cy2 - 18), "43 KM", font=font_mono_pill, fill=COLOR_MUTED)

        # --- OUTRO BRAND CARD (Frames 650 to 720) ---
        if f >= 650:
            fade = min(1.0, (f - 650) / 30.0)
            card_w = W - 64
            card_h = 440
            overlay_card = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
            c_draw = ImageDraw.Draw(overlay_card)
            
            # Dark ink container with gold border
            c_draw.rounded_rectangle([(0, 0), (card_w, card_h)], radius=16, fill=(17, 20, 23, int(248 * fade)), outline=(246, 200, 59, int(255 * fade)), width=2)
            
            # Header inside card
            overlay_card.paste(logo_icon, (28, 26), logo_icon)
            c_draw.text((68, 28), "RUNVAUCLUSE", font=font_display_brand, fill=(250, 247, 242, int(255 * fade)))
            c_draw.rounded_rectangle([(card_w - 120, 30), (card_w - 28, 54)], radius=12, fill=(246, 200, 59, int(255 * fade)))
            c_draw.text((card_w - 110, 35), "OFFICIEL 84", font=font_mono_pill, fill=(17, 20, 23, int(255 * fade)))

            # Race titles
            c_draw.text((28, 76), "DÉFIEZ LES MONTS DE VAUCLUSE", font=font_display_large, fill=(250, 247, 242, int(255 * fade)))
            c_draw.text((28, 122), "43 KM • 1 905M D+ • 7E ÉDITION", font=font_mono_stat, fill=(246, 200, 59, int(255 * fade)))
            c_draw.text((28, 146), "SAUMANE-DE-VAUCLUSE • QUALIFICATIF FRANCE", font=font_sans_sub, fill=(200, 208, 218, int(240 * fade)))

            # Primary CTA button in Gold with centered text
            btn_y1 = 185
            btn_y2 = 245
            c_draw.rounded_rectangle([(28, btn_y1), (card_w - 28, btn_y2)], radius=12, fill=(246, 200, 59, int(255 * fade)))
            btn_txt = "INSCRIPTIONS SUR NIKROME.COM"
            btn_bbox = c_draw.textbbox((0, 0), btn_txt, font=font_sans_bold)
            btn_txt_w = btn_bbox[2] - btn_bbox[0]
            btn_txt_x = 28 + ((card_w - 56) - btn_txt_w) // 2
            c_draw.text((btn_txt_x, btn_y1 + 19), btn_txt, font=font_sans_bold, fill=(17, 20, 23, int(255 * fade)))

            # Web portal & advice
            c_draw.text((28, 275), "PARCOURS, TRACÉS GPX & INFOS OFFICIELLES :", font=font_mono_pill, fill=(140, 150, 160, int(240 * fade)))
            c_draw.text((28, 298), "WWW.RUNVAUCLUSE.FR", font=font_display_large, fill=(250, 247, 242, int(255 * fade)))
            c_draw.text((28, 345), "Le guide n°1 des courses & trails en Vaucluse", font=font_sans_sub, fill=(246, 200, 59, int(240 * fade)))
            c_draw.text((28, 385), "★ Enregistre ce Reel pour ta prépa !", font=font_sans_bold, fill=(250, 247, 242, int(230 * fade)))

            pil_img.paste(overlay_card, (32, 260), overlay_card)

        # Write frame
        final_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        writer.write(final_bgr)

    writer.release()
    print(f"\n[SUCCESS] Reel Fly 3D généré avec succès avec la DA RunVaucluse : {out_file}")
    print(f"Poids du fichier : {(os.path.getsize(out_file) / (1024*1024)):.2f} MB")

    # Copy to Desktop and Downloads
    import shutil
    home = os.path.expanduser('~')
    desktop = os.path.join(home, 'Desktop', 'valescure_reel_runvaucluse.mp4')
    downloads = os.path.join(home, 'Downloads', 'valescure_reel_runvaucluse.mp4')
    shutil.copyfile(out_file, desktop)
    shutil.copyfile(out_file, downloads)
    print(f"[+] Copié sur le Bureau : {desktop}")
    print(f"[+] Copié dans Téléchargements : {downloads}")

if __name__ == '__main__':
    render_reel()
