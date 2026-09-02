import { Link } from 'react-router-dom';
import { Share2, Heart, Globe, Mail, MapPin, Phone } from 'lucide-react';
import Logo from '../common/Logo';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 sm:pt-16 pb-8 safe-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Premium AI-powered yoga fitness. Transform your body and mind with personalized 30-day plans.
            </p>
            <div className="flex gap-4 mt-6">
              {[Share2, Heart, Globe].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-full bg-white/10 hover:bg-violet-500/30 transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {['Home', 'About', 'Plans', 'Reviews', 'Contact'].map((l) => (
                <li key={l}><a href={`#${l.toLowerCase()}`} className="hover:text-violet-400 transition-colors">{l}</a></li>
              ))}
              <li><Link to="/login" className="hover:text-violet-400">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Programs</h4>
            <ul className="space-y-2 text-sm">
              <li>30-Day Challenge</li>
              <li>Weight Loss Flow</li>
              <li>Flexibility Master</li>
              <li>Meditation Series</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-violet-400" /> hello@yogacare.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-violet-400" /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-violet-400" /> San Francisco, CA</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} YogaCare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
