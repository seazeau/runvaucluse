const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const OUT_MP4 = 'public/itineraires/valescure_reel_runvaucluse.mp4';
const TOTAL_FRAMES = 900; // 30.0 seconds at 30 fps

async function generate3DReel() {
    console.log("=================================================");
    console.log("🚀 Lancement du Rendu Reel 3D Relief Tour de France");
    console.log("Course: Les Crêtes de Valescure (43 km)");
    console.log("Format: 720x1280 @ 30fps • 900 frames (30.0s)");
    console.log("=================================================");

    // 1. Spawn Python pipe encoder
    console.log("[*] Initialisation de l'encodeur vidéo OpenCV...");
    const py = spawn('python', ['scripts/pipe_to_mp4.py', OUT_MP4], {
        stdio: ['pipe', 'inherit', 'inherit']
    });

    // 2. Launch Chrome
    console.log("[*] Démarrage du moteur WebGL 3D (Chrome Angle D3D11)...");
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: [
            '--enable-webgl',
            '--ignore-gpu-blocklist',
            '--enable-gpu-rasterization',
            '--use-gl=angle',
            '--use-angle=d3d11',
            '--allow-file-access-from-files',
            '--disable-web-security',
            '--window-size=720,1280'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 720, height: 1280, deviceScaleFactor: 1 });

    const htmlPath = path.resolve('scripts/render_3d_relief_view.html').replace(/\\/g, '/');
    await page.goto('file:///' + htmlPath, { waitUntil: 'networkidle2' });

    console.log("[*] Chargement du relief 3D et des tuiles satellites...");
    await page.waitForFunction('window.__ready === true', { timeout: 25000 });
    
    // Give 4 seconds for all 3D DEM tiles and terrain shaders to compile and cache
    await new Promise(r => setTimeout(r, 4000));

    console.log(`[*] Début de la capture image par image (720 frames)...`);
    const tStart = Date.now();

    for (let f = 0; f < TOTAL_FRAMES; f++) {
        // Advance frame in MapLibre 3D engine
        await page.evaluate((frame, total) => window.setFrame(frame, total), f, TOTAL_FRAMES);
        
        // Capture frame as JPEG
        const jpgBuf = await page.screenshot({ type: 'jpeg', quality: 90 });

        // Pipe to Python stdin: 4-byte length prefix + JPEG bytes
        const lenBuf = Buffer.alloc(4);
        lenBuf.writeUInt32BE(jpgBuf.length, 0);
        py.stdin.write(lenBuf);
        py.stdin.write(jpgBuf);

        if (f % 90 === 0 || f === TOTAL_FRAMES - 1) {
            const elapsed = (Date.now() - tStart) / 1000;
            const pct = ((f + 1) / TOTAL_FRAMES * 100).toFixed(1);
            const fps = (f + 1) / elapsed;
            const remaining = (TOTAL_FRAMES - (f + 1)) / (fps || 1);
            console.log(`  Frame ${f + 1}/${TOTAL_FRAMES} (${pct}%) • ${fps.toFixed(1)} fps • Reste ~${remaining.toFixed(0)}s`);
        }
    }

    console.log("[*] Finalisation du fichier MP4...");
    py.stdin.end();

    await new Promise((resolve, reject) => {
        py.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(`Python encoder failed with code ${code}`));
        });
    });

    await browser.close();

    const stats = fs.statSync(OUT_MP4);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`\n🎉 SUCCÈS ! Vidéo MP4 générée : ${OUT_MP4} (${sizeMb} MB)`);

    // 3. Copy to Desktop and Downloads
    const home = os.homedir();
    const desktopPath = path.join(home, 'Desktop', 'valescure_reel_runvaucluse.mp4');
    const downloadsPath = path.join(home, 'Downloads', 'valescure_reel_runvaucluse.mp4');
    fs.copyFileSync(OUT_MP4, desktopPath);
    fs.copyFileSync(OUT_MP4, downloadsPath);
    console.log(`[+] Copié sur le Bureau : ${desktopPath}`);
    console.log(`[+] Copié dans Téléchargements : ${downloadsPath}`);

    // 4. Upload to direct mobile link (uguu.se)
    console.log("[*] Téléversement du fichier pour accès smartphone direct...");
    try {
        const { execSync } = require('child_process');
        const uploadOutput = execSync(`curl.exe -s -F "files[]=@${OUT_MP4}" https://uguu.se/upload.php`, { encoding: 'utf-8' });
        const res = JSON.parse(uploadOutput);
        if (res.success && res.files && res.files[0]) {
            console.log(`\n📲 LIEN SMARTPHONE DIRECT : ${res.files[0].url}`);
        }
    } catch (err) {
        console.error("Erreur lors de l'upload:", err.message);
    }
}

generate3DReel().catch(err => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
});
