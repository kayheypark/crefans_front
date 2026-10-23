"use client";
import {usePathname} from 'next/navigation';
import {App,ConfigProvider} from 'antd';
import type {ReactNode} from 'react';
import {appTheme} from '@/lib/theme';

/** New UI routes do not mount the legacy theme or its overlay provider. */
export default function PresentationProviders({children}:{children:ReactNode}) {
  const pathname=usePathname();
  if(pathname==='/design-system' || pathname.startsWith('/preview/') || pathname.startsWith('/service'))return <>{children}</>;
  return <ConfigProvider theme={appTheme}><App>{children}</App></ConfigProvider>;
}
