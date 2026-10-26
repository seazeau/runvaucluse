const fs = require('fs');

// Function to generate customized ESP with custom duration, altitude, tilt and smoothing
const { execSync } = require('child_process');

function generateCinematicEsp(durationFrames, altM, tiltDeg, movingAvg, noiseDist, nSteps, outName) {
  // 1. Update esp_template.esp with the duration
  let template = fs.readFileSync('scripts/esp_template.esp', 'utf8');
  template = template.replace(/"duration":\s*\d+/g, `"duration": ${durationFrames}`);
  fs.writeFileSync('scripts/esp_template.esp', template, 'utf8');

  // 2. Run python script
  const cmd = `python scripts/kml_to_esp.py public/itineraires/tmv-valescure-43km.kml public/itineraires/${outName} --tilt ${tiltDeg} --alt ${altM} --n_steps ${nSteps} --moving_avg ${movingAvg} --noise_level ${noiseDist}`;
  console.log('Running:', cmd);
  execSync(cmd, { stdio: 'inherit' });

  // 3. Copy to Desktop and Downloads
  const os = require('os');
  const path = require('path');
  const desktop = path.join(os.homedir(), 'Desktop', outName);
  const downloads = path.join(os.homedir(), 'Downloads', outName);
  fs.copyFileSync(`public/itineraires/${outName}`, desktop);
  fs.copyFileSync(`public/itineraires/${outName}`, downloads);
  console.log(`Copied ${outName} to Desktop and Downloads!`);
}

// Generate:
// Version A: 45 secondes (1350 frames), altitude 2500m, lissage cinéma 15
generateCinematicEsp(1350, 2500, 55, 15, 80, 180, 'valescure_fly3d.esp');
// Also create a 60s slow version
generateCinematicEsp(1800, 2800, 50, 20, 100, 180, 'valescure_fly3d_tres_lent.esp');
