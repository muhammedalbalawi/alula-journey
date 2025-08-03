
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Car } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export const DriverBooking: React.FC = () => {
  const { t } = useLanguage();
  const [showBooking, setShowBooking] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const handleBooking = async () => {
    if (!date || !time || !pickupLocation || !destination) {
      toast({
        title: t('error'),
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: t('error'),
          description: 'You must be logged in to book a driver',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('driver_bookings')
        .insert({
          tourist_id: user.id,
          pickup_location: pickupLocation,
          destination: destination,
          booking_date: date.toISOString().split('T')[0],
          booking_time: time,
          special_requests: specialRequest || null,
          status: 'pending'
        });

      if (error) throw error;

      setShowBooking(false);
      toast({
        title: t('success'),
        description: 'Driver booking request submitted successfully! Admin and guides will review your request.'
      });
      
      // Reset form
      setDate(undefined);
      setTime('');
      setPickupLocation('');
      setDestination('');
      setSpecialRequest('');
    } catch (error: any) {
      console.error('Error booking driver:', error);
      toast({
        title: t('error'),
        description: 'Failed to submit booking request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-desert">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
          <Car className="w-5 h-5" />
          <span>{t('bookDriver')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog open={showBooking} onOpenChange={setShowBooking}>
          <DialogTrigger asChild>
            <Button className="w-full flex items-center space-x-2 rtl:space-x-reverse">
              <Car className="w-4 h-4" />
              <span>{t('bookDriver')}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('bookDriver')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('selectDate')}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>{t('selectDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('selectTime')}</label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder={t('selectTime')} />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pickup Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pickup Location *</label>
                <Input
                  placeholder={t('pickupLocation')}
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  required
                />
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination *</label>
                <Input
                  placeholder="Enter destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              {/* Special Request */}
              <Textarea
                placeholder={t('specialRequest')}
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                className="min-h-[80px]"
              />

              <Button onClick={handleBooking} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : t('confirmBooking')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
