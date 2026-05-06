import { Icons } from '../components/Icons';
import { initialBlogs } from '../data/mockData';

export default function Blog() {
  return (
    <div className="flex flex-col py-16 px-8 max-w-7xl mx-auto min-h-screen">
      <header className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <h1 className="font-sans text-[32px] md:text-5xl font-extrabold text-primary leading-tight">
          Agricultural Insights
        </h1>
        <p className="text-base md:text-lg text-on-surface-variant font-serif">
          Simple, expert advice to maximize your crop yield and ensure soil health.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialBlogs.map((blog) => (
          <article key={blog.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-sans font-bold rounded-full uppercase tracking-widest">
                {blog.category}
              </span>
              <span className="text-xs text-slate-400 font-sans font-medium">{blog.date}</span>
            </div>
            <h3 className="font-sans text-xl font-bold text-primary mb-4 leading-snug">
              {blog.title}
            </h3>
            <p className="text-sm text-on-surface-variant font-serif mb-8 flex-grow">
              {blog.excerpt}
            </p>
            <button className="flex items-center gap-2 font-sans font-bold text-primary text-sm hover:text-secondary-container transition-colors mt-auto w-fit">
              Read Article <Icons.ArrowRight className="w-4 h-4" />
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
