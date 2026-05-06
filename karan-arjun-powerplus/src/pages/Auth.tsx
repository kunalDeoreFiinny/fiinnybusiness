import { Icons } from '../components/Icons';

export default function Auth() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left: Image Side */}
      <div className="hidden lg:flex w-1/2 relative bg-primary-container overflow-hidden items-end p-12">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://lh3.googleusercontent.com/aida/ADBb0uiMg-b-JQP8eneEtUBoN3nthy1tdhBSG6_gAOctHTN3w73JYJrce4dcRnzHjlE8MJWXueBD5BFZALu1jxxRhIcfqdsJtctncGh-V-W8VtRZLPLUYkNgXK111GJ9RDa_MiKEpE4s3Jm7NBMflQUjX2UycDh9XjfpJJt1SkFrZ52t95rfWV3vqHG_vIEWadkgoQHiPk8v4sf5p9GAAV0XqfmR4FDO9ckc6UUKKcwdPb0PUBjG4ISlLkmwxMI5tUUVx-mTYWFm_15TH-o" 
            alt="Agri" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container to-transparent"></div>
        </div>
        <div className="relative z-10 text-white max-w-md">
          <h2 className="font-sans text-4xl font-extrabold mb-6 leading-tight">Trust with tradition, one step toward modernity.</h2>
          <p className="font-serif text-white/80 leading-relaxed text-lg">
            Join the Power Plus™ portal to manage your agricultural investments and track yields with digital precision.
          </p>
        </div>
      </div>

      {/* Right: Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
          <div className="text-center mb-10">
            <h1 className="font-sans text-3xl font-extrabold text-primary mb-2">Welcome Back</h1>
            <p className="font-serif text-on-surface-variant">Sign in to access your dashboard</p>
          </div>

          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 border border-slate-200">
            <button className="flex-1 py-3 px-4 rounded-xl bg-white shadow-sm text-primary font-sans font-bold transition-all">Sign In</button>
            <button className="flex-1 py-3 px-4 rounded-xl text-slate-500 font-sans font-bold hover:text-primary transition-all">Create Account</button>
          </div>

          <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors mb-8 font-sans font-bold text-primary">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2G12m3xsHHzz0Zs52jjHypEvXWHOgM1mdK3BDoO_xRmGaDgLoHRYsC_0oXdbaWKD4bv8C3k6dgMl9jME2LIPeu8Inrk_-oC5UQGdGCS5stwFL33m5DO_TEEEvRgqtaa38BEqN-E1F18lp2q4A0MDwQFtv_-Q3jlQZdes4eLG7JQnxZNacr1_lLGn9cNqJDsLy_2CBeZ4Ovx9yjwuryIKnj30lNniBxoH0wURjzpnyzFkXDgCw4uE00aVYSA6lHMI4h6p1701TvRBl" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-slate-400 font-sans font-bold uppercase tracking-widest">or sign in with email</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block font-sans font-bold text-primary text-sm mb-2">Email Address</label>
              <input 
                type="email" 
                placeholder="farmer@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-serif"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-sans font-bold text-primary text-sm">Password</label>
                <a href="#" className="text-xs font-sans font-bold text-secondary hover:underline">Forgot Password?</a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-serif"
              />
            </div>
            <button className="w-full py-4 bg-primary text-white font-sans font-bold rounded-xl hover:shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2">
              Sign In <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-50 flex flex-col items-center gap-3">
             <div className="flex items-center gap-2 text-xs text-slate-400 font-sans font-bold">
               <Icons.Lock className="w-3.5 h-3.5" />
               SECURE SSL ENCRYPTION
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-400 font-sans font-bold">
               <Icons.CheckCircle2 className="w-3.5 h-3.5" />
               OFFICIAL POWER PLUS™ PORTAL
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
