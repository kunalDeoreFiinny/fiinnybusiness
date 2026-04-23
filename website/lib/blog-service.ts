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

export interface BlogPost {
    id?: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // HTML content
    coverImage?: string;
    videoUrl?: string; // Support for MP4 or YouTube links
    author: string;
    date: string; // Display date string e.g. "December 27, 2025"
    readTime: string;
    categories: string[];
    published: boolean;

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
    if (sanitized.published === undefined) {
        sanitized.published = true;
    }
    return sanitized as BlogPost;
};

export const BlogService = {
    // Get all posts
    async getPosts(includeDrafts: boolean = false): Promise<BlogPost[]> {
        try {
            // Fetch all posts. We sort in memory to avoid needing composite indexes.
            const q = query(collection(db, BLOG_COLLECTION));
            const querySnapshot = await getDocs(q);
            
            let remotePosts = querySnapshot.docs.map(doc => sanitizePost({
                id: doc.id,
                ...doc.data()
            }));

            // INJECT HARDCODED BLOG POST 
            remotePosts.push({
                id: "static-top-finance-tracking-apps",
                slug: "top-finance-tracking-apps-list-fiinny",
                title: "Why Fiinny is Topping the Finance Tracking Apps List in 2026",
                excerpt: "How a founder-built app reached 1,000 users in 30 days without marketing, earning 5-stars on the App Store and 4.8 on Play Store. Here's why Fiinny has become the privacy-first choice for Indians.",
                seoTitle: "Top Finance Tracking Apps List 2026 — Why Users Trust Fiinny",
                seoDescription: "Looking for the top finance tracking apps list in India? See why Fiinny hit 1,000 users in 30 days, boasting 5-star App Store trust.",
                keywords: ["top finance tracking apps list", "best personal finance apps india", "fiinny app review", "expense tracker 5 stars", "private finance app"],
                author: "Arjun Tanpure",
                date: "April 19, 2026",
                readTime: "5 min read",
                categories: ["Product Journey", "Reviews"],
                published: true,
                createdAt: 1713500000000, 
                content: `<h2>The Rise of a Founder-Built Finance App</h2>
<p>When searching for the <strong>top finance tracking apps list</strong>, you'll usually find the same massive corporate names. But over the last 30 days, a completely bootstrapped, founder-built app has been quietly making waves in India: <strong>Fiinny</strong>.</p>
<p>In our first 30 days of launch, Fiinny organically onboarded its first <strong>1,000 users</strong> with zero marketing budget. Even more humbly, our early adopters have rated us exactly <strong>5.0 stars on the iOS App Store</strong> and <strong>4.8 stars on the Google Play Store</strong>.</p>
<p>As the founder, my name is <strong>Arjun Tanpure</strong>. I didn't build Fiinny in a corporate boardroom. I built it because I personally faced the exact problem you are facing: existing expense trackers were either too manual, incredibly intrusive with data, or failed to understand Indian payment methods like UPI and bank SMS formats.</p>

<h2>Why Are Users Rating Fiinny 5 Stars?</h2>
<p>The feedback across our top reviews consistently highlights three major technical decisions we made from day one:</p>
<ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 20px;">
  <li><strong>100% Privacy-First Architecture:</strong> Most apps in the "top finance tracking apps list" upload your raw, sensitive financial SMS messages to their cloud servers. Fiinny parses your bank SMS completely <em>on-device</em>. Your local data never reaches our servers.</li>
  <li><strong>Zero Manual Entry:</strong> We trained our local ML models to immediately recognize every major Indian bank SMS format and UPI string (GPay, PhonePe, Paytm), meaning you open the app and your expenses are just... there.</li>
  <li><strong>Built by a User, for Users:</strong> When a user reports a bug, I fix it. There is no middleman. Being founder-led means we ship updates based on what you actually ask for, not what a product manager thinks is monetizable.</li>
</ul>

<h2>The 1,000 User Milestone</h2>
<p>Reaching 1,000 active users in 30 days happened solely through word-of-mouth. Friends telling friends about "this new tracker that actually categorizes UPI right." That level of trust isn't something we take lightly.</p>
<p>To everyone who left a 5-star review: thank you. You are validating the hypothesis that Indians want beautiful, automated, and fiercely private software.</p>

<h2>Looking for the Best Expense Tracker?</h2>
<p>If you've been disappointed by the generic corporate apps dominating the <strong>top finance tracking apps list</strong>, give an indie hacker a shot.</p>
<p>Find out why 1,000 users trust us. Download <a href="https://fiinny.com" style="color: #0d9488; font-weight: bold; text-decoration: underline;">Fiinny</a> on your iPhone or Android today, and take back control of your privacy and your finances.</p>`
            });

            // Filter out drafts if necessary
            if (!includeDrafts) {
                remotePosts = remotePosts.filter(post => post.published);
            }

            // Sort by descending date
            remotePosts.sort((a, b) => {
                const timeA = a.createdAt || 0;
                const timeB = b.createdAt || 0;
                return timeB - timeA;
            });

            // Merge & De-duplicate: Ensure slugs are unique
            const seenSlugs = new Set();
            return remotePosts.filter(post => {
                if (seenSlugs.has(post.slug)) return false;
                seenSlugs.add(post.slug);
                return true;
            });
        } catch (error) {
            console.error("Error fetching posts:", error);
            return [];
        }
    },

    // Get single post by slug
    async getPostBySlug(slug: string, showDraft: boolean = false): Promise<BlogPost | null> {
        try {
            const q = query(collection(db, BLOG_COLLECTION), where("slug", "==", slug));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const post = sanitizePost({ id: doc.id, ...doc.data() });
                
                // If it's a draft and we aren't allowed to see drafts, return null
                if (!post.published && !showDraft) return null;
                
                return post;
            }

            // FALLBACK FOR HARDCODED SECURE POST
            if (slug === "top-finance-tracking-apps-list-fiinny") {
                return {
                    id: "static-top-finance-tracking-apps",
                    slug: "top-finance-tracking-apps-list-fiinny",
                    title: "Why Fiinny is Topping the Finance Tracking Apps List in 2026",
                    excerpt: "How a founder-built app reached 1,000 users in 30 days without marketing, earning 5-stars on the App Store and 4.8 on Play Store. Here's why Fiinny has become the privacy-first choice for Indians.",
                    seoTitle: "Top Finance Tracking Apps List 2026 — Why Users Trust Fiinny",
                    seoDescription: "Looking for the top finance tracking apps list in India? See why Fiinny hit 1,000 users in 30 days, boasting 5-star App Store trust.",
                    keywords: ["top finance tracking apps list", "best personal finance apps india", "fiinny app review", "expense tracker 5 stars", "private finance app"],
                    author: "Arjun Tanpure",
                    date: "April 19, 2026",
                    readTime: "5 min read",
                    categories: ["Product Journey", "Reviews"],
                    published: true,
                    createdAt: 1713500000000, 
                    content: `<h2>The Rise of a Founder-Built Finance App</h2>
<p>When searching for the <strong>top finance tracking apps list</strong>, you'll usually find the same massive corporate names. But over the last 30 days, a completely bootstrapped, founder-built app has been quietly making waves in India: <strong>Fiinny</strong>.</p>
<p>In our first 30 days of launch, Fiinny organically onboarded its first <strong>1,000 users</strong> with zero marketing budget. Even more humbly, our early adopters have rated us exactly <strong>5.0 stars on the iOS App Store</strong> and <strong>4.8 stars on the Google Play Store</strong>.</p>
<p>As the founder, my name is <strong>Arjun Tanpure</strong>. I didn't build Fiinny in a corporate boardroom. I built it because I personally faced the exact problem you are facing: existing expense trackers were either too manual, incredibly intrusive with data, or failed to understand Indian payment methods like UPI and bank SMS formats.</p>

<h2>Why Are Users Rating Fiinny 5 Stars?</h2>
<p>The feedback across our top reviews consistently highlights three major technical decisions we made from day one:</p>
<ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 20px;">
  <li><strong>100% Privacy-First Architecture:</strong> Most apps in the "top finance tracking apps list" upload your raw, sensitive financial SMS messages to their cloud servers. Fiinny parses your bank SMS completely <em>on-device</em>. Your local data never reaches our servers.</li>
  <li><strong>Zero Manual Entry:</strong> We trained our local ML models to immediately recognize every major Indian bank SMS format and UPI string (GPay, PhonePe, Paytm), meaning you open the app and your expenses are just... there.</li>
  <li><strong>Built by a User, for Users:</strong> When a user reports a bug, I fix it. There is no middleman. Being founder-led means we ship updates based on what you actually ask for, not what a product manager thinks is monetizable.</li>
</ul>

<h2>The 1,000 User Milestone</h2>
<p>Reaching 1,000 active users in 30 days happened solely through word-of-mouth. Friends telling friends about "this new tracker that actually categorizes UPI right." That level of trust isn't something we take lightly.</p>
<p>To everyone who left a 5-star review: thank you. You are validating the hypothesis that Indians want beautiful, automated, and fiercely private software.</p>

<h2>Looking for the Best Expense Tracker?</h2>
<p>If you've been disappointed by the generic corporate apps dominating the <strong>top finance tracking apps list</strong>, give an indie hacker a shot.</p>
<p>Find out why 1,000 users trust us. Download <a href="https://fiinny.com" style="color: #0d9488; font-weight: bold; text-decoration: underline;">Fiinny</a> on your iPhone or Android today, and take back control of your privacy and your finances.</p>`
                };
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
