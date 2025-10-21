'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Reply, MoreVertical, 
  ThumbsUp, ThumbsDown, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { enhancedToast } from '@/components/ui/enhanced-toast';

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: 'instructor' | 'learner';
  };
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  replies: Comment[];
  isEdited: boolean;
  editedAt?: string;
}

interface CommentsSectionProps {
  // courseId: string;
  // lessonId?: string;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  onDislikeComment: (commentId: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  // onDeleteComment: (commentId: string) => Promise<void>;
  // onReportComment: (commentId: string, reason: string) => Promise<void>;
  className?: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  // courseId,
  // lessonId,
  comments,
  onAddComment,
  onLikeComment,
  onDislikeComment,
  onEditComment,
  // onDeleteComment,
  // onReportComment,
  className
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());

  const sortedComments = useMemo(() => {
    const sorted = [...comments];
    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      case 'popular':
        return sorted.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
      default:
        return sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }, [comments, sortBy]);

  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim()) return;
    
    try {
      await onAddComment(newComment, replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
      enhancedToast.success('Comment added successfully!');
    } catch {
      enhancedToast.error('Failed to add comment. Please try again.');
    }
  }, [newComment, replyingTo, onAddComment]);

  const handleLike = useCallback(async (commentId: string) => {
    try {
      await onLikeComment(commentId);
    } catch {
      enhancedToast.error('Failed to like comment.');
    }
  }, [onLikeComment]);

  const handleDislike = useCallback(async (commentId: string) => {
    try {
      await onDislikeComment(commentId);
    } catch {
      enhancedToast.error('Failed to dislike comment.');
    }
  }, [onDislikeComment]);

  // const handleEdit = useCallback((comment: Comment) => {
  //   setEditingComment(comment.id);
  //   setEditContent(comment.content);
  // }, []);

  const handleSaveEdit = useCallback(async (commentId: string) => {
    if (!editContent.trim()) return;
    
    try {
      await onEditComment(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
      enhancedToast.success('Comment updated successfully!');
    } catch {
      enhancedToast.error('Failed to update comment.');
    }
  }, [editContent, onEditComment]);

  // const handleDelete = useCallback(async (commentId: string) => {
  //   try {
  //     await onDeleteComment(commentId);
  //     enhancedToast.success('Comment deleted successfully!');
  //   } catch {
  //     enhancedToast.error('Failed to delete comment.');
  //   }
  // }, [onDeleteComment]);

  const toggleReplies = useCallback((commentId: string) => {
    setShowReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  }, []);

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn('mb-4', isReply && 'ml-8')}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.avatar} />
              <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-sm">{comment.author.name}</span>
                {comment.author.role === 'instructor' && (
                  <Badge variant="secondary" className="text-xs">Instructor</Badge>
                )}
                <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-400">(edited)</span>
                )}
              </div>
              
              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleSaveEdit(comment.id)}>
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingComment(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {comment.content}
                </p>
              )}
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(comment.id)}
                  className={cn(
                    'flex items-center space-x-1 text-xs',
                    comment.isLiked && 'text-blue-600'
                  )}
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span>{comment.likes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDislike(comment.id)}
                  className={cn(
                    'flex items-center space-x-1 text-xs',
                    comment.isDisliked && 'text-red-600'
                  )}
                >
                  <ThumbsDown className="h-3 w-3" />
                  <span>{comment.dislikes}</span>
                </Button>
                
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <Reply className="h-3 w-3" />
                    <span>Reply</span>
                  </Button>
                )}
                
                {comment.replies.length > 0 && !isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplies(comment.id)}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>{comment.replies.length} replies</span>
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" className="p-1">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Replies */}
              <AnimatePresence>
                {showReplies.has(comment.id) && comment.replies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-2"
                  >
                    {comment.replies.map((reply) => (
                      <CommentItem key={reply.id} comment={reply} isReply />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Comments & Discussion</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Add Comment */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder={replyingTo ? "Write a reply..." : "Share your thoughts..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] mb-2"
              />
              <div className="flex justify-end space-x-2">
                {replyingTo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-4 w-4 mr-1" />
                  {replyingTo ? 'Reply' : 'Comment'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommentsSection;
