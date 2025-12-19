import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect directly to dashboard in demo mode
  redirect('/dashboard');
}
