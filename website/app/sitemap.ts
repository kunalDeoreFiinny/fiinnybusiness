import { MetadataRoute } from 'next';
import { BlogService } from '@/lib/blog-service';

export const revalidate = 86400; // Daily revalidation

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://fiinny.com';

    // Fetch blog posts
    let blogEntries: MetadataRoute.Sitemap = [];
    try {
        const posts = await BlogService.getPosts();
        blogEntries = posts.map(post => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch {
        // Blog fetch can fail gracefully in static builds
    }

    // All static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl,                          lastModified: new Date(), changeFrequency: 'daily' as const,   priority: 1.0 },
        { url: `${baseUrl}/blog`,                lastModified: new Date(), changeFrequency: 'daily' as const,   priority: 0.9 },
        { url: `${baseUrl}/tax`,                 lastModified: new Date(), changeFrequency: 'weekly' as const,  priority: 0.9 },
        { url: `${baseUrl}/how-it-works`,        lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
        { url: `${baseUrl}/trust`,               lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
        { url: `${baseUrl}/subscription`,        lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
        { url: `${baseUrl}/loan-audit`,          lastModified: new Date(), changeFrequency: 'weekly' as const,  priority: 0.8 },
        { url: `${baseUrl}/about`,               lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
        { url: `${baseUrl}/contact`,             lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
        { url: `${baseUrl}/download`,            lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
        { url: `${baseUrl}/careers`,             lastModified: new Date(), changeFrequency: 'weekly' as const,  priority: 0.7 },
        { url: `${baseUrl}/changelog`,           lastModified: new Date(), changeFrequency: 'weekly' as const,  priority: 0.6 },
        { url: `${baseUrl}/privacy`,             lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
        { url: `${baseUrl}/terms`,               lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
        { url: `${baseUrl}/support`,             lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
        { url: `${baseUrl}/countries`,           lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
        { url: `${baseUrl}/business`,            lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    ];

    return [...staticPages, ...blogEntries];
}
