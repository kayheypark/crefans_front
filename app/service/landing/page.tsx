import Landing from '@/components/service/Landing';
// Send the introduction HTML even when client scripts are delayed or blocked.
export const dynamic='force-dynamic';
export default function Page(){return <Landing/>;}
