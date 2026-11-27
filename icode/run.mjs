#!/usr/bin/env node
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const engine=resolve(root,process.env.ICODE_ENGINE_DIR||'.icode/engine');
const command=process.argv[2]||'start';
function run(cmd,args,cwd) {const r=spawnSync(cmd,args,{cwd,stdio:'inherit',shell:false});if(r.error)throw r.error;if(r.status!==0)throw new Error(`${cmd} exited ${r.status}`);}
if(command==='setup'&&!existsSync(join(engine,'package.json'))) {
 const ref=JSON.parse(readFileSync(join(root,'icode/engine.json'),'utf8')).commit;
 mkdirSync(dirname(engine),{recursive:true});
 run('git',['clone','--no-checkout','https://github.com/IcodeNet/Icode-workshop.git',engine],root);
 run('git',['checkout','--detach',ref],engine);
}
if(!existsSync(join(engine,'package.json')))throw new Error('Run npm run setup first, or set ICODE_ENGINE_DIR to an Icode checkout.');
if(command==='setup'&&!existsSync(join(engine,'node_modules'))) {
 if(process.platform==='win32')run('cmd.exe',['/d','/s','/c','corepack pnpm install --frozen-lockfile'],engine);
 else run('corepack',['pnpm','install','--frozen-lockfile'],engine);
}
if(command==='mcp'||command==='inspect') {
 const {selectWorkspace,workspacePath}=await import(pathToFileURL(join(engine,'packages/web/workspaces.mjs')));
 const id=process.argv[3]||'01';await selectWorkspace(root,id);process.chdir(workspacePath(root,id));
 process.env.WORKSHOP_CONTENT=root;
 if(command==='inspect')await import(pathToFileURL(join(engine,'packages/cli/inspector.mjs')));
 else {
  const {npmCLI,courseEnvironment}=await import(pathToFileURL(join(engine,'packages/web/setup.mjs')));
  const child=spawn(process.execPath,[npmCLI(),'--silent','run','dev:mcp'],{stdio:'inherit',env:{...process.env,...courseEnvironment(root)}});
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
  child.on('exit',code=>{process.exitCode=code??1;});
 }
} else {
 const child=spawn(process.execPath,[join(engine,'packages/cli/bin.mjs'),command,'--content',root],{stdio:'inherit'});
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
 child.on('exit',code=>{process.exitCode=code??1;});
}
