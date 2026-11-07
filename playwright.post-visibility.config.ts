import {defineConfig,devices} from '@playwright/test';
// Studio post unpublish (2026-11-07): API stand-in only, so no server/DB runtime is started. Own port and .next-e2e of this worktree.
export default defineConfig({testDir:'./e2e',testMatch:/studio-post-visibility\.spec\.ts/,outputDir:'test-results/post-visibility',fullyParallel:false,workers:1,timeout:60000,expect:{timeout:15000},retries:0,reporter:[['list']],use:{baseURL:'http://127.0.0.1:3021',trace:'retain-on-failure',screenshot:'only-on-failure'},projects:[
 {name:'pc',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1000}}},
 {name:'mobile',use:{...devices['Pixel 7']}},
],webServer:[{command:'npm run dev -- --hostname 127.0.0.1 --port 3021',url:'http://127.0.0.1:3021/preview/login',reuseExistingServer:false,timeout:180000,gracefulShutdown:{signal:'SIGTERM',timeout:15000},env:{CREFANS_E2E:'true',PLATFORM_API_ORIGIN:'http://127.0.0.1:9'}}]});
