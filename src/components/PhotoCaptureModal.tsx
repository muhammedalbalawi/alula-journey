import React, { useState, useRef } from 'react';
import { Camera, ImageIcon, Upload, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface PhotoCaptureModalProps {
  children: React.ReactNode;
}

export function PhotoCaptureModal({ children }: PhotoCaptureModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [shareWithWorld, setShareWithWorld] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const resetModal = () => {
    setSelectedPhoto(null);
    setComment('');
    setShareWithWorld(false);
    setShowCommentSection(false);
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleGallerySelect = () => {
    galleryInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'gallery') => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      setShowCommentSection(true);
    }
  };

  const handleSubmit = async () => {
    if (selectedPhoto && comment.trim()) {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Not authenticated');

        const fileExt = selectedPhoto.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.user.id}/${fileName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('tourist-photos')
          .upload(filePath, selectedPhoto);

        if (uploadError) throw uploadError;

        // Save photo metadata to database
        const { error: dbError } = await supabase
          .from('tourist_photos')
          .insert({
            user_id: user.user.id,
            file_path: filePath,
            file_name: selectedPhoto.name,
            file_size: selectedPhoto.size,
            content_type: selectedPhoto.type,
            caption: comment.trim(),
            share_with_world: shareWithWorld
          });

        if (dbError) throw dbError;

        toast({
          title: t('success'),
          description: 'Photo and comment saved successfully!'
        });
        setOpen(false);
        resetModal();
      } catch (error) {
        console.error('Error saving photo:', error);
        toast({
          title: 'Error',
          description: 'Failed to save photo and comment',
          variant: 'destructive'
        });
      }
    }
  };

  const handleBack = () => {
    setShowCommentSection(false);
    setSelectedPhoto(null);
  };

  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetModal();
    }
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'camera')}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'gallery')}
      />

      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">
              {showCommentSection ? 'Add Comment' : t('capturePhoto')}
            </DialogTitle>
          </DialogHeader>
          
          {showCommentSection ? (
            <div className="space-y-4 pt-4">
              {selectedPhoto && (
                <div className="space-y-3">
                  <img 
                    src={URL.createObjectURL(selectedPhoto)} 
                    alt="Selected photo" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Comment on your moment:</label>
                    <Textarea
                      placeholder="Share your thoughts about this moment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shareWithWorld"
                      checked={shareWithWorld}
                      onCheckedChange={(checked) => setShareWithWorld(checked as boolean)}
                    />
                    <label 
                      htmlFor="shareWithWorld" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t('shareWithWorld')}
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBack} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={handleSubmit} className="flex-1">
                      Save Moment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 pt-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCameraCapture}>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Take Photo</h3>
                    <p className="text-sm text-muted-foreground">Use your camera to capture a moment</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleGallerySelect}>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Choose from Gallery</h3>
                    <p className="text-sm text-muted-foreground">Select a photo from your album</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}