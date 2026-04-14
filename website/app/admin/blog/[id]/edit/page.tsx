import { BlogService } from '@/lib/blog-service';
import EditPostClient from '@/components/admin/EditPostClient';

// Generate static params for existing posts (SSG)
export async function generateStaticParams() {
    const posts = await BlogService.getPosts();
    return posts
        .filter((post): post is typeof post & { id: string } => typeof post.id === "string" && post.id.length > 0)
        .map((post) => ({
            id: post.id,
        }));
}

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <EditPostClient id={id} />;
}
