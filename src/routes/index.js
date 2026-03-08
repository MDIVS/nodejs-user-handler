import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename);
console.log(__dirname);

const files = await fs.readdir(__dirname);

const routeFiles = files.filter(
    (file) => {
        return file.endsWith('.js')
            && file !== 'index.js'
            && !file.startsWith('_')
            && !file.endsWith('.test.js')
            && !file.endsWith('.spec.js')
    }
);

const routes = await Promise.all(
    routeFiles.map(async (file) => {
        const module = await import(pathToFileURL(path.join(__dirname, file)));
        return module.default || [];
    })
);

export default routes.flat();