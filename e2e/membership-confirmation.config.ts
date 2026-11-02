import config from './membership-upload.config';
import path from 'node:path';
export default {...config,testMatch:['membership-confirmation.spec.ts','membership-upload.spec.ts'],outputDir:path.resolve(__dirname,'../test-results/membership-confirmation'),reporter:[['list'],['json',{outputFile:path.resolve(__dirname,'../test-results/membership-confirmation.json')}]]};
