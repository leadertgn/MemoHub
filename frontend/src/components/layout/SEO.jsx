import { Helmet } from 'react-helmet-async';

/**
 * Composant SEO pour gérer dynamiquement les meta-tags.
 */
export default function SEO({ 
  title, 
  description, 
  image, 
  type = 'website',
  url
}) {
  const siteName = 'MemoHub';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = "MemoHub - La plateforme collaborative d'archivage et de consultation de mémoires académiques.";
  const siteUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  return (
    <Helmet>
      {/* Standard tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={`${siteUrl}${url}`} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
