import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, Star } from 'lucide-react';
import { contentAPI } from '../../api/services';

const benefits = [
  { title: 'AI Personalization', desc: 'Plans tailored to your BMI, goals, and experience level.', icon: '🧠' },
  { title: '30-Day Challenge', desc: 'Progressive daily unlocks keep you motivated and consistent.', icon: '📅' },
  { title: 'Calorie Tracking', desc: 'Real-time burn estimates for every pose and session.', icon: '🔥' },
  { title: 'Mindful Recovery', desc: 'Meditation tracks and water intake for holistic wellness.', icon: '💧' },
];

const trainers = [
  { name: 'Anya Sharma', role: 'Vinyasa Expert', img: 'https://i.pravatar.cc/300?img=47' },
  { name: 'Marcus Lee', role: 'Strength Yoga', img: 'https://i.pravatar.cc/300?img=12' },
  { name: 'Sofia Rivera', role: 'Meditation Guide', img: 'https://i.pravatar.cc/300?img=32' },
];

const pricing = [
  { name: 'Free Trial', price: '$0', period: '30 days', features: ['Full 30-day plan', 'Calorie tracking', 'Water tracker', 'Basic meditation'], popular: false },
  { name: 'Premium', price: '$9.99', period: '/month', features: ['Everything in Free', 'AI plan updates', 'Achievement badges', 'Priority support', 'Share progress'], popular: true },
  { name: 'Annual', price: '$79', period: '/year', features: ['All Premium features', '2 months free', 'Exclusive workshops', '1-on-1 coaching session'], popular: false },
];

const faqs = [
  { q: 'How does the AI plan work?', a: 'Our algorithm analyzes your height, weight, BMI, fitness goals, and experience to generate a unique 30-day yoga sequence.' },
  { q: 'Can beginners use YogaCare?', a: 'Absolutely! Plans adapt to beginner, intermediate, and advanced levels with progressive difficulty.' },
  { q: 'Do I need equipment?', a: 'Just a yoga mat. Optional props like blocks can enhance certain poses.' },
  { q: 'Is there a mobile app?', a: 'Our web app is fully responsive and works beautifully on all devices.' },
];

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="section-padding">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold px-2">{title}</h2>
        {subtitle && <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-2">{subtitle}</p>}
      </motion.div>
      {children}
    </section>
  );
}

export function AboutSection() {
  return (
    <Section id="about" title="About YogaCare" subtitle="Premium yoga fitness inspired by the best workout apps">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.img
          whileInView={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: -30 }}
          viewport={{ once: true }}
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"
          alt="About"
          className="rounded-3xl shadow-2xl"
        />
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            YogaCare combines ancient yoga wisdom with modern AI technology. Our platform creates dynamic,
            personalized journeys that adapt to your body and goals — just like a premium home workout app.
          </p>
          <ul className="space-y-3">
            {['Glassmorphism premium UI', 'Smooth Framer Motion animations', 'Day-by-day progressive unlock', 'Real-time progress analytics'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center"><Check className="w-4 h-4 text-violet-500" /></span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </Section>
  );
}

export function BenefitsSection() {
  return (
    <Section id="benefits" title="Why Choose YogaCare" subtitle="Everything you need for a transformative yoga journey">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className="glass-card p-6 text-center"
          >
            <span className="text-4xl">{b.icon}</span>
            <h3 className="font-semibold mt-4">{b.title}</h3>
            <p className="text-sm text-slate-500 mt-2">{b.desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

export function TrainersSection() {
  return (
    <Section id="trainers" title="Expert Trainers" subtitle="Learn from world-class yoga instructors">
      <div className="grid md:grid-cols-3 gap-8">
        {trainers.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card overflow-hidden group"
          >
            <img src={t.img} alt={t.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="p-6">
              <h3 className="font-semibold text-lg">{t.name}</h3>
              <p className="text-violet-500 text-sm">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

export function PlansSection() {
  const navigate = useNavigate();
  return (
    <Section id="plans" title="Choose Your Plan" subtitle="Start your free 30-day trial today">
      <div className="grid md:grid-cols-3 gap-8">
        {pricing.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-5 sm:p-8 relative ${p.popular ? 'ring-2 ring-violet-500 md:scale-105' : ''}`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs rounded-full">
                Most Popular
              </span>
            )}
            <h3 className="font-semibold text-xl">{p.name}</h3>
            <p className="mt-4">
              <span className="text-4xl font-bold">{p.price}</span>
              <span className="text-slate-500">{p.period}</span>
            </p>
            <ul className="mt-6 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-teal-500" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/signup')} className={`w-full mt-8 py-3 rounded-full font-semibold ${p.popular ? 'btn-primary' : 'btn-secondary'}`}>
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    contentAPI.getReviews().then((res) => setReviews(res.data)).catch(() => {});
  }, []);

  const fallback = [
    { author_name: 'Sarah M.', content: 'Best yoga app experience on web!', rating: 5 },
    { author_name: 'James C.', content: 'The 30-day challenge changed my life.', rating: 5 },
  ];

  const display = reviews.length ? reviews : fallback;

  return (
    <Section id="reviews" title="Loved by Thousands" subtitle="Real stories from our community">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {display.slice(0, 4).map((r, i) => (
          <motion.div
            key={r.id || i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex gap-1 mb-4">
              {[...Array(r.rating || 5)].map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">&ldquo;{r.content}&rdquo;</p>
            <div className="flex items-center gap-3 mt-4">
              <img src={r.avatar_url || `https://i.pravatar.cc/80?img=${i + 10}`} alt="" className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold text-sm">{r.author_name}</p>
                <p className="text-xs text-slate-500">{r.author_role || 'Member'}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

export function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <Section id="faq" title="FAQ" subtitle="Common questions answered">
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((f, i) => (
          <motion.div key={i} className="glass-card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-medium"
            >
              {f.q}
              <ChevronDown className={`w-5 h-5 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && (
              <motion.p initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-6 pb-4 text-slate-600 dark:text-slate-400 text-sm">
                {f.a}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

export function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contentAPI.submitFeedback(form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      alert('Failed to send. Please try again.');
    }
  };

  return (
    <Section id="contact" title="Get In Touch" subtitle="We'd love to hear from you">
      <div className="max-w-xl mx-auto glass-card p-8">
        {sent ? (
          <p className="text-center text-teal-500 font-medium">Thank you! We&apos;ll get back to you soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="input-field" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            <textarea className="input-field min-h-[120px]" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            <button type="submit" className="btn-primary w-full">Send Message</button>
          </form>
        )}
      </div>
    </Section>
  );
}
