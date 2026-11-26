import { notFound } from 'next/navigation';

export const instant = false;

// Unknown paths under a locale do not render [locale]/not-found on their own.
// Calling notFound() here selects that page and keeps the locale layout.
export default function CatchAllPage() {
    notFound();
}
