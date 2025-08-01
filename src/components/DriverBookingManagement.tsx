import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface DriverBooking {
  id: string;
  tourist_id: string;
  driver_id: string | null;
  pickup_location: string;
  destination: string;
  booking_date: string;
  booking_time: string;
  status: string;
  special_requests: string | null;
  created_at: string;
  tourist_name?: string;
  tourist_phone?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_car?: string;
  driver_plate?: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  status: string;
  car_model: string;
  car_color: string;
  plate_number: string;
}

export const DriverBookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<DriverBooking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBookings = async () => {
    try {
      // First get all bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('driver_bookings' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Transform and enrich bookings with tourist and driver info
      const enrichedBookings = await Promise.all(
        (bookingsData || []).map(async (booking: any) => {
          // Get tourist info
          const { data: touristData } = await supabase
            .from('profiles')
            .select('full_name, contact_info')
            .eq('id', booking.tourist_id)
            .single();

          // Get driver info if assigned
          let driverData = null;
          if (booking.driver_id) {
            const { data } = await supabase
              .from('drivers')
              .select('name, phone, car_model, car_color, plate_number')
              .eq('id', booking.driver_id)
              .single();
            driverData = data;
          }

          return {
            ...booking,
            tourist_name: touristData?.full_name || 'Unknown',
            tourist_phone: touristData?.contact_info || '',
            driver_name: driverData?.name || '',
            driver_phone: driverData?.phone || '',
            driver_car: driverData ? `${driverData.car_color} ${driverData.car_model}` : '',
            driver_plate: driverData?.plate_number || ''
          };
        })
      );
      
      setBookings(enrichedBookings);
    } catch (error) {
      console.error('Error fetching driver bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch driver bookings',
        variant: 'destructive'
      });
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'available')
        .order('name');

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchDrivers();
  }, []);

  const handleAssignDriver = async (bookingId: string, driverId: string) => {
    try {
      const { error } = await supabase
        .from('driver_bookings' as any)
        .update({ 
          driver_id: driverId,
          status: 'assigned'
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Update driver status to busy
      await supabase
        .from('drivers')
        .update({ status: 'busy' })
        .eq('id', driverId);

      toast({
        title: 'Success',
        description: 'Driver assigned successfully'
      });
      
      fetchBookings();
      fetchDrivers();
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign driver',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('driver_bookings' as any)
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // If completing or canceling, make driver available again
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking?.driver_id) {
          await supabase
            .from('drivers')
            .update({ status: 'available' })
            .eq('id', booking.driver_id);
        }
      }

      toast({
        title: 'Success',
        description: 'Booking status updated successfully'
      });
      
      fetchBookings();
      fetchDrivers();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Pending</Badge>;
      case 'assigned':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Assigned</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'assigned':
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    assigned: bookings.filter(b => b.status === 'assigned').length,
    inProgress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Car className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Driver Booking Management</h2>
        <p className="text-muted-foreground">Manage and assign driver bookings</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Car className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Bookings</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
              <p className="text-xs text-muted-foreground">Assigned</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Driver Bookings ({bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground">No driver bookings have been made yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Details</TableHead>
                    <TableHead>Tourist</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">#{booking.id.slice(0, 8)}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                          </div>
                          {booking.special_requests && (
                            <div className="text-xs text-muted-foreground italic">
                              "{booking.special_requests}"
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {booking.tourist_name}
                          </div>
                          {booking.tourist_phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {booking.tourist_phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-green-600" />
                              <span className="font-medium">From:</span> {booking.pickup_location}
                            </div>
                          </div>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-600" />
                              <span className="font-medium">To:</span> {booking.destination}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {booking.booking_time}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {booking.driver_id ? (
                          <div className="space-y-1">
                            <div className="font-medium">{booking.driver_name}</div>
                            <div className="text-sm text-muted-foreground">{booking.driver_phone}</div>
                            <div className="text-xs text-muted-foreground">{booking.driver_car}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Not assigned</div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(booking.status)}
                          {getStatusBadge(booking.status)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-2">
                          {booking.status === 'pending' && (
                            <Select onValueChange={(driverId) => handleAssignDriver(booking.id, driverId)}>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Assign Driver" />
                              </SelectTrigger>
                              <SelectContent>
                                {drivers.map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id}>
                                    {driver.name} - {driver.car_model}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          {(booking.status === 'assigned' || booking.status === 'in_progress') && (
                            <div className="space-y-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(booking.id, 'in_progress')}
                                disabled={booking.status === 'in_progress'}
                              >
                                Start Trip
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleUpdateStatus(booking.id, 'completed')}
                              >
                                Complete
                              </Button>
                            </div>
                          )}
                          
                          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};