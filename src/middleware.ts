import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value
  const isAuthenticated = !!accessToken

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/cotizar') ||
    pathname.startsWith('/tramites') ||
    pathname.startsWith('/recompensas') ||
    pathname.startsWith('/price-match') ||
    pathname.startsWith('/perfil') ||
    pathname.startsWith('/clientes')

  const isAdminPage = pathname.startsWith('/admin')
  const isSuperAdminPage = pathname.startsWith('/superadmin')

  if ((isProtectedPage || isAdminPage || isSuperAdminPage) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
