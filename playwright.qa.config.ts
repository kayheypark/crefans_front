import base from './playwright.config';
import {defineConfig,devices} from '@playwright/test';
// QA run config (2026-10-31): the same isolated servers as playwright.config.ts, with separate PC and Mobile projects,
// screenshots and traces for every test. Output goes to QA_RUN_DIR (Git-ignored .local run folder).
const out=process.env.QA_RUN_DIR||'.local/qa-run';
const mobileOnly=/(mobile-comments|mobile-shell|gallery-image-tap|chip-row-bleed|signin-prompt-gutter)\.spec\.ts/;
export default defineConfig({...base,outputDir:`${out}/results`,timeout:90000,
 reporter:[['list'],['json',{outputFile:`${out}/playwright-results.json`}],['html',{open:'never',outputFolder:`${out}/html-report`}]],
 use:{...base.use,trace:'on',screenshot:'on',video:'off'},
 projects:[
  {name:'pc',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},
  {name:'mobile',use:{...devices['Pixel 7'],viewport:{width:390,height:844}}},
  {name:'mobile-webkit',testMatch:mobileOnly,use:{...devices['iPhone 13'],viewport:{width:390,height:844}}},
 ]});
