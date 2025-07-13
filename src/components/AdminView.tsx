import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Shield, 
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Edit,
  Save,
  X,
  MessageSquare,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Tourist {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  status: 'active' | 'pending' | 'assigned';
  assignedGuide?: string;
}

interface Guide {
  id: string;
  guide_id?: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  specializations: string[];
  status: 'available' | 'busy' | 'offline';
}

interface Assignment {
  id: string;
  touristId: string;
  guideId: string;
  tourName: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
}

interface GuideRequestAdmin {
  id: string;
  tourist_id: string;
  request_message: string;
  status: 'pending' | 'approved' | 'rejected';
  assigned_guide_id?: string;
  admin_response?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    contact_info: string;
    nationality: string;
    gender: string;
  };
  guides?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const AdminView: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const [tourists] = useState<Tourist[]>([
    {
      id: 'T001',
      name: 'Ahmed Al-Rashid',
      email: 'ahmed@email.com',
      phone: '+966501234567',
      nationality: 'Saudi Arabia',
      status: 'active',
      assignedGuide: 'G001'
    },
    {
      id: 'T003',
      name: 'Mohammed Hassan',
      email: 'mohammed@email.com',
      phone: '+966509876543',
      nationality: 'Saudi Arabia',
      status: 'assigned',
      assignedGuide: 'G002'
    }
  ]);

  const [guides, setGuides] = useState<Guide[]>([]);
  const [guideRequests, setGuideRequests] = useState<GuideRequestAdmin[]>([]);

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 'A001',
      touristId: 'T001',
      guideId: 'G001',
      tourName: 'Heritage Discovery Tour',
      startDate: '2024-07-15',
      endDate: '2024-07-17',
      status: 'active',
      createdAt: '2024-07-10T10:00:00Z'
    },
    {
      id: 'A002',
      touristId: 'T003',
      guideId: 'G002',
      tourName: 'Cultural Photography Tour',
      startDate: '2024-07-20',
      endDate: '2024-07-22',
      status: 'pending',
      createdAt: '2024-07-12T14:30:00Z'
    }
  ]);

  const [selectedTourist, setSelectedTourist] = useState('');
  const [selectedGuide, setSelectedGuide] = useState('');
  const [tourName, setTourName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // New guide form states
  const [newGuideName, setNewGuideName] = useState('');
  const [newGuideEmail, setNewGuideEmail] = useState('');
  const [newGuidePhone, setNewGuidePhone] = useState('');
  const [newGuideId, setNewGuideId] = useState('');
  const [newGuidePassword, setNewGuidePassword] = useState('');
  const [newGuideSpecializations, setNewGuideSpecializations] = useState('');
  const [newGuideStatus, setNewGuideStatus] = useState('available');
  const [isCreatingGuide, setIsCreatingGuide] = useState(false);

  // Edit guide states
  const [editingGuide, setEditingGuide] = useState<string | null>(null);
  const [editGuideData, setEditGuideData] = useState<any>(null);

  // Fetch guides from database
  useEffect(() => {
    if (isLoggedIn) {
      fetchGuides();
      fetchGuideRequests();
      setupRealtimeUpdates();
    }
  }, [isLoggedIn]);

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel('admin-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guide_requests'
        },
        () => {
          fetchGuideRequests();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guides'
        },
        () => {
          fetchGuides();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuides((data || []).map(item => ({
        ...item,
        status: item.status as 'available' | 'busy' | 'offline'
      })));
    } catch (error: any) {
      console.error('Error fetching guides:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch guides',
        variant: 'destructive'
      });
    }
  };

  const fetchGuideRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('guide_requests')
        .select(`
          *,
          profiles (
            full_name,
            contact_info,
            nationality,
            gender
          ),
          guides (
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuideRequests((data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      })));
    } catch (error: any) {
      console.error('Error fetching guide requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch guide requests',
        variant: 'destructive'
      });
    }
  };

  const handleLogin = () => {
    if (adminId === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      toast({
        title: 'Login Successful',
        description: 'Welcome to the Admin Dashboard!'
      });
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Try admin/admin123',
        variant: 'destructive'
      });
    }
  };

  const handleAssignGuide = () => {
    if (!selectedTourist || !selectedGuide || !tourName || !startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    const newAssignment: Assignment = {
      id: `A${Date.now()}`,
      touristId: selectedTourist,
      guideId: selectedGuide,
      tourName,
      startDate,
      endDate,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setAssignments(prev => [...prev, newAssignment]);

    // Reset form
    setSelectedTourist('');
    setSelectedGuide('');
    setTourName('');
    setStartDate('');
    setEndDate('');

    toast({
      title: 'Assignment Created',
      description: 'Tour guide has been assigned successfully!'
    });
  };

  const removeAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    toast({
      title: 'Assignment Removed',
      description: 'Assignment has been removed successfully.'
    });
  };

  const handleCreateGuide = async () => {
    if (!newGuideName || !newGuideEmail || !newGuidePhone || !newGuideId || !newGuidePassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsCreatingGuide(true);

    try {
      const specializations = newGuideSpecializations 
        ? newGuideSpecializations.split(',').map(s => s.trim()).filter(s => s)
        : [];

      const { data, error } = await supabase
        .from('guides')
        .insert([
          {
            guide_id: newGuideId,
            password: newGuidePassword,
            name: newGuideName,
            email: newGuideEmail,
            phone: newGuidePhone,
            specializations,
            status: newGuideStatus,
            rating: 0.0
          }
        ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Guide created successfully! Guide ID: ${newGuideId}`,
      });

      // Reset form
      setNewGuideName('');
      setNewGuideEmail('');
      setNewGuidePhone('');
      setNewGuideId('');
      setNewGuidePassword('');
      setNewGuideSpecializations('');
      setNewGuideStatus('available');

      // Refresh guides list
      fetchGuides();

    } catch (error: any) {
      console.error('Error creating guide:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create guide',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingGuide(false);
    }
  };

  const handleEditGuide = (guide: Guide) => {
    setEditingGuide(guide.id);
    setEditGuideData({ ...guide });
  };

  const handleSaveEdit = async () => {
    if (!editGuideData) return;

    try {
      const { error } = await supabase
        .from('guides')
        .update({
          name: editGuideData.name,
          email: editGuideData.email,
          phone: editGuideData.phone,
          specializations: editGuideData.specializations,
          status: editGuideData.status
        })
        .eq('id', editGuideData.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Guide updated successfully!'
      });

      setEditingGuide(null);
      setEditGuideData(null);
      fetchGuides();

    } catch (error: any) {
      console.error('Error updating guide:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update guide',
        variant: 'destructive'
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingGuide(null);
    setEditGuideData(null);
  };

  const handleRequestResponse = async (requestId: string, status: 'approved' | 'rejected', guideId?: string, response?: string) => {
    try {
      const updateData: any = {
        status,
        admin_response: response
      };

      if (status === 'approved' && guideId) {
        updateData.assigned_guide_id = guideId;
      }

      const { error } = await supabase
        .from('guide_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Request ${status} successfully!`,
      });

      fetchGuideRequests(); // Refresh the list
      fetchGuides(); // Also refresh guides to update their status
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request',
        variant: 'destructive'
      });
    }
  };

  const updateAssignmentStatus = (assignmentId: string, status: 'pending' | 'active' | 'completed') => {
    setAssignments(prev => prev.map(a => 
      a.id === assignmentId ? { ...a, status } : a
    ));
    toast({
      title: 'Status Updated',
      description: `Assignment status changed to ${status}.`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'busy':
        return <Badge className="bg-red-100 text-red-800">Busy</Badge>;
      case 'offline':
        return <Badge variant="outline">Offline</Badge>;
      case 'assigned':
        return <Badge className="bg-blue-100 text-blue-800">Assigned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTouristName = (touristId: string) => {
    return tourists.find(t => t.id === touristId)?.name || 'Unknown Tourist';
  };

  const getGuideName = (guideId: string) => {
    return guides.find(g => g.id === guideId)?.name || 'Unknown Guide';
  };

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card animate-bounce-in">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-600/30 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Login
            </CardTitle>
            <p className="text-muted-foreground">Access the administration panel</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="glass-effect transition-all duration-200 focus:shadow-glow"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="glass-effect transition-all duration-200 focus:shadow-glow"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full hover:shadow-glow transition-all duration-300"
              disabled={!adminId || !password}
            >
              Sign In
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Demo credentials: admin / admin123
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-blue-600/20">
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage tour guide assignments and monitor activities</p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tourists</p>
                <p className="text-xl font-semibold">{tourists.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Guides</p>
                <p className="text-xl font-semibold">{guides.filter(g => g.status === 'available').length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Assignments</p>
                <p className="text-xl font-semibold">{assignments.filter(a => a.status === 'pending').length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Tours</p>
                <p className="text-xl font-semibold">{assignments.filter(a => a.status === 'active').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assignment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Assign Tour Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Tourist</label>
                <Select value={selectedTourist} onValueChange={setSelectedTourist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tourist" />
                  </SelectTrigger>
                  <SelectContent>
                    {tourists.filter(t => t.status === 'pending').map((tourist) => (
                      <SelectItem key={tourist.id} value={tourist.id}>
                        {tourist.name} ({tourist.nationality})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Guide</label>
                <Select value={selectedGuide} onValueChange={setSelectedGuide}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a guide" />
                  </SelectTrigger>
                  <SelectContent>
                    {guides.filter(g => g.status === 'available').map((guide) => (
                      <SelectItem key={guide.id} value={guide.id}>
                        {guide.name} - ⭐ {guide.rating} ({guide.specializations.join(', ')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tour Name</label>
                <Input
                  placeholder="Enter tour name"
                  value={tourName}
                  onChange={(e) => setTourName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleAssignGuide} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </CardContent>
          </Card>

          {/* Current Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Current Assignments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{assignment.tourName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {getTouristName(assignment.touristId)} → {getGuideName(assignment.guideId)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.startDate} to {assignment.endDate}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(assignment.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {assignment.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => updateAssignmentStatus(assignment.id, 'active')}
                        >
                          Activate
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tourists List */}
        <Card>
          <CardHeader>
            <CardTitle>All Tourists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tourists.map((tourist) => (
                <div key={tourist.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{tourist.name}</h4>
                      <p className="text-sm text-muted-foreground">{tourist.email}</p>
                      <p className="text-sm text-muted-foreground">{tourist.phone}</p>
                      <p className="text-sm text-muted-foreground">{tourist.nationality}</p>
                    </div>
                    {getStatusBadge(tourist.status)}
                  </div>
                  {tourist.assignedGuide && (
                    <p className="text-sm text-blue-600">
                      Guide: {getGuideName(tourist.assignedGuide)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create New Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create New Tour Guide</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="Guide Name*" 
                value={newGuideName}
                onChange={(e) => setNewGuideName(e.target.value)}
              />
              <Input 
                placeholder="Guide ID*" 
                value={newGuideId}
                onChange={(e) => setNewGuideId(e.target.value)}
                className="font-mono"
              />
              <Input 
                placeholder="Email*" 
                type="email" 
                value={newGuideEmail}
                onChange={(e) => setNewGuideEmail(e.target.value)}
              />
              <Input 
                placeholder="Phone*" 
                value={newGuidePhone}
                onChange={(e) => setNewGuidePhone(e.target.value)}
              />
              <Input 
                placeholder="Password*" 
                type="password" 
                value={newGuidePassword}
                onChange={(e) => setNewGuidePassword(e.target.value)}
              />
              <Select value={newGuideStatus} onValueChange={setNewGuideStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              <div className="md:col-span-2">
                <Input 
                  placeholder="Specializations (comma separated)" 
                  value={newGuideSpecializations}
                  onChange={(e) => setNewGuideSpecializations(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateGuide} 
              className="w-full"
              disabled={isCreatingGuide}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreatingGuide ? 'Creating...' : 'Create Guide'}
            </Button>
          </CardContent>
        </Card>

        {/* Guides List */}
        <Card>
          <CardHeader>
            <CardTitle>Tour Guides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guides.map((guide) => (
                <div key={guide.id} className="border rounded-lg p-4">
                  {editingGuide === guide.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <Input
                        value={editGuideData?.name || ''}
                        onChange={(e) => setEditGuideData({...editGuideData, name: e.target.value})}
                        placeholder="Guide Name"
                      />
                      <Input
                        value={editGuideData?.email || ''}
                        onChange={(e) => setEditGuideData({...editGuideData, email: e.target.value})}
                        placeholder="Email"
                        type="email"
                      />
                      <Input
                        value={editGuideData?.phone || ''}
                        onChange={(e) => setEditGuideData({...editGuideData, phone: e.target.value})}
                        placeholder="Phone"
                      />
                      <Select 
                        value={editGuideData?.status || 'available'} 
                        onValueChange={(value) => setEditGuideData({...editGuideData, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={(editGuideData?.specializations || []).join(', ')}
                        onChange={(e) => setEditGuideData({
                          ...editGuideData, 
                          specializations: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        })}
                        placeholder="Specializations (comma separated)"
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                       <div className="flex items-start justify-between mb-2">
                         <div>
                           <h4 className="font-semibold">{guide.name}</h4>
                           {guide.guide_id && (
                             <p className="text-sm text-blue-600 font-mono">ID: {guide.guide_id}</p>
                           )}
                           <p className="text-sm text-muted-foreground">{guide.email}</p>
                           <p className="text-sm text-muted-foreground">{guide.phone}</p>
                           <div className="flex items-center space-x-1 mt-1">
                             <span className="text-sm">⭐ {guide.rating}</span>
                           </div>
                         </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(guide.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditGuide(guide)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Specializations:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {guide.specializations.map((spec, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Guide Requests Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Guide Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {guideRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No guide requests found.
                </p>
              ) : (
                guideRequests.map((request) => (
                  <Card key={request.id} className="border border-muted/50">
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-semibold">
                                {request.profiles?.full_name || 'Tourist'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Submitted: {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>Contact:</strong> {request.profiles?.contact_info || 'N/A'}</p>
                                <p><strong>Nationality:</strong> {request.profiles?.nationality || 'N/A'}</p>
                              </div>
                              <div>
                                <p><strong>Gender:</strong> {request.profiles?.gender || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          {request.status === 'pending' && (
                            <Badge variant="secondary" className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          {request.status === 'approved' && (
                            <Badge variant="default" className="bg-green-600 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                          {request.status === 'rejected' && (
                            <Badge variant="destructive" className="flex items-center">
                              <X className="w-3 h-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Request Message:</p>
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                            {request.request_message}
                          </p>
                        </div>

                        {request.status === 'approved' && request.guides && (
                          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                              Assigned Guide:
                            </p>
                            <div className="text-sm text-green-700 dark:text-green-300">
                              <p><strong>Name:</strong> {request.guides.name}</p>
                              <p><strong>Email:</strong> {request.guides.email}</p>
                              <p><strong>Phone:</strong> {request.guides.phone}</p>
                            </div>
                          </div>
                        )}

                        {request.admin_response && (
                          <div>
                            <p className="text-sm font-medium mb-1">Admin Response:</p>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                              {request.admin_response}
                            </p>
                          </div>
                        )}

                        {request.status === 'pending' && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t">
                            <Select
                              onValueChange={(guideId) => {
                                handleRequestResponse(request.id, 'approved', guideId, 'Guide assigned successfully!');
                              }}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Assign Guide" />
                              </SelectTrigger>
                              <SelectContent>
                                {guides.filter(g => g.status === 'available').map((guide) => (
                                  <SelectItem key={guide.id} value={guide.id}>
                                    {guide.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRequestResponse(request.id, 'rejected', undefined, 'Sorry, no guides available at this time.')}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};