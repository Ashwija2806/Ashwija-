import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page Not Found', 'The page you requested could not be found on Stylo.');

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#FF3F6C]">
        Error 404
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-[#282C3F]">
        We could not find that page
      </h1>
      <p className="mt-2 text-sm text-[#7E818C]">
        The link may be outdated or the collection has moved. Explore our newest edits instead.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="rounded border border-[#282C3F] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#282C3F] hover:bg-[#282C3F] hover:text-white"
        >
          Back to Home
        </Link>
        <Link
          to="/shop"
          className="rounded bg-[#FF3F6C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E02D59]"
        >
          Shop All
        </Link>
      </div>
    </main>
  );
}
