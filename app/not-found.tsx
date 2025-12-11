import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-blue-600 font-mono flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-300 mb-4">🎄 404 🎄</h1>
        <p className="text-2xl text-white mb-4">Sorry! Page Not Found</p>
        <p className="text-lg text-yellow-300 mb-8">
          It seems Santa couldn't find this page at the North Pole!
        </p>
        <Link
          href="/"
          className="bg-red-700 border-2 border-yellow-300 px-6 py-3 text-yellow-300 font-bold hover:bg-red-600 transition-colors inline-block"
        >
          Return to Home 🏠
        </Link>
      </div>
    </div>
  );
}
