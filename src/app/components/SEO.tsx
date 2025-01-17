import Head from 'next/head';
import { SEOProps } from '../types';

export function SEO({ title, description, ogImage, canonical }: SEOProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonical && <link rel="canonical" href={canonical} />}
    </Head>
  );
}
