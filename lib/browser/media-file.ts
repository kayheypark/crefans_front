// 2026-11-19: image download for in-browser file work (share PNG, guest sample). Display components must not call fetch directly
// (tests/crefans-contract.test.cjs), so they use this helper. Throws when the response is not a successful image download.
export async function fetchImageBlob(url:string):Promise<Blob>{
 const response=await fetch(url);if(!response.ok)throw new Error('download');
 return response.blob();
}
