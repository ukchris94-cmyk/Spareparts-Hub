import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: Package,
    title: 'Real-Time Inventory',
    description: 'See availability and prices from multiple vendors instantly. No more phone calls.',
  },
  {
    icon: MapPin,
    title: 'Live Tracking',
    description: 'Track your dispatcher in real-time on the map. Know exactly when your parts arrive.',
  },
  {
    icon: Zap,
    title: 'Fast Delivery',
    description: 'Our network of dispatchers ensures quick delivery across Port Harcourt.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Pay safely with Paystack. Your transactions are protected and verified.',
  },
];

const stats = [
  { value: '500+', label: 'Spare Parts' },
  { value: '50+', label: 'Vendors' },
  { value: '20+', label: 'Dispatchers' },
  { value: '1000+', label: 'Orders Delivered' },
];

export default function Landing() {
  return (
    <div className= "min-h-screen ">
      {/* Hero Section */}
      <section className= "relative overflow-hidden ">
        <div className= "absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none " />
        <div className= "container mx-auto px-4 py-20 md:py-32 ">
          <div className= "grid lg:grid-cols-2 gap-12 items-center ">
            <div className= "space-y-8 ">
              <Badge className= "bg-amber-500/10 text-amber-500 border-amber-500/20 px-4 py-2 ">
                Port Harcourt's #1 Auto Parts Platform
              </Badge>
              <h1 className= "text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight ">
                Get Spare Parts
                <span className= "text-amber-500 "> Delivered Fast</span>
              </h1>
              <p className= "text-lg text-zinc-400 max-w-lg ">
                Connect with trusted vendors, order genuine spare parts, and track deliveries in real-time. 
                Built for mechanics who value speed and reliability.
              </p>
              <div className= "flex flex-col sm:flex-row gap-4 ">
                <Link to= "/register ">
                  <Button size= "lg " className= "bg-amber-500 text-black hover:bg-amber-400 font-bold uppercase tracking-wide btn-press " data-testid= "hero-get-started ">
                    Get Started
                    <ArrowRight className= "ml-2 h-5 w-5 " />
                  </Button>
                </Link>
                <Link to= "/parts ">
                  <Button size= "lg " variant= "outline " className= "border-zinc-700 hover:bg-zinc-800 " data-testid= "hero-browse-parts ">
                    Browse Parts
                  </Button>
                </Link>
              </div>
              <div className= "flex items-center gap-6 text-sm text-zinc-400 ">
                <div className= "flex items-center gap-2 ">
                  <CheckCircle2 className= "h-4 w-4 text-green-500 " />
                  Free to join
                </div>
                <div className= "flex items-center gap-2 ">
                  <CheckCircle2 className= "h-4 w-4 text-green-500 " />
                  Secure payments
                </div>
                <div className= "flex items-center gap-2 ">
                  <CheckCircle2 className= "h-4 w-4 text-green-500 " />
                  Fast delivery
                </div>
              </div>
            </div>
            <div className= "relative hidden lg:block ">
              <div className= "absolute inset-0 bg-gradient-to-br from-amber-500/20 to-blue-500/20 rounded-lg blur-3xl " />
              <img
                src= "https://images.pexels.com/photos/4488643/pexels-photo-4488643.jpeg "
                alt= "Mechanic working "
                className= "relative rounded-lg border border-zinc-800 shadow-2xl "
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className= "border-y border-zinc-800 bg-zinc-900/50 ">
        <div className= "container mx-auto px-4 py-12 ">
          <div className= "grid grid-cols-2 md:grid-cols-4 gap-8 ">
            {stats.map((stat) => (
              <div key={stat.label} className= "text-center ">
                <div className= "text-3xl md:text-4xl font-black text-amber-500 font-mono ">{stat.value}</div>
                <div className= "text-sm text-zinc-400 mt-1 uppercase tracking-widest ">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className= "py-20 ">
        <div className= "container mx-auto px-4 ">
          <div className= "text-center mb-16 ">
            <h2 className= "text-3xl md:text-4xl font-black mb-4 ">Why Choose SpareParts Hub?</h2>
            <p className= "text-zinc-400 max-w-2xl mx-auto ">
              We connect auto mechanics with spare parts vendors, making it easier than ever to source parts quickly.
            </p>
          </div>
          <div className= "grid md:grid-cols-2 lg:grid-cols-4 gap-6 ">
            {features.map((feature) => (
              <Card key={feature.title} className= "bg-zinc-900/50 border-zinc-800 p-6 card-hover ">
                <feature.icon className= "h-10 w-10 text-amber-500 mb-4 " />
                <h3 className= "text-lg font-bold mb-2 ">{feature.title}</h3>
                <p className= "text-sm text-zinc-400 ">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className= "py-20 bg-zinc-900/50 border-y border-zinc-800 ">
        <div className= "container mx-auto px-4 ">
          <div className= "text-center mb-16 ">
            <h2 className= "text-3xl md:text-4xl font-black mb-4 ">How It Works</h2>
          </div>
          <div className= "grid md:grid-cols-3 gap-8 ">
            {[
              { step: '01', title: 'Search Parts', desc: 'Browse or search for the spare parts you need from multiple vendors.' },
              { step: '02', title: 'Place Order', desc: 'Add to cart, checkout, and pay securely with Paystack.' },
              { step: '03', title: 'Track Delivery', desc: 'Watch your dispatcher in real-time as they bring your parts.' },
            ].map((item) => (
              <div key={item.step} className= "relative ">
                <div className= "text-6xl font-black text-zinc-800 mb-4 font-mono ">{item.step}</div>
                <h3 className= "text-xl font-bold mb-2 ">{item.title}</h3>
                <p className= "text-zinc-400 ">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className= "py-20 ">
        <div className= "container mx-auto px-4 ">
          <Card className= "bg-gradient-to-br from-amber-500/10 to-blue-500/10 border-zinc-800 p-8 md:p-12 ">
            <div className= "text-center max-w-2xl mx-auto ">
              <h2 className= "text-3xl md:text-4xl font-black mb-4 ">Ready to Get Started?</h2>
              <p className= "text-zinc-400 mb-8 ">
                Join hundreds of mechanics and vendors already using SpareParts Hub in Port Harcourt.
              </p>
              <div className= "flex flex-col sm:flex-row gap-4 justify-center ">
                <Link to= "/register?role=client ">
                  <Button size= "lg " className= "bg-amber-500 text-black hover:bg-amber-400 font-bold btn-press w-full sm:w-auto " data-testid= "cta-mechanic ">
                    I'm a Mechanic
                  </Button>
                </Link>
                <Link to= "/register?role=vendor ">
                  <Button size= "lg " variant= "outline " className= "border-zinc-700 hover:bg-zinc-800 w-full sm:w-auto " data-testid= "cta-vendor ">
                    I'm a Vendor
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className= "border-t border-zinc-800 py-12 ">
        <div className= "container mx-auto px-4 ">
          <div className= "flex flex-col md:flex-row justify-between items-center gap-4 ">
            <div className= "flex items-center gap-2 ">
              <Package className= "h-6 w-6 text-amber-500 " />
              <span className= "font-bold ">SpareParts Hub</span>
            </div>
            <p className= "text-sm text-zinc-400 ">
              © 2024 SpareParts Hub. Port Harcourt, Nigeria.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
