import { ICONS, CROPS, PRODUCTS } from '../constants';
import { motion } from 'framer-motion';
import { MarketplaceProduct } from '../../types/product';
import { HelperIcon } from '../../components/helpers';

interface HomeViewProps {
  products?: MarketplaceProduct[];
  onProductClick: (id: string) => void;
  onHubClick: () => void;
}

export default function HomeView({ products = PRODUCTS, onProductClick, onHubClick }: HomeViewProps) {
  return (
    <div className="flex flex-col gap-10 py-6 md:py-10">
      {/* Hero Section */}
      <section data-tour="hero" className="px-4 md:px-10 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden shadow-ambient min-h-[400px] flex flex-col justify-center p-8 md:p-12">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcJewaf8J1gWZEdY6ipzy3p0M5aZoePmxCri9BSh7nbzy4FW-i7Azi-fBl6G0vr9TDZY9Q0XxD_GHq2_mJECmXU0oGsqJSZEnh1-5IRtoFi-mxGzKT9SHQH5HJW6wrhRD4Z98Wjo19TKEXGiIpyPXcFVZVvSuhCD9bXXV1kQRL_o0HNQ6-7KIySLLVdAddKSxPd14-jD0W8uG58KaJpjHYahRINJqJMRzG_CvOOiM2CGpIBu5yKjDn4P8gspnpRXThlkMm_JgsHX0L" 
              className="w-full h-full object-cover"
              alt="Farm hero"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40" />
          </div>
          
          <div className="absolute top-4 right-4 z-20">
            <HelperIcon
              size="sm"
              variant="onDark"
              side="left"
              title="Getting started"
              ariaLabel="Hero help"
              content="Start by exploring nearby products or browse crop categories below."
            />
          </div>

          <div className="relative z-10 max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-5xl md:text-7xl font-bold font-sans tracking-tight leading-[1.1] mb-4"
            >
              Modern Produce,<br />Rooted Locally.
            </motion.h1>
            <p className="text-on-primary-container text-lg md:text-xl max-w-lg mb-8">
              Find the freshest harvest and agricultural supplies directly from local stores in your area.
            </p>

            <button
              onClick={onHubClick}
              className="bg-white text-primary font-bold px-8 py-3 rounded-xl w-full sm:w-auto hover:bg-primary-container hover:text-white transition-colors flex items-center justify-center gap-2 shadow-xl max-w-xs"
            >
              <ICONS.ArrowRight className="w-5 h-5" />
              Explore Products
            </button>
          </div>
        </div>
      </section>

      {/* Shop by Crop */}
      <section data-tour="shop-by-crop" className="px-4 md:px-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-8">
          <h2 className="text-3xl font-bold text-on-surface">Shop by Crop</h2>
          <HelperIcon
            size="sm"
            side="right"
            title="Crop hubs"
            ariaLabel="Shop by crop help"
            content="Crop hubs organize products, fertilizers, and tools specifically for each crop."
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CROPS.map((crop, i) => (
            <motion.button 
              key={crop.id}
              whileHover={{ y: -5 }}
              onClick={onHubClick}
              className="group bg-surface-container-low rounded-3xl p-6 flex flex-col items-center gap-4 shadow-sm hover:shadow-ambient hover:bg-surface-container transition-all border border-transparent hover:border-outline-variant"
            >
              <div className="w-20 h-20 rounded-full bg-white shadow-sm overflow-hidden border border-surface-container-highest group-hover:scale-110 transition-transform">
                <img src={crop.image} alt={crop.name} className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-on-surface">{crop.name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto w-full py-10 bg-white shadow-sm border-y border-surface-container">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-on-surface">Trending Near You</h2>
          <button className="text-primary font-bold flex items-center gap-2 hover:translate-x-1 transition-transform">
            View All <ICONS.ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.length > 0 ? products.map((product) => (
            <motion.div 
              key={product.id}
              className="bg-surface rounded-3xl overflow-hidden shadow-ambient border border-surface-container flex flex-col group cursor-pointer"
              onClick={() => onProductClick(product.id)}
            >
              <div className="h-56 relative overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-primary-container/90 text-on-primary-container backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {product.stock}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-on-surface line-clamp-1">{product.name}</h3>
                  <span className="text-xl font-bold text-secondary">₹{product.price}</span>
                </div>
                <p className="text-on-surface-variant text-sm mb-6 flex-1 line-clamp-2">{product.description}</p>
                <div className="flex gap-3">
                  <button className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors">View Details</button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-10 text-center bg-surface-container-low rounded-3xl border border-dashed border-surface-container">
              <p className="text-on-surface-variant font-medium">No trending products found in your area.</p>
            </div>
          )}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto w-full mb-10">
        <div className="bg-surface-container-low rounded-3xl p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-on-surface mb-6">Why Krishidukan?</h2>
            <p className="text-on-surface-variant text-lg mb-10">
              We bridge the gap between traditional agricultural values and contemporary digital efficiency, ensuring you get the best supplies right when you need them.
            </p>
            <div className="flex flex-col gap-8">
              {[
                { icon: ICONS.Trust, title: 'Local Trust', desc: 'Connect directly with verified sellers in your farming community.' },
                { icon: ICONS.Efficiency, title: 'Digital Efficiency', desc: 'Fast, frictionless ordering and tracking designed for your device.' }
              ].map((prop, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="bg-primary-container text-white p-3 rounded-2xl shadow-sm">
                    <prop.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface">{prop.title}</h4>
                    <p className="text-on-surface-variant">{prop.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="w-full max-w-md mx-auto relative z-10 transition-transform hover:scale-105 duration-500 scale-110 drop-shadow-2xl">
              <img 
                src="/images/regenerated_image_1778300850830.png" 
                alt="Farmer with Agricultural Supplies"
                className="w-full h-auto object-contain"
              />
            </div>
            {/* Decorative shape */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl opacity-50 z-0" />
          </div>
        </div>
      </section>
    </div>
  );
}
