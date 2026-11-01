import base from './playwright.config';
import {defineConfig,devices} from '@playwright/test';
const out=process.env.QA_RUN_DIR||'.local/signup-complete';
export default defineConfig({...base,testMatch:/signup-(complete|deferred)\.spec\.ts/,outputDir:`${out}/results`,
 reporter:[['list'],['json',{outputFile:`${out}/results.json`}]],
 projects:[
  {name:'pc',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},
  {name:'mobile',use:{...devices['Pixel 7'],viewport:{width:390,height:844}}},
  {name:'mobile-webkit',use:{...devices['iPhone 13'],viewport:{width:390,height:844}}},
 ]});
