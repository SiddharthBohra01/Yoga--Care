import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Users, ExternalLink, Video, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { liveClassAPI } from '../api/services';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);

  const fetchClasses = async () => {
    try {
      const { data } = await liveClassAPI.getClasses();
      setClasses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleBook = async (classId) => {
    setBookingId(classId);
    try {
      const { data } = await liveClassAPI.bookClass(classId);
      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId
            ? { ...c, is_booked: data.booked, current_participants: data.current_participants }
            : c
        )
      );
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not complete booking');
    } finally {
      setBookingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative z-10">
            <p className="text-violet-200 text-xs sm:text-sm font-semibold uppercase tracking-wider">Group Wellness</p>
            <h1 className="text-2xl sm:text-4xl font-bold mt-1">Live Yoga Classes</h1>
            <p className="text-violet-100/90 mt-2 max-w-xl text-sm leading-relaxed">
              Connect in real-time with certified yoga trainers. Practice alongside other members of the YogaCare community.
            </p>
          </div>
        </div>

        {/* Classes list */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="skeleton h-64 rounded-2xl" />
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 text-slate-500 glass-card">
            No live classes scheduled currently.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {classes.map((cls) => {
              const startDate = new Date(cls.start_time);
              const formattedTime = startDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const isFull = cls.current_participants >= cls.max_participants;
              const fillPercent = (cls.current_participants / cls.max_participants) * 100;

              return (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`glass-card overflow-hidden flex flex-col justify-between border-2 ${cls.is_booked ? 'border-teal-500/40' : 'border-transparent'
                    }`}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                        {cls.title}
                      </h3>
                      {cls.is_booked && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Booked
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                      {cls.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-violet-500 shrink-0" />
                        <span>Trainer: <strong className="font-semibold">{cls.trainer_name}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-violet-500 shrink-0" />
                        <span className="truncate">{formattedTime}</span>
                      </div>
                    </div>

                    {/* Participant limits */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Enrolled</span>
                        <span>{cls.current_participants} / {cls.max_participants} slots</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-600 to-cyan-500"
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Booking actions */}
                  <div className="bg-slate-500/5 px-6 py-4 flex items-center justify-between gap-3">
                    {cls.is_booked ? (
                      <>
                        <a
                          href={cls.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Video className="w-4 h-4" /> Join Google Meet <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          disabled={bookingId === cls.id}
                          onClick={() => handleBook(cls.id)}
                          className="text-xs text-red-500 font-semibold hover:underline"
                        >
                          Cancel Booking
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleBook(cls.id)}
                        disabled={isFull || bookingId === cls.id}
                        className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all text-center ${isFull
                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg'
                          }`}
                      >
                        {bookingId === cls.id
                          ? 'Booking...'
                          : isFull
                            ? 'Class Full'
                            : 'Book Free Session'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
