import type { Metadata } from 'next';
import { alternatesPage } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  return { title: locale === 'fr' ? 'Devenir partenaire' : 'Become a partner', alternates: alternatesPage(locale, '/devenir-partenaire') };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
