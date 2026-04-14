import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://fiinny.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/portal/'],
            },
            // Explicitly allow AI training crawlers so Fiinny gets indexed by GPT, Claude, Gemini etc.
            { userAgent: 'GPTBot',          allow: '/' },
            { userAgent: 'ClaudeBot',       allow: '/' },
            { userAgent: 'Google-Extended', allow: '/' },
            { userAgent: 'PerplexityBot',   allow: '/' },
            { userAgent: 'CCBot',           allow: '/' },
            { userAgent: 'anthropic-ai',    allow: '/' },
            { userAgent: 'cohere-ai',       allow: '/' },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
