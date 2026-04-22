import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { Reveal } from './Reveal';

// Page Imports
import HomePage from './pages/Home';
import EventsPage from './pages/Events';
import GalleryPage from './pages/Gallery';
import PricingPage from './pages/Pricing';
import TipsPage from './pages/Tips';
import ReservationPage from './pages/Reservation';
import AdminPage from './pages/Admin';

// --- HELPERS ---
import Logo from './components/Logo';

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
    { label: 'Akce', path: '/akce' },
    { label: 'Galerie', path: '/galerie' },
    { label: 'Ceník', path: '/cenik' },
    { label: 'Tipy na výlety', path: '/tipy' },
    { label: 'Rezervace', path: '/rezervace' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname === path;
  };

  const isHome = location.pathname === '/';
  
  const navClasses = isScrolled || !isHome 
    ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100 py-3 text-black' 
    : 'bg-transparent py-6 text-white';

  const logoColor = isScrolled || !isHome ? 'text-amber-900 font-bold' : 'text-white';
  const burgerColor = isScrolled || !isHome ? 'text-black' : 'text-white';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${navClasses}`}>
      <div className="w-full px-6 md:px-12 max-w-[1920px] mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-4 group">
              <Logo isScrolled={isScrolled} isHome={isHome} className="w-12 h-12 transition-transform duration-500 group-hover:scale-110" />
              <div className="flex flex-col">
                <span className={`font-serif text-lg md:text-xl tracking-[0.1em] leading-none uppercase transition-colors duration-500 ${logoColor}`}>
                  V SRDCI VINIC
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8 xl:space-x-12">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 relative group py-2 ${
                  isActive(link.path) 
                    ? 'text-amber-700' 
                    : (isScrolled || !isHome ? 'text-gray-600 hover:text-black' : 'text-gray-100 hover:text-white hover:scale-105')
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-amber-700 transition-all duration-300 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            ))}
            
            {/* Socials in Desktop Nav */}
            <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
               <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-600 transition-colors"><Facebook size={18} strokeWidth={1.5} /></a>
               <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-600 transition-colors"><Instagram size={18} strokeWidth={1.5} /></a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className={`${burgerColor} hover:text-amber-600 transition-colors shrink-0`}><Facebook size={20} strokeWidth={1.5} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className={`${burgerColor} hover:text-amber-600 transition-colors shrink-0`}><Instagram size={20} strokeWidth={1.5} /></a>
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
      <div className={`fixed inset-0 bg-white z-40 transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden flex flex-col pt-32 px-8 overflow-y-auto`}>
        <div className="flex flex-col space-y-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-2xl font-serif uppercase tracking-widest border-b border-gray-50 pb-4 ${
                  isActive(link.path) ? 'text-amber-700 font-bold' : 'text-black'
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
            <h3 className="text-2xl font-serif text-black mb-6 tracking-widest">V SRDCI VINIC</h3>
            <p className="text-gray-500 text-sm leading-7 font-light mb-6">
              Pronájem domu v soukromí.<br/>
              Mutěnice - Jihomoravský kraj.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-black transition-colors"><Facebook size={20} strokeWidth={1.5} /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-black transition-colors"><Instagram size={20} strokeWidth={1.5} /></a>
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
            <div className="space-y-4 text-sm font-light text-gray-600">
               <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">Rezervace</span>
                  <a href="tel:+420720114080" className="hover:text-black transition text-sm font-medium text-black">+420 720 114 080</a>
               </div>
            </div>
          </div>
          
          <div>
             <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-black">Email</h4>
             <div className="space-y-3">
               <a href="mailto:info@vsrdcivinic.cz" className="block text-sm text-gray-500 hover:text-black transition">
                  info@vsrdcivinic.cz
               </a>
             </div>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} V srdci vinic.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link to="/admin" className="hover:text-black transition-colors">Administrace</Link>
          </div>
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
            <Route path="/akce" element={<EventsPage />} />
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