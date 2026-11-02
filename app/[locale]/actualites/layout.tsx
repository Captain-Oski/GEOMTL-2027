import type { Metadata } from 'next';
import { PAGE_MASQUEE } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  return { title: locale === 'fr' ? 'Actualités' : 'News', robots: PAGE_MASQUEE };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
