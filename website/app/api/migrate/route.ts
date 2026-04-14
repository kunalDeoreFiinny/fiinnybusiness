import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { blogPosts } from '@/lib/blog-content';

export async function GET() {
    try {
        const results = [];
        const postsRef = collection(db, "posts");

        for (const post of blogPosts) {
            // Check if post already exists by slug
            const q = query(postsRef, where("slug", "==", post.slug));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                // Add missing field 'published' and timestamps
                const newPost = {
                    ...post,
                    published: true,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                };
                
                const docRef = await addDoc(postsRef, newPost);
                results.push({ slug: post.slug, status: "created", id: docRef.id });
            } else {
                results.push({ slug: post.slug, status: "skipped (exists)" });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "Migration completed", 
            results 
        });
    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
