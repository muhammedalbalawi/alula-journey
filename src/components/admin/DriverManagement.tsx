import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DriverRegistration } from '../DriverRegistration';
import { DriverBookingManagement } from '../DriverBookingManagement';
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Users,
  Star,
  Phone,
  Mail,
  CreditCard
} from 'lucide-react';

interface Driver {
  id: string;
  driver_id: string;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  car_model: string;
  car_color: string;
  plate_number: string;
  status: string;
  rating: number;
  created_at: string;
}

export const DriverManagement: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const { toast } = useToast();

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch drivers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Driver deleted successfully'
      });
      
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete driver',
        variant: 'destructive'
      });
    }
  };

  const handleStatusChange = async (driverId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ status: newStatus })
        .eq('id', driverId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Driver status updated successfully'
      });
      
      fetchDrivers();
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update driver status',
        variant: 'destructive'
      });
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.driver_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>;
      case 'busy':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Busy</Badge>;
      case 'offline':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Offline</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: drivers.length,
    available: drivers.filter(d => d.status === 'available').length,
    busy: drivers.filter(d => d.status === 'busy').length,
    offline: drivers.filter(d => d.status === 'offline').length,
    avgRating: drivers.length > 0 ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1) : '0.0'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Car className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Driver Management</h2>
          <p className="text-muted-foreground">Manage drivers and transportation services</p>
        </div>
        
        <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Driver</DialogTitle>
            </DialogHeader>
            <DriverRegistration onClose={() => {
              setIsRegistrationOpen(false);
              fetchDrivers();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Drivers</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.busy}</div>
              <p className="text-xs text-muted-foreground">Busy</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.offline}</div>
              <p className="text-xs text-muted-foreground">Offline</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.avgRating}</div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Drivers ({filteredDrivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No drivers found</h3>
              <p className="text-muted-foreground mb-4">
                {drivers.length === 0 
                  ? "No drivers have been registered yet." 
                  : "No drivers match your current filters."}
              </p>
              {drivers.length === 0 && (
                <Button onClick={() => setIsRegistrationOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Register First Driver
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver Info</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {driver.driver_id}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            License: {driver.license_number}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {driver.email}
                          </div>
                          <div className="text-sm flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {driver.phone}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium">{driver.car_model}</div>
                          <div className="text-sm text-muted-foreground">
                            {driver.car_color} • {driver.plate_number}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Select
                          value={driver.status}
                          onValueChange={(value) => handleStatusChange(driver.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="busy">Busy</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{driver.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingDriver(driver)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteDriver(driver.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
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

      {/* Driver Booking Management */}
      <DriverBookingManagement />
    </div>
  );
};