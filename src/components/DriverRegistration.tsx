import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Car, User, Phone, Mail, CreditCard, Palette } from 'lucide-react';

interface DriverRegistrationProps {
  onClose: () => void;
}

export function DriverRegistration({ onClose }: DriverRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    car_model: '',
    car_color: '',
    plate_number: '',
    driver_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('drivers')
        .insert([{
          ...formData,
          driver_id: formData.driver_id || `DRV${Date.now()}`
        }]);

      if (error) throw error;

      toast({
        title: "Driver Registered Successfully",
        description: "The driver has been added to the system.",
      });

      onClose();
    } catch (error) {
      console.error('Error registering driver:', error);
      toast({
        title: "Registration Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5" />
          Register New Driver
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driver_id" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Driver ID
              </Label>
              <Input
                id="driver_id"
                placeholder="Auto-generated if empty"
                value={formData.driver_id}
                onChange={(e) => setFormData(prev => ({ ...prev, driver_id: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                required
                value={formData.license_number}
                onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="car_model">Car Model *</Label>
              <Input
                id="car_model"
                required
                placeholder="e.g., Toyota Camry 2023"
                value={formData.car_model}
                onChange={(e) => setFormData(prev => ({ ...prev, car_model: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="car_color" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Car Color
              </Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, car_color: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gray">Gray</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="brown">Brown</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plate_number">Plate Number *</Label>
              <Input
                id="plate_number"
                required
                placeholder="e.g., ABC-1234"
                value={formData.plate_number}
                onChange={(e) => setFormData(prev => ({ ...prev, plate_number: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Registering...' : 'Register Driver'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}