import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FolderOpen, Edit2, Trash2, MessageCircle, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Photo {
  id: string;
  file_path: string;
  file_name: string;
  caption: string;
  location_name: string;
  created_at: string;
}

interface Comment {
  id: string;
  photo_id: string;
  comment_text: string;
  created_at: string;
}

export const TouristAlbum = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();
  const { language } = useLanguage();

  const isArabic = language === 'ar';

  const texts = {
    title: isArabic ? 'مجلد الصور' : 'Photo Folder',
    comments: isArabic ? 'التعليقات' : 'Comments',
    addComment: isArabic ? 'إضافة تعليق' : 'Add Comment',
    edit: isArabic ? 'تعديل' : 'Edit',
    delete: isArabic ? 'حذف' : 'Delete',
    save: isArabic ? 'حفظ' : 'Save',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    noPhotos: isArabic ? 'لا توجد صور بعد' : 'No photos yet',
    captureFirst: isArabic ? 'التقط أول لحظة لك!' : 'Capture your first moment!',
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('tourist_photos')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);

      // Fetch comments for all photos
      if (data && data.length > 0) {
        const photoIds = data.map(photo => photo.id);
        const { data: commentsData, error: commentsError } = await supabase
          .from('photo_comments')
          .select('*')
          .in('photo_id', photoIds)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        const commentsMap: Record<string, Comment[]> = {};
        commentsData?.forEach(comment => {
          if (!commentsMap[comment.photo_id]) {
            commentsMap[comment.photo_id] = [];
          }
          commentsMap[comment.photo_id].push(comment);
        });
        setComments(commentsMap);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive"
      });
    }
  };

  const getPhotoUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('tourist-photos')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const addComment = async (photoId: string) => {
    if (!newComment.trim()) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('photo_comments')
        .insert({
          photo_id: photoId,
          user_id: user.user.id,
          comment_text: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      fetchPhotos();
      toast({
        title: "Success",
        description: "Comment added successfully"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };

  const updateComment = async (commentId: string) => {
    if (!editCommentText.trim()) return;

    try {
      const { error } = await supabase
        .from('photo_comments')
        .update({ comment_text: editCommentText.trim() })
        .eq('id', commentId);

      if (error) throw error;

      setEditingComment(null);
      setEditCommentText('');
      fetchPhotos();
      toast({
        title: "Success",
        description: "Comment updated successfully"
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive"
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('photo_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      fetchPhotos();
      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
    }
  };

  const deletePhoto = async (photo: Photo) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('tourist-photos')
        .remove([photo.file_path]);

      if (storageError) throw storageError;

      // Delete from database (comments will be deleted by cascade)
      const { error: dbError } = await supabase
        .from('tourist_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      fetchPhotos();
      toast({
        title: "Success",
        description: "Photo deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            {texts.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Photos Grid */}
          {photos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{texts.noPhotos}</p>
              <p>{texts.captureFirst}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Dialog key={photo.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={getPhotoUrl(photo.file_path)}
                          alt={photo.caption || photo.file_name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                      <CardContent className="p-3">
                        {photo.caption && (
                          <p className="font-medium text-sm truncate">{photo.caption}</p>
                        )}
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          {photo.location_name && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{photo.location_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(photo.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {comments[photo.id] && comments[photo.id].length > 0 && (
                          <Badge variant="secondary" className="mt-2">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {comments[photo.id].length}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>{photo.caption || photo.file_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <img
                          src={getPhotoUrl(photo.file_path)}
                          alt={photo.caption || photo.file_name}
                          className="max-w-full max-h-96 object-contain rounded-lg"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          {photo.location_name && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {photo.location_name}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(photo.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePhoto(photo)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {texts.delete}
                        </Button>
                      </div>

                      {/* Comments Section */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          {texts.comments}
                        </h4>
                        
                        {/* Existing Comments */}
                        <div className="space-y-3 mb-4">
                          {comments[photo.id]?.map((comment) => (
                            <div key={comment.id} className="bg-muted/30 p-3 rounded-lg">
                              {editingComment === comment.id ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={editCommentText}
                                    onChange={(e) => setEditCommentText(e.target.value)}
                                    className="min-h-[60px]"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => updateComment(comment.id)}
                                    >
                                      {texts.save}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingComment(null);
                                        setEditCommentText('');
                                      }}
                                    >
                                      {texts.cancel}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-sm">{comment.comment_text}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setEditingComment(comment.id);
                                          setEditCommentText(comment.comment_text);
                                        }}
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => deleteComment(comment.id)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add New Comment */}
                        <div className="space-y-2">
                          <Textarea
                            placeholder={texts.addComment}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <Button
                            size="sm"
                            onClick={() => addComment(photo.id)}
                            disabled={!newComment.trim()}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {texts.addComment}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
