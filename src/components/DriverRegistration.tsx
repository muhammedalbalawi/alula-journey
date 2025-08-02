import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Car, User, Mail, Phone, CreditCard, AlertCircle, CheckCircle, Palette } from 'lucide-react';

interface DriverRegistrationProps {
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  license_number: string;
  car_model: string;
  car_color: string;
  plate_number: string;
  driver_id: string;
}

interface FormErrors {
  [key: string]: string;
}

export function DriverRegistration({ onClose }: DriverRegistrationProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    car_model: '',
    car_color: '',
    plate_number: '',
    driver_id: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { toast } = useToast();

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Saudi phone number format: +966xxxxxxxxx or starting with 05
    const phoneRegex = /^(\+966|966|05)\d{8,9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validateLicenseNumber = (license: string): boolean => {
    // Basic validation - alphanumeric, 6-20 characters
    const licenseRegex = /^[A-Za-z0-9]{6,20}$/;
    return licenseRegex.test(license);
  };

  const validatePlateNumber = (plate: string): boolean => {
    // Saudi plate format: ABC-123 or ABC123 or 123ABC
    const plateRegex = /^[A-Za-z0-9]{3,10}[-]?[A-Za-z0-9]{1,6}$/;
    return plateRegex.test(plate.replace(/\s+/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validations
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.license_number.trim()) newErrors.license_number = 'License number is required';
    if (!formData.car_model.trim()) newErrors.car_model = 'Car model is required';
    if (!formData.car_color.trim()) newErrors.car_color = 'Car color is required';
    if (!formData.plate_number.trim()) newErrors.plate_number = 'Plate number is required';

    // Format validations
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Saudi phone number (+966xxxxxxxxx or 05xxxxxxxx)';
    }

    if (formData.license_number && !validateLicenseNumber(formData.license_number)) {
      newErrors.license_number = 'License number must be 6-20 alphanumeric characters';
    }

    if (formData.plate_number && !validatePlateNumber(formData.plate_number)) {
      newErrors.plate_number = 'Please enter a valid plate number format';
    }

    // Length validations
    if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (formData.name.length > 100) newErrors.name = 'Name must be less than 100 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Clear success message when editing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const checkExistingDriver = async (): Promise<boolean> => {
    try {
      const driverId = formData.driver_id || `DRV${Date.now()}`;
      
      const { data: existingDrivers, error } = await supabase
        .from('drivers')
        .select('driver_id, email, phone, license_number, plate_number')
        .or(`driver_id.eq.${driverId},email.eq.${formData.email},phone.eq.${formData.phone},license_number.eq.${formData.license_number},plate_number.eq.${formData.plate_number}`);

      if (error) {
        console.error('Error checking existing drivers:', error);
        return false;
      }

      const conflicts: FormErrors = {};
      existingDrivers?.forEach(driver => {
        if (driver.driver_id === driverId) conflicts.driver_id = 'Driver ID already exists';
        if (driver.email === formData.email) conflicts.email = 'Email already registered';
        if (driver.phone === formData.phone) conflicts.phone = 'Phone number already registered';
        if (driver.license_number === formData.license_number) conflicts.license_number = 'License number already registered';
        if (driver.plate_number === formData.plate_number) conflicts.plate_number = 'Plate number already registered';
      });

      if (Object.keys(conflicts).length > 0) {
        setErrors(conflicts);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return true; // Continue with registration if check fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      // Check for existing drivers
      const isUnique = await checkExistingDriver();
      if (!isUnique) {
        setIsSubmitting(false);
        toast({
          title: 'Registration Failed',
          description: 'Some information is already registered',
          variant: 'destructive'
        });
        return;
      }

      // Check current user is admin
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('Authentication required');
      }

      const { data: adminCheck, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.session.user.id)
        .eq('is_active', true)
        .single();

      if (adminError || !adminCheck) {
        throw new Error('Admin access required');
      }

      // Register the driver
      const driverData = {
        ...formData,
        driver_id: formData.driver_id || `DRV${Date.now()}`,
        created_by: session.session.user.id,
        status: 'available',
        rating: 0.0
      };

      const { data, error } = await supabase
        .from('drivers')
        .insert([driverData])
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        
        // Handle specific error types
        if (error.code === '42501') {
          throw new Error('Access denied. Admin privileges required.');
        } else if (error.code === '23505') {
          throw new Error('This information is already registered.');
        } else {
          throw new Error(error.message || 'Registration failed');
        }
      }

      setSuccessMessage('Driver registered successfully!');
      toast({
        title: 'Success!',
        description: `Driver ${formData.name} has been registered successfully`,
        variant: 'default'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        license_number: '',
        car_model: '',
        car_color: '',
        plate_number: '',
        driver_id: ''
      });

      // Close dialog after a delay
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('Error registering driver:', error);
      
      const errorMessage = error.message || 'Failed to register driver. Please try again.';
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      // Log detailed error for debugging
      console.error('Detailed error:', {
        error,
        formData,
        timestamp: new Date().toISOString()
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
        {successMessage && (
          <Alert className="border-green-200 bg-green-50 mb-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

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
                onChange={(e) => handleInputChange('driver_id', e.target.value)}
                className={errors.driver_id ? 'border-red-500' : ''}
              />
              {errors.driver_id && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.driver_id}
                </p>
              )}
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
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
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
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                required
                placeholder="+966501234567 or 0501234567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                required
                value={formData.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                className={errors.license_number ? 'border-red-500' : ''}
              />
              {errors.license_number && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.license_number}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="car_model">Car Model *</Label>
              <Input
                id="car_model"
                required
                placeholder="e.g., Toyota Camry 2023"
                value={formData.car_model}
                onChange={(e) => handleInputChange('car_model', e.target.value)}
                className={errors.car_model ? 'border-red-500' : ''}
              />
              {errors.car_model && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.car_model}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="car_color" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Car Color *
              </Label>
              <Select 
                value={formData.car_color} 
                onValueChange={(value) => handleInputChange('car_color', value)}
              >
                <SelectTrigger className={errors.car_color ? 'border-red-500' : ''}>
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
              {errors.car_color && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.car_color}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plate_number">Plate Number *</Label>
              <Input
                id="plate_number"
                required
                placeholder="e.g., ABC-1234"
                value={formData.plate_number}
                onChange={(e) => handleInputChange('plate_number', e.target.value)}
                className={errors.plate_number ? 'border-red-500' : ''}
              />
              {errors.plate_number && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.plate_number}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering...
                </div>
              ) : (
                'Register Driver'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}