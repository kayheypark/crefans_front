const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
// 2026-11-26 owner decision: the home feed opens on the 코스프레 category instead of 전체.
test("home feed starts on the cosplay category",()=>{
 const src=fs.readFileSync("features/service/useServiceModel.ts","utf8");
 assert.match(src,/const \[feedCategory,setFeedCategory\]=useState\(\x27코스프레\x27\);/);
});
