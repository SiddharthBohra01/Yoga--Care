import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Image as ImageIcon, Sparkles, Share2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { communityAPI } from '../api/services';

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data } = await communityAPI.getPosts();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await communityAPI.createPost({ title, content, image_url: imageUrl || null });
      setTitle('');
      setContent('');
      setImageUrl('');
      fetchPosts();
    } catch (err) {
      alert('Could not publish post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await communityAPI.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked_by_me: data.liked, likes_count: data.likes_count }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;
    try {
      const { data } = await communityAPI.addComment(postId, text);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...p.comments, data.comment] }
            : p
        )
      );
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      alert('Could not submit comment');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 p-6 text-white shadow-lg">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 animate-pulse" /> Community Hub
              </h2>
              <p className="text-violet-100/90 text-sm mt-1">
                Share your journey, stay motivated, and earn XP together with other yogis!
              </p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center border border-white/10 shrink-0">
              <p className="text-xs uppercase font-medium">Rewards</p>
              <p className="text-sm font-semibold">+15 XP per share</p>
            </div>
          </div>
        </div>

        {/* Create post form */}
        <form onSubmit={handleCreatePost} className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-lg">Share Your Progress</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Give your story a title..."
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="What did you achieve today? Share tips or write about your yoga flow..."
              className="input-field min-h-[100px] py-3 resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-4 py-2 border border-violet-500/20 rounded-full text-violet-600 dark:text-violet-400 text-xs font-semibold cursor-pointer hover:bg-violet-500/5 transition-colors">
                <ImageIcon className="w-4 h-4" /> Add Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {imageUrl && (
                <div className="relative">
                  <img src={imageUrl} alt="preview" className="w-12 h-12 rounded object-cover border" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px]"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary py-2 px-5 text-sm"
            >
              {submitting ? 'Sharing...' : 'Share Flow'}
            </button>
          </div>
        </form>

        {/* Timeline Posts */}
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-48 rounded-2xl" />
            <div className="skeleton h-48 rounded-2xl" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white/30 dark:bg-slate-800/10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Share2 className="w-12 h-12 mx-auto text-slate-400 mb-2" />
            <p className="font-medium text-lg">No posts yet</p>
            <p className="text-sm">Be the first to share your yoga milestone with the community!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {/* Author block */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {post.author_name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100">{post.author_name}</h4>
                        <p className="text-[10px] text-slate-400">
                          {new Date(post.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-bold text-lg text-violet-600 dark:text-violet-400 mb-1">{post.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Post image */}
                    {post.image_url && (
                      <div className="rounded-xl overflow-hidden max-h-96 border dark:border-slate-700">
                        <img src={post.image_url} alt="post visual" className="w-full object-cover" />
                      </div>
                    )}

                    {/* Engagement bar */}
                    <div className="flex items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                          post.liked_by_me
                            ? 'text-red-500'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.liked_by_me ? 'fill-red-500' : ''}`} />
                        <span>{post.likes_count}</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold">
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments.length}</span>
                      </div>
                    </div>

                    {/* Comments list */}
                    {post.comments.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="bg-slate-500/5 rounded-xl p-3 text-sm space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                                {comment.author_name}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(comment.created_at).toLocaleDateString(undefined, {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-xs">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Write comment input */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="input-field py-2 text-xs"
                        value={commentText[post.id] || ''}
                        onChange={(e) =>
                          setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        className="px-3 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-600 dark:text-violet-300"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
