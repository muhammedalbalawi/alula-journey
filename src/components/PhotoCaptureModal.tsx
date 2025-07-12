import React, { useState, useRef } from 'react';
import { Camera, ImageIcon, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface PhotoCaptureModalProps {
  children: React.ReactNode;
}

export function PhotoCaptureModal({ children }: PhotoCaptureModalProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
    setOpen(false);
  };

  const handleGallerySelect = () => {
    galleryInputRef.current?.click();
    setOpen(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'gallery') => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: t('success'),
        description: source === 'camera' ? 'Photo captured successfully!' : 'Photo selected from gallery!'
      });
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">{t('capturePhoto')}</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </>
  );
}