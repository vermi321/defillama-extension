import fs from 'fs'
import cp from 'child_process'

// firefox does not support es6 modules, so we build an es5 version of content script for firefox

// cp.execSync('npx tsc --noEmit && npx vite build --config vite.firefox.config.ts')
// cp.execSync('cp dist/assets/index.*.js indexDist.js ')
// cp.execSync('npx tsc --noEmit && npx vite build --config vite.config.ts')
// cp.execSync('mv indexDist.js dist/src/pages/content/index.js')


// firefox does not support "service_worker" in manifest.json, so we need to replace it with "background.scripts"

const manifest = JSON.parse(fs.readFileSync('./dist/manifest.json'))

manifest.background.scripts = [manifest.background.service_worker]
manifest.browser_specific_settings = {
  gecko: {
    id: 'addon1@llama.fi',
    strict_min_version: '111.0'
  },
  gecko_android: {
    id: 'addon1@llama.fi',
    strict_min_version: '111.0'
  },
}
delete manifest.background.service_worker

fs.writeFileSync('./dist/manifest.json', JSON.stringify(manifest, null, 2))
cp.execSync('rm -rf web-ext-artifacts')
cp.execSync('npx web-ext build --source-dir dist --overwrite-dest')