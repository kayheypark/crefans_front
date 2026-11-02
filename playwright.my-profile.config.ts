import {defineConfig,devices} from '@playwright/test';
import base from './playwright.config';

export default defineConfig({...base,testMatch:/my-profile-(posts|live)\.spec\.ts/,outputDir:'test-results/my-profile',projects:[
 {name:'pc',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1000}}},
 {name:'mobile-webkit',use:{...devices['iPhone 13'],browserName:'webkit'}},
]});
