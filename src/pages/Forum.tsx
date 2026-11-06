import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ThumbsUp, Plus, Search, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function Forum() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (full_name, avatar_url),
          likes (user_id)
        `)
        .neq('type', 'admin_state')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) {
        setPosts(data.map(post => ({
          ...post,
          authorName: post.profiles?.full_name || 'Unknown',
          createdAt: post.created_at,
          upvotes: post.likes ? post.likes.length : 0,
          hasUpvoted: post.likes ? post.likes.some((l: any) => l.user_id === user?.id) : false,
          category: post.tags && post.tags.length > 0 ? post.tags[0] : 'General'
        })));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!user || !profile || !newPost.title || !newPost.content) return;
    try {
      const { error } = await supabase
        .from('posts')
        .insert([{
          author_id: user.id,
          title: newPost.title,
          content: newPost.content,
          tags: [newPost.category],
          type: 'post'
        }]);
        
      if (error) throw error;
      
      setIsComposing(false);
      setNewPost({ title: '', content: '', category: 'General' });
      fetchPosts();
    } catch (error: any) {
      console.error("Error creating post:", error);
    }
  };

  const handleUpvote = async (postId: string, currentUpvotes: number, hasUpvoted: boolean) => {
    if (!user) return;
    try {
      if (hasUpvoted) {
        // Optimistically remove upvote
        setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: Math.max(0, currentUpvotes - 1), hasUpvoted: false } : p));
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) {
          setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: currentUpvotes, hasUpvoted: true } : p));
          throw error;
        }
      } else {
        // Optimistically add upvote
        setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: currentUpvotes + 1, hasUpvoted: true } : p));
        const { error } = await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: user.id }]);
        if (error) {
          setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: currentUpvotes, hasUpvoted: false } : p));
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error toggling upvote:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">Community Forum</h1>
          <p className="text-gray-600 text-sm sm:text-base">Discuss ideas, share resources, and collaborate.</p>
        </div>
        <button 
          onClick={() => setIsComposing(true)}
          className="bg-[#ff4e00] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e64600] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#ff4e00]/20 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          New Discussion
        </button>
      </div>

      {isComposing && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6 sm:mb-8"
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4">Start a Discussion</h2>
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Discussion Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full px-4 py-3 bg-[#f5f5f0] border-transparent focus:border-[#ff4e00] focus:ring-0 rounded-xl transition-colors text-sm sm:text-base"
            />
            <select 
              value={newPost.category}
              onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
              className="w-full px-4 py-3 bg-[#f5f5f0] border-transparent focus:border-[#ff4e00] focus:ring-0 rounded-xl transition-colors text-sm sm:text-base"
            >
              <option value="General">General</option>
              <option value="Leadership">Leadership</option>
              <option value="AI & Tech">AI & Tech</option>
              <option value="Policy">Policy</option>
            </select>
            <textarea 
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-[#f5f5f0] border-transparent focus:border-[#ff4e00] focus:ring-0 rounded-xl transition-colors resize-none text-sm sm:text-base"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsComposing(false)}
                className="px-4 sm:px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePost}
                disabled={!newPost.title || !newPost.content}
                className="px-4 sm:px-6 py-2 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                Post
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading discussions...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-gray-100">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No discussions yet. Be the first to start one!</p>
          </div>
        ) : (
          posts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{post.authorName}</span>
                    <span className="text-gray-400 text-xs sm:text-sm hidden sm:inline">•</span>
                    <span className="text-gray-500 text-xs sm:text-sm w-full sm:w-auto">
                      {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif mb-2">{post.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                  
                  <div className="flex items-center gap-4 sm:gap-6">
                    <button 
                      onClick={() => handleUpvote(post.id, post.upvotes, !!post.hasUpvoted)}
                      className={`flex items-center gap-2 transition-colors ${post.hasUpvoted ? 'text-[#ff4e00]' : 'text-gray-500 hover:text-[#ff4e00]'}`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${post.hasUpvoted ? 'fill-current' : ''}`} />
                      <span className="font-medium text-sm sm:text-base">{post.upvotes}</span>
                    </button>
                    <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
