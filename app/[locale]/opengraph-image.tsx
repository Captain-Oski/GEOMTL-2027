import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import GeoMTLLogo from '@/components/ui/GeoMTLLogo';

// Aperçu des partages (LinkedIn, courriels, messageries) : logo sur la trame
// dégradée des en-têtes de page. Une par langue ; le fichier de fond est inclus
// dans la fonction par outputFileTracingIncludes (next.config.mjs).

export const alt = 'GÉOMTL 2027';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function ImagePartage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const fr = locale !== 'en';
  const trame = await readFile(join(process.cwd(), 'public/images/brand/degrade-trame.jpg'));

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#F4F3ED' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/jpeg;base64,${trame.toString('base64')}`}
          width={1200}
          height={630}
          alt=""
          style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#141412',
          }}
        >
          <GeoMTLLogo height={150} />
          <div style={{ marginTop: 44, fontSize: 42, fontWeight: 600 }}>
            {fr ? 'Comprendre le territoire, façonner l\'avenir.' : 'Understanding the territory, shaping the future.'}
          </div>
          <div style={{ marginTop: 18, fontSize: 30 }}>
            {fr ? '3–5 octobre 2027 · Centre de congrès de Saint-Hyacinthe' : 'October 3–5, 2027 · Centre de congrès de Saint-Hyacinthe'}
          </div>
        </div>
      </div>
    ),
    size
  );
}
