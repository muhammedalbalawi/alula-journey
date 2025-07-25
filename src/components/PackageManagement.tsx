import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Edit, Trash2, Users, Clock, DollarSign } from 'lucide-react';

interface PackageData {
  id?: string;
  package_name: string;
  description: string;
  duration_hours: number;
  price: number;
  included_activities: string[];
  max_participants: number;
  difficulty_level: string;
  status: string;
}

export function PackageManagement() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [formData, setFormData] = useState<PackageData>({
    package_name: '',
    description: '',
    duration_hours: 4,
    price: 0,
    included_activities: [],
    max_participants: 10,
    difficulty_level: 'easy',
    status: 'active'
  });
  const [newActivity, setNewActivity] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
    setupRealtimeUpdates();
  }, []);

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel('packages-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'packages' 
      }, () => {
        console.log('Package updated');
        fetchPackages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPackage) {
        const { data, error } = await supabase
          .from('packages')
          .update(formData)
          .eq('id', editingPackage.id)
          .select();
        
        if (error) throw error;
        toast({ title: "Package updated successfully" });
      } else {
        const { data, error } = await supabase
          .from('packages')
          .insert([{
            ...formData,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }])
          .select();
        
        if (error) throw error;
        toast({ title: "Package created successfully" });
      }

      setIsFormOpen(false);
      setEditingPackage(null);
      resetForm();
      // Don't need to call fetchPackages here since real-time will handle it
    } catch (error: any) {
      console.error('Error adding package:', error);
      toast({
        title: "Error saving package",
        description: error.message || 'Failed to save package. Please try again.',
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Package deleted successfully" });
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error deleting package",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      package_name: '',
      description: '',
      duration_hours: 4,
      price: 0,
      included_activities: [],
      max_participants: 10,
      difficulty_level: 'easy',
      status: 'active'
    });
  };

  const addActivity = () => {
    if (newActivity.trim()) {
      setFormData(prev => ({
        ...prev,
        included_activities: [...prev.included_activities, newActivity.trim()]
      }));
      setNewActivity('');
    }
  };

  const removeActivity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      included_activities: prev.included_activities.filter((_, i) => i !== index)
    }));
  };

  const startEdit = (pkg: PackageData) => {
    setEditingPackage(pkg);
    setFormData(pkg);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
          <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="hidden sm:inline">Tour Packages Management</span>
          <span className="sm:hidden">Packages</span>
        </h2>
        <Button 
          onClick={() => setIsFormOpen(true)} 
          className="flex items-center gap-2 w-full sm:w-auto"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add New Package</span>
          <span className="sm:hidden">Add Package</span>
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPackage ? 'Edit Package' : 'Create New Package'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="package_name" className="text-sm">Package Name *</Label>
                  <Input
                    id="package_name"
                    required
                    value={formData.package_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, package_name: e.target.value }))}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty_level" className="text-sm">Difficulty Level</Label>
                  <Select 
                    value={formData.difficulty_level}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: value }))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="challenging">Challenging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_hours" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duration (Hours)
                  </Label>
                  <Input
                    id="duration_hours"
                    type="number"
                    min="1"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price (SAR)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_participants" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Max Participants
                  </Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="1"
                    value={formData.max_participants}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Included Activities</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add activity..."
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity())}
                  />
                  <Button type="button" onClick={addActivity}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.included_activities.map((activity, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      {activity}
                      <button
                        type="button"
                        onClick={() => removeActivity(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingPackage(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold truncate">{pkg.package_name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => startEdit(pkg)}
                    className="flex-1 sm:flex-none"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="ml-1 sm:hidden">Edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(pkg.id!)}
                    className="text-red-500 hover:text-red-700 flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="ml-1 sm:hidden">Delete</span>
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex justify-between sm:block">
                  <span className="font-medium">Duration:</span> 
                  <span>{pkg.duration_hours}h</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="font-medium">Price:</span> 
                  <span>{pkg.price} SAR</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="font-medium">Max Participants:</span> 
                  <span>{pkg.max_participants}</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="font-medium sm:hidden">Status:</span>
                  <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {pkg.status}
                  </Badge>
                </div>
              </div>
              
              {pkg.included_activities.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <span className="font-medium text-xs sm:text-sm">Included Activities:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pkg.included_activities.map((activity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}