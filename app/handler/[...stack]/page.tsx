// Stack Auth removed. This route is no longer needed.
// OAuth is now handled client-side by Firebase Auth (signInWithPopup).
import { redirect } from 'next/navigation'
export default function Handler() {
  redirect('/auth/login')
}
