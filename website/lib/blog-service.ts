import { db, storage } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    setDoc,
    DocumentData
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { blogPosts } from "./blog-content";

export interface BlogPost {
    id?: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // HTML content
    coverImage?: string;
    author: string;
    date: string; // Display date string e.g. "December 27, 2025"
    readTime: string;
    categories: string[];

    // SEO Fields
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];

    // Internal
    createdAt?: any;
    updatedAt?: any;
}

const BLOG_COLLECTION = "posts";

/**
 * Sanitizes a post to ensure it can be passed from Server to Client components.
 * Specifically handles Firebase Timestamps.
 */
const sanitizePost = (post: any): BlogPost => {
    const sanitized = { ...post };
    if (sanitized.createdAt && typeof sanitized.createdAt.toDate === 'function') {
        sanitized.createdAt = sanitized.createdAt.toMillis();
    }
    if (sanitized.updatedAt && typeof sanitized.updatedAt.toDate === 'function') {
        sanitized.updatedAt = sanitized.updatedAt.toMillis();
    }
    return sanitized as BlogPost;
};

export const BlogService = {
    // Get all posts (local + optional firestore if needed later)
    async getPosts(): Promise<BlogPost[]> {
        try {
            // Priority 1: High-Authority Local Content
            const localPosts = [...blogPosts];
            
            // Priority 2: Federated Firestore Content (Admin-added)
            const q = query(collection(db, BLOG_COLLECTION), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const remotePosts = querySnapshot.docs.map(doc => sanitizePost({
                id: doc.id,
                ...doc.data()
            }));

            // Merge & De-duplicate: Local posts take priority on top
            const allPosts = [...localPosts, ...remotePosts];
            const seenSlugs = new Set();
            return allPosts.filter(post => {
                if (seenSlugs.has(post.slug)) return false;
                seenSlugs.add(post.slug);
                return true;
            });
        } catch (error) {
            console.error("Error fetching posts:", error);
            return [...blogPosts];
        }
    },

    // Get single post by slug
    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        try {
            const localPost = blogPosts.find(p => p.slug === slug);
            if (localPost) return localPost;

            const q = query(collection(db, BLOG_COLLECTION), where("slug", "==", slug));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return sanitizePost({ id: doc.id, ...doc.data() });
            }
            return null;
        } catch (error) {
            console.error("Error fetching post by slug:", error);
            return null;
        }
    },

    // Get single post by ID
    async getPostById(id: string): Promise<BlogPost | null> {
        try {
            const docRef = doc(db, BLOG_COLLECTION, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return sanitizePost({ id: docSnap.id, ...docSnap.data() });
            }
            return null;
        } catch (error) {
            console.error("Error fetching post by ID:", error);
            return null;
        }
    },

    // Create Post
    async createPost(post: Omit<BlogPost, 'id' | 'createdAt'>): Promise<string> {
        const docRef = await addDoc(collection(db, BLOG_COLLECTION), {
            ...post,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return docRef.id;
    },

    // Update Post
    async updatePost(id: string, post: Partial<BlogPost>): Promise<void> {
        const docRef = doc(db, BLOG_COLLECTION, id);
        const updateData = {
            ...post,
            updatedAt: Timestamp.now()
        };
        await updateDoc(docRef, updateData);
    },

    // Delete Post
    async deletePost(id: string): Promise<void> {
        await deleteDoc(doc(db, BLOG_COLLECTION, id));
    },

    // Upload Image
    async uploadImage(file: File, path: string = "blog_images"): Promise<string> {
        try {
            const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    }
};
