import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
process.env.WORKSHOP_CONTENT=root;
await import(pathToFileURL(resolve(process.env.ICODE_ENGINE_DIR||resolve(root,'.icode/engine'),'packages/cli/inspector.mjs')));
