import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Music } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { contentAPI } from '../api/services';

export default function MeditationPage() {
  const [tracks, setTracks] = useState([]);
  const [playing, setPlaying] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    contentAPI.getMeditationTracks().then((r) => setTracks(r.data)).catch(() => {});
  }, []);

  const togglePlay = (track) => {
    if (playing === track.id) {
      audioRef.current?.pause();
      setPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play();
      }
      setPlaying(track.id);
    }
  };

  return (
    <DashboardLayout>
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Music className="text-violet-500" /> Meditation Music</h2>
        <p className="text-slate-500 mb-8">Relax and restore with curated ambient tracks</p>

        <div className="grid md:grid-cols-3 gap-6">
          {tracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card overflow-hidden"
            >
              <img src={track.cover} alt={track.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold">{track.title}</h3>
                <p className="text-sm text-slate-500">{track.duration}</p>
                <button
                  onClick={() => togglePlay(track)}
                  className="mt-4 w-full py-2 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center gap-2 hover:bg-violet-500/30 transition-colors"
                >
                  {playing === track.id ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
