import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">🔳</div>
      <h1 className="font-display font-black text-5xl mb-3">404</h1>
      <p className="text-muted text-lg mb-8">Oops! This page doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary px-8 py-3 rounded-xl text-base no-underline">
        Go Home →
      </Link>
    </div>
  );
}
