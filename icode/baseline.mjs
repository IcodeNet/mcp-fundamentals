import { readdir,writeFile,access,mkdir } from 'node:fs/promises';
import { join,resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const root=resolve(process.argv[2]);
const output=resolve(process.argv[3]||'acceptance-results/baseline.json');
const npm=process.env.npm_execpath || process.argv[4];
const results=[];
for(const ex of (await readdir(join(root,'exercises'))).sort()) {
 if(!/^\d+\./.test(ex))continue;
 for(const step of (await readdir(join(root,'exercises',ex))).sort()) {
  if(!/^\d+\.(problem|solution)\./.test(step))continue;
  const cwd=join(root,'exercises',ex,step);let seed=null;
  try {await access(join(cwd,'src/db/seed.ts'));seed=spawnSync(process.execPath,[join(root,'node_modules/tsx/dist/cli.mjs'),'src/db/seed.ts'],{cwd,encoding:'utf8',timeout:30000});}catch{}
  const run=spawnSync(process.execPath,[npm,'run','test','--','--run'],{cwd,encoding:'utf8',timeout:60000,env:{...process.env,CI:'1'}});
  const text=((run.stdout||'')+(run.stderr||'')).replace(/\x1b\[[0-9;]*m/g,'');
  results.push({path:`exercises/${ex}/${step}`,seedExit:seed?.status??null,exitCode:run.status,error:run.error?.message,summary:text.split('\n').filter(l=>/Test Files|Tests |Error:|FAIL|PASS/.test(l)).slice(-15)});
  console.log(`${results.length}/26 ${ex}/${step}: ${run.status}`);
 }
}
await mkdir(resolve(output,'..'),{recursive:true});await writeFile(output,JSON.stringify(results,null,2));
if(results.length!==26||results.some(r=>r.path.includes('.solution.')&&r.exitCode!==0))process.exitCode=1;
