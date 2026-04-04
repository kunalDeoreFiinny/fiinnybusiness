import { BlogService } from "@/lib/blog-service";
import BlogSearch from "@/components/blog/BlogSearch";
import BlogAdminButton from "@/components/blog/BlogAdminButton";
import BlogNav from "@/components/blog/BlogNav";

export const metadata = {
    title: "The Finance Log | Fiinny Blog",
    description: "Insights on money, clarity, and peace of mind. No jargon, just clear thinking from the Fiinny team.",
};

export default async function BlogIndex() {
    const posts = await BlogService.getPosts();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
            <BlogAdminButton />
            <BlogNav />

            <main className="pt-40 pb-24 px-4 sm:px-6 container mx-auto max-w-7xl">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-[0.2em] mb-8 border border-teal-100">
                        The Finance Log
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-slate-900">
                        Fiinny Blog
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">
                        Insights on money, clarity, and peace of mind. <br className="hidden md:block" /> No jargon, just clear thinking.
                    </p>
                </div>

                <BlogSearch initialPosts={posts} />
            </main>
        </div>
    );
}
