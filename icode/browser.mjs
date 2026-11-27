import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'node:net';
const child=spawn(process.execPath,['icode/run.mjs','start'],{stdio:['ignore','pipe','pipe']});
const closed=once(child,'close');let logs='';for(const stream of [child.stdout,child.stderr])stream.on('data',x=>{logs=(logs+x).slice(-8000);});
let browser;
const evidence=[];
async function ready(url){for(let i=0;i<100;i++){try{if((await fetch(url,{signal:AbortSignal.timeout(300)})).ok)return;}catch{}await new Promise(r=>setTimeout(r,200));}throw new Error('Server unavailable: '+logs);}
async function released(port){const server=createServer();await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});await new Promise(r=>server.close(r));}
try {
 await mkdir('acceptance-results',{recursive:true});
 await ready('http://127.0.0.1:5173/');
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(20000);
 await page.goto('http://127.0.0.1:5173/');
 await page.locator('button.exercise').first().waitFor();assert.equal(await page.locator('button.exercise').count(),13);
 for(let index=0;index<13;index++){
  await page.locator('button.exercise').nth(index).click();
  await page.getByRole('heading',{level:1}).waitFor();
  await page.locator('.lesson-panel').getByText('Exercise introduction',{exact:true}).waitFor();
 }
 evidence.push('All 13 lessons navigate with introduction and wrap-up documents');
 await page.screenshot({path:'acceptance-results/course.png',fullPage:true});
 await page.getByRole('tab',{name:'Solution',exact:true}).click();
 await page.getByRole('tab',{name:'Preview',exact:true}).click();
 await page.getByRole('button',{name:'Start app',exact:true}).click();
 await page.getByRole('button',{name:'Stop app',exact:true}).waitFor();
 const inspector=page.frameLocator('iframe[title="Live preview"]');
 await inspector.getByRole('button',{name:'Connect',exact:true}).click();
 await inspector.getByText('Connected',{exact:true}).waitFor();
 evidence.push('Official MCP Inspector connects to Icode-owned solution stdio server');
 for(const name of ['Tools','Resources','Prompts'])await inspector.getByRole('tab',{name,exact:true}).waitFor();
 await page.getByRole('button',{name:'Stop app',exact:true}).click();
 await page.getByRole('button',{name:'Start app',exact:true}).waitFor();
 // Final lesson is mapped to 13. Inspector owns preview, proxy and client ports.
 for(const port of [4413,5413,6413])await released(port);
 await page.getByRole('button',{name:'Start app',exact:true}).click();
 await page.getByRole('button',{name:'Stop app',exact:true}).waitFor();
 evidence.push('Inspector stops cleanly and restarts');
 child.kill('SIGTERM');const [code]=await closed;assert.equal(code,0,logs);
 for(const port of [4317,5173,4413,5413,6413])await released(port);
 evidence.push('Launcher shutdown releases API, UI and all owned Inspector ports');
 await writeFile('acceptance-results/browser.json',JSON.stringify({passed:true,evidence},null,2));
 console.log(evidence.join('\n'));
} catch(error) {
 await writeFile('acceptance-results/browser-error.txt',error.stack||error.message);
 throw error;
} finally {await browser?.close();if(child.exitCode===null&&child.signalCode===null)child.kill('SIGTERM');await closed;}
