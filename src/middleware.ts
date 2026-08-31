import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE, ROLE_COOKIE } from '@/lib/constants';

const TEACHER_BLOCKED = ['/fees', '/staff/payroll', '/finance', '/settings'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;
  const isAuthenticated = Boolean(token);

  if (pathname === '/') {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role === 'saas_admin') {
      return NextResponse.redirect(new URL('/saas/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname === '/login') {
    if (isAuthenticated) {
      if (role === 'saas_admin') {
        return NextResponse.redirect(new URL('/saas/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/saas')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'saas_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  const tenantPaths = [
    '/dashboard',
    '/students',
    '/attendance',
    '/fees',
    '/academics',
    '/staff',
    '/finance',
    '/reports',
    '/analytics',
    '/notifications',
    '/settings',
  ];

  const isTenant = tenantPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isTenant) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role === 'saas_admin') {
      return NextResponse.redirect(new URL('/saas/dashboard', request.url));
    }
    if (role === 'teacher') {
      const blocked = TEACHER_BLOCKED.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
      );
      if (blocked) {
        const url = new URL('/dashboard', request.url);
        url.searchParams.set('blocked', 'true');
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/students/:path*',
    '/attendance/:path*',
    '/fees/:path*',
    '/academics/:path*',
    '/staff/:path*',
    '/finance/:path*',
    '/reports/:path*',
    '/analytics/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/saas/:path*',
  ],
};
