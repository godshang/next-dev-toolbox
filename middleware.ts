import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  defaultLocaleSegment,
  isLocalePathSegment,
  localeToSegment,
} from '@/lib/i18n/routing';
import { isLocale } from '@/lib/i18n/locales';

const LOCALE_COOKIE = 'dev-toolbox-locale';

function preferredSegment(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && isLocale(cookie)) return localeToSegment(cookie);

  const accept = request.headers.get('accept-language') ?? '';
  if (/\ben\b/i.test(accept) && !/\bzh\b/i.test(accept)) return 'en';
  return defaultLocaleSegment();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const segment = preferredSegment(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${segment}`;
    return NextResponse.redirect(url);
  }

  const first = pathname.split('/').filter(Boolean)[0];
  if (first && !isLocalePathSegment(first) && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    const segment = preferredSegment(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${segment}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
