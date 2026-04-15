import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Firebase Auth is client-side; route protection is handled in each page via useAuth().
export function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = { matcher: [] }
