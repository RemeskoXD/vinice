import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { Reveal } from './Reveal';

// Page Imports
import HomePage from './pages/Home';
import GalleryPage from './pages/Gallery';
import PricingPage from './pages/Pricing';
import TipsPage from './pages/Tips';
import ReservationPage from './pages/Reservation';
import AdminPage from './pages/Admin';

// --- HELPERS ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- COMPONENTS ---

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'Domů', path: '/' },
    { label: 'Galerie', path: '/galerie' },
    { label: 'Ceník', path: '/cenik' },
    { label: 'Tipy na výlety', path: '/tipy' },
    { label: 'Rezervace', path: '/rezervace' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const isHome = location.pathname === '/';
  
  const navClasses = isScrolled || !isHome 
    ? 'bg-white border-b border-gray-100 py-4 text-black' 
    : 'bg-transparent py-8 text-white';

  const logoColor = isScrolled || !isHome ? 'text-black' : 'text-white';
  const burgerColor = isScrolled || !isHome ? 'text-black' : 'text-white';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${navClasses}`}>
      <div className="w-full px-6 md:px-12 max-w-[1920px] mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-4 group">
              <div className={`w-10 h-10 flex items-center justify-center font-serif text-xl border transition-all duration-500 ${isScrolled || !isHome ? 'border-amber-700 text-amber-700' : 'border-white text-white'}`}>V</div>
              <div className="flex flex-col">
                <span className={`font-serif text-xl tracking-[0.2em] leading-none uppercase ${logoColor}`}>
                  V SRDCI VINICE
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-12">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-300 relative group py-2 ${
                  isActive(link.path) 
                    ? 'text-amber-600' 
                    : (isScrolled || !isHome ? 'text-gray-500 hover:text-black' : 'text-gray-300 hover:text-white')
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 transition-colors ${burgerColor}`}
            >
              {isOpen ? <X size={24} className="text-black" /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-40 transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden flex flex-col pt-32 px-8`}>
        <div className="flex flex-col space-y-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-2xl font-light uppercase tracking-widest ${
                  isActive(link.path) ? 'text-amber-600' : 'text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-black pt-24 pb-12 border-t border-gray-100">
      <div className="w-full px-6 md:px-12 mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-gray-100 pb-16">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-serif text-black mb-6 tracking-widest">V SRDCI VINICE</h3>
            <p className="text-gray-500 text-sm leading-7 font-light mb-6">
              Ubytování v soukromí rodinného domu.<br/>
              Mutěnice - Jihomoravský kraj.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-black transition-colors"><Facebook size={20} strokeWidth={1.5} /></a>
              <a href="#" className="text-gray-400 hover:text-black transition-colors"><Instagram size={20} strokeWidth={1.5} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-black">Adresa</h4>
            <div className="flex items-start gap-4 mb-4">
               <p className="text-gray-500 font-light text-sm leading-relaxed">
                 Vinařská 1264<br />
                 696 11 Mutěnice
               </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-black">Kontakt</h4>
            <div className="space-y-4">
               <div className="flex flex-col">
                  <a href="tel:+420123456789" className="text-gray-600 hover:text-black transition text-sm">Rezervace: <br/><span className="text-black">+420 123 456 789</span></a>
               </div>
            </div>
          </div>
          
          <div>
             <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-black">Email</h4>
             <div className="space-y-3">
               <a href="mailto:info@vsrdcivinice.cz" className="block text-sm text-gray-500 hover:text-black transition">
                  info@vsrdcivinice.cz
               </a>
             </div>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          <p>&copy; 2024 V srdci vinice.</p>
          <Link to="/admin" className="hover:text-black transition-colors">Administrace</Link>
        </div>
      </div>
    </footer>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-white font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/galerie" element={<GalleryPage />} />
            <Route path="/cenik" element={<PricingPage />} />
            <Route path="/tipy" element={<TipsPage />} />
            <Route path="/rezervace" element={<ReservationPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;