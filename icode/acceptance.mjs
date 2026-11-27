import assert from 'node:assert/strict';
import { readFile,writeFile,mkdir,readdir } from 'node:fs/promises';
import { resolve,join,relative } from 'node:path';
import { pathToFileURL,fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root=resolve(dirname(import.meta.url));
function dirname(url){return fileURLToPath(new URL('../',url));}
const engine=resolve(process.env.ICODE_ENGINE_DIR||join(root,'.icode/engine'));
const get=p=>import(pathToFileURL(join(engine,p)));
const {discoverSteps}=await get('packages/core/layout.mjs');
const {lessonDocuments}=await get('packages/web/lessons.mjs');
const {testLab}=await get('packages/web/runtime.mjs');
const {executionWorkspace}=await get('packages/web/variants.mjs');
const {selectWorkspace,replaceWorkspace}=await get('packages/web/workspaces.mjs');
const {writeProjectFile,readProjectFile}=await get('packages/web/files.mjs');
const {updateProgress,readProgress}=await get('packages/web/course.mjs');
const baseline=JSON.parse(await readFile(process.env.BASELINE_RESULTS||join(root,'acceptance-results/baseline.json'),'utf8'));
const steps=discoverSteps(root);assert.equal(steps.length,13);
const documents=new Set(),results=[];
const hash=s=>createHash('sha256').update(s).digest('hex');
async function sourceHashes(dir){const result={};for(const name of await readdir(dir,{recursive:true})){
 if(name.includes('node_modules')||!/\.(ts|mdx)$/.test(name))continue;
 const p=join(dir,name);result[name]=hash(await readFile(p));
}return result;}
const before=await sourceHashes(join(root,'exercises'));
for(const step of steps){
 for(const d of await lessonDocuments(root,step.id))documents.add(d.path);
 for(const variant of ['problem','solution']){
  const workspace=await executionWorkspace(root,step.id,variant);
  try {
   const result=await testLab(root,step.id,{workspaceRoot:workspace.path,timeoutMs:60000});
   const path=relative(root,step[variant]).replaceAll('\\','/');
   const expected=baseline.find(x=>x.path===path);assert.ok(expected,path);
   results.push({id:step.id,path,variant,status:result.status,exitCode:result.exitCode,baselineExitCode:expected.exitCode,output:result.output.slice(-4000)});
   console.log(`${step.id} ${variant}: ${result.status}; baseline ${expected.exitCode}`);
   assert.equal(result.status,expected.exitCode===0?'passed':'failed',path+' must match original baseline: '+result.output);
  }finally{await workspace.cleanup();}
 }
}
assert.equal(documents.size,38);
assert.deepEqual(await sourceHashes(join(root,'exercises')),before,'Author source must remain unchanged');
await selectWorkspace(root,'01');
const failing=await testLab(root,'01');assert.equal(failing.passed,false);
const solution=await readProjectFile(root,'01','src/index.ts','solution');
await writeProjectFile(root,'01','src/index.ts',solution);
assert.equal((await testLab(root,'01')).passed,true,'Learner edit must pass');
const replacement=await replaceWorkspace(root,'01');assert.equal((await testLab(root,'01')).passed,false);
await replaceWorkspace(root,'01',{backup:replacement.backup.split(/[\\/]/).at(-1)});
assert.equal((await testLab(root,'01')).passed,true,'Restore must preserve learner code');
await updateProgress(root,'01',true);assert.ok((await readProgress(root)).completed.includes('01'));
await selectWorkspace(root,'02');await selectWorkspace(root,'01');assert.equal(await readProjectFile(root,'01','src/index.ts'),solution);
await mkdir(join(root,'acceptance-results'),{recursive:true});
await writeFile(join(root,'acceptance-results/icode.json'),JSON.stringify({steps:13,documents:38,results,persistence:true,restore:true,sourceIntegrity:true},null,2));
console.log('Course assessments, 38 documents, source integrity, learner edit and persistence/restore passed.');
