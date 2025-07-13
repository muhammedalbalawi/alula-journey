import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      id: 'T002',
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      phone: '+1234567890',
      nationality: 'United States',
      status: 'pending'
    },
    {
      id: 'T003',
      name: 'Mohammed Hassan',
      email: 'mohammed@email.com',
      phone: '+966509876543',
      nationality: 'Saudi Arabia',
      status: 'assigned',
      assignedGuide: 'G002'
    },
    {
      id: 'T004',
      name: 'Emily Davis',
      email: 'emily@email.com',
      phone: '+447123456789',
      nationality: 'United Kingdom',
      status: 'pending'
    }
  ]);

  const [guides] = useState<Guide[]>([
    {
      id: 'G001',
      name: 'Khalid Al-Otaibi',
      email: 'khalid@guides.sa',
      phone: '+966551234567',
      rating: 4.8,
      specializations: ['Heritage Sites', 'Desert Adventures'],
      status: 'busy'
    },
    {
      id: 'G002',
      name: 'Fatima Al-Zahra',
      email: 'fatima@guides.sa',
      phone: '+966559876543',
      rating: 4.9,
      specializations: ['Cultural Tours', 'Photography'],
      status: 'busy'
    },
    {
      id: 'G003',
      name: 'Omar Abdullah',
      email: 'omar@guides.sa',
      phone: '+966558765432',
      rating: 4.6,
      specializations: ['Adventure Tours', 'Rock Climbing'],
      status: 'available'
    },
    {
      id: 'G004',
      name: 'Nora Al-Mansouri',
      email: 'nora@guides.sa',
      phone: '+966557654321',
      rating: 4.7,
      specializations: ['History', 'Art & Culture'],
      status: 'available'
    }
  ]);

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

        {/* Guides List */}
        <Card>
          <CardHeader>
            <CardTitle>Tour Guides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guides.map((guide) => (
                <div key={guide.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{guide.name}</h4>
                      <p className="text-sm text-muted-foreground">{guide.email}</p>
                      <p className="text-sm text-muted-foreground">{guide.phone}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-sm">⭐ {guide.rating}</span>
                      </div>
                    </div>
                    {getStatusBadge(guide.status)}
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};