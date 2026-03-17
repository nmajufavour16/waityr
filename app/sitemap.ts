import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://waityr.vercel.app', lastModified: new Date() },
    { url: 'https://waityr.vercel.app/privacy', lastModified: new Date() },
    { url: 'https://waityr.vercel.app/terms', lastModified: new Date() },
  ];
}
