import {NextRequest} from 'next/server';
import {proxyPlatform} from '@/lib/api/platformProxy';
export const dynamic='force-dynamic';
export const GET=proxyPlatform,POST=proxyPlatform,PUT=proxyPlatform,PATCH=proxyPlatform,DELETE=proxyPlatform;
