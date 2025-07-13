import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Lock,
  UserCheck,
  Phone,
  Mail,
  Plus,
  CalendarIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface RescheduleRequest {
  id: string;
  touristName: string;
  originalDate: string;
  originalTime: string;
  requestedDate: string;
  requestedTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  location: string;
  timestamp: string;
}

interface AssignedTourist {
  id: string;
  tourist_id: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    contact_info: string;
    nationality: string;
    gender: string;
  };
}

export function TourGuideView() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guideId, setGuideId] = useState('');
  const [password, setPassword] = useState('');
  const [currentGuideData, setCurrentGuideData] = useState<any>(null);
  const [assignedTourists, setAssignedTourists] = useState<AssignedTourist[]>([]);
  const [notifications, setNotifications] = useState<RescheduleRequest[]>([]);
  const [tourActivities, setTourActivities] = useState<any[]>([]);

  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [selectedTouristForSchedule, setSelectedTouristForSchedule] = useState<string>('');
  const [newActivity, setNewActivity] = useState({
    activity_name: '',
    location_name: '',
    scheduled_date: new Date(),
    scheduled_time: '09:00',
    description: '',
    category: 'attraction',
    duration_minutes: 180
  });
  const { toast } = useToast();

  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  const handleRequestResponse = (requestId: string, action: 'approve' | 'decline', message?: string) => {
    setNotifications(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'approve' ? 'approved' : 'declined' }
          : req
      )
    );

    toast({
      title: action === 'approve' ? 'Request Approved' : 'Request Declined',
      description: `The reschedule request has been ${action}d successfully.`
    });

    setSelectedRequest(null);
    setShowResponseDialog(false);
    setResponseMessage('');
  };

  const openResponseDialog = (request: RescheduleRequest) => {
    setSelectedRequest(request);
    setShowResponseDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-red-600 border-red-600">Declined</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Fetch assigned tourists and set up real-time updates
  useEffect(() => {
    if (isLoggedIn && currentGuideData) {
      fetchAssignedTourists();
      fetchTourActivities();
      setupRealtimeUpdates();
    }
  }, [isLoggedIn, currentGuideData]);

  const fetchAssignedTourists = async () => {
    try {
      const { data, error } = await supabase
        .from('tour_assignments')
        .select(`
          id,
          tourist_id,
          status,
          created_at,
          tour_name,
          start_date,
          end_date,
          profiles!tourist_id (
            full_name,
            contact_info,
            nationality,
            gender
          )
        `)
        .eq('guide_id', currentGuideData?.id)
        .in('status', ['pending', 'active']);

      if (error) throw error;
      setAssignedTourists((data || []) as AssignedTourist[]);
    } catch (error: any) {
      console.error('Error fetching assigned tourists:', error);
    }
  };

  const fetchTourActivities = async () => {
    try {
      // Get all tour assignments for this guide to get activity data
      const assignmentIds = assignedTourists.map(t => t.id);
      if (assignmentIds.length === 0) return;

      const { data, error } = await supabase
        .from('tour_activities')
        .select('*')
        .in('tour_assignment_id', assignmentIds)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setTourActivities(data || []);
    } catch (error: any) {
      console.error('Error fetching tour activities:', error);
    }
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel('guide-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tour_assignments',
          filter: `guide_id=eq.${currentGuideData?.id}`
        },
        () => {
          fetchAssignedTourists();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tour_activities'
        },
        () => {
          fetchTourActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('guide_id', guideId)
        .eq('password', password)
        .single();

      if (error || !data) {
        toast({
          title: 'Login Failed',
          description: 'Invalid credentials. Please check your Guide ID and password.',
          variant: 'destructive'
        });
        return;
      }

      setCurrentGuideData(data);
      setIsLoggedIn(true);
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${data.name}!`
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'An error occurred during login.',
        variant: 'destructive'
      });
    }
  };

  const addActivityToSchedule = async () => {
    if (!selectedTouristForSchedule || !newActivity.activity_name || !newActivity.location_name) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Find the tour assignment for the selected tourist
      const assignment = assignedTourists.find(t => t.tourist_id === selectedTouristForSchedule);
      if (!assignment) {
        throw new Error('Tour assignment not found');
      }

      const { error } = await supabase
        .from('tour_activities')
        .insert({
          tour_assignment_id: assignment.id,
          activity_name: newActivity.activity_name,
          location_name: newActivity.location_name,
          scheduled_date: newActivity.scheduled_date.toISOString().split('T')[0],
          scheduled_time: newActivity.scheduled_time,
          description: newActivity.description,
          category: newActivity.category,
          duration_minutes: newActivity.duration_minutes,
          status: 'planned'
        });

      if (error) throw error;

      toast({
        title: 'Activity Added',
        description: 'The activity has been added to the schedule successfully.'
      });

      // Reset form
      setNewActivity({
        activity_name: '',
        location_name: '',
        scheduled_date: new Date(),
        scheduled_time: '09:00',
        description: '',
        category: 'attraction',
        duration_minutes: 180
      });
      setSelectedTouristForSchedule('');
      setShowAddActivity(false);
      fetchTourActivities();
    } catch (error: any) {
      console.error('Error adding activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to add activity to schedule.',
        variant: 'destructive'
      });
    }
  };

  // Show login form if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card animate-bounce-in">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-heritage-amber/30 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-heritage-amber bg-clip-text text-transparent">
              Tour Guide Login
            </CardTitle>
            <p className="text-muted-foreground">Sign in to access your dashboard</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guideId">Guide ID</Label>
              <Input
                id="guideId"
                type="text"
                placeholder="Enter your guide ID"
                value={guideId}
                onChange={(e) => setGuideId(e.target.value)}
                className="glass-effect transition-all duration-200 focus:shadow-glow"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="glass-effect transition-all duration-200 focus:shadow-glow"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full hover:shadow-glow transition-all duration-300"
              disabled={!guideId || !password}
              variant="desert"
            >
              Sign In
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Use your Guide ID and password from the admin
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tour Guide Dashboard</h1>
            <p className="text-gray-600">Manage your tours and guest requests</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned Tourists</p>
                <p className="text-xl font-semibold">{assignedTourists.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-xl font-semibold">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-xl font-semibold">4.8</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-xl font-semibold">45 Tours</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Tourists */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5" />
              <span>Your Assigned Tourists</span>
              {assignedTourists.length > 0 && (
                <Badge variant="default">{assignedTourists.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignedTourists.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tourists assigned yet</p>
              ) : (
                assignedTourists.map((tourist) => (
                  <div key={tourist.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{tourist.profiles?.full_name || 'Tourist'}</h3>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Active
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          {tourist.profiles?.contact_info && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{tourist.profiles.contact_info}</span>
                            </div>
                          )}
                          {tourist.profiles?.nationality && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{tourist.profiles.nationality}</span>
                            </div>
                          )}
                          {tourist.profiles?.gender && (
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{tourist.profiles.gender}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Assigned: {new Date(tourist.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                     <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => window.open(`tel:${tourist.profiles?.contact_info}`, '_self')}
                        className="flex items-center space-x-1"
                        disabled={!tourist.profiles?.contact_info}
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`https://wa.me/${tourist.profiles?.contact_info?.replace(/[^0-9]/g, '')}?text=Hello! I'm your assigned tour guide from AlUla Journey. I'm ready to help you explore AlUla!`, '_blank')}
                        className="flex items-center space-x-1"
                        disabled={!tourist.profiles?.contact_info}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => {
                          setSelectedTouristForSchedule(tourist.tourist_id);
                          setShowAddActivity(true);
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Add Schedule</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tour Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Tour Schedule</span>
              {tourActivities.length > 0 && (
                <Badge variant="default">{tourActivities.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tourActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No schedule created yet</p>
                  <Button 
                    onClick={() => setShowAddActivity(true)}
                    className="flex items-center space-x-2"
                    disabled={assignedTourists.length === 0}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Activity</span>
                  </Button>
                </div>
              ) : (
                tourActivities.map((activity) => {
                  const tourist = assignedTourists.find(t => t.id === activity.tour_assignment_id);
                  return (
                    <div key={activity.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{activity.activity_name}</h3>
                          <p className="text-sm text-gray-600">{activity.location_name}</p>
                          <p className="text-sm text-gray-600">
                            Tourist: {tourist?.profiles?.full_name || 'Unknown'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          {activity.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(activity.scheduled_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{activity.scheduled_time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{activity.duration_minutes} minutes</span>
                        </div>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reschedule Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Reschedule Requests</span>
              {pendingCount > 0 && (
                <Badge variant="destructive">{pendingCount}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No reschedule requests</p>
              ) : (
                notifications.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{request.touristName}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{request.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(request.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="font-medium text-red-600">Original Schedule:</p>
                        <p>{request.originalDate} at {request.originalTime}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-green-600">Requested Schedule:</p>
                        <p>{request.requestedDate} at {request.requestedTime}</p>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="space-y-1">
                        <p className="font-medium text-sm">Reason:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{request.reason}</p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleRequestResponse(request.id, 'approve')}
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openResponseDialog(request)}
                          className="flex items-center space-x-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openResponseDialog(request)}
                          className="flex items-center space-x-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Respond</span>
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Response Dialog */}
        <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Respond to Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {selectedRequest && (
                <div className="space-y-2">
                  <p className="font-medium">{selectedRequest.touristName}</p>
                  <p className="text-sm text-gray-600">{selectedRequest.location}</p>
                </div>
              )}
              <Textarea
                placeholder="Add a message (optional)"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex space-x-2">
                <Button 
                  onClick={() => selectedRequest && handleRequestResponse(selectedRequest.id, 'approve', responseMessage)}
                  className="flex-1"
                >
                  Approve
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => selectedRequest && handleRequestResponse(selectedRequest.id, 'decline', responseMessage)}
                  className="flex-1"
                >
                  Decline
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Activity Dialog */}
        <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Tourist</Label>
                <select 
                  value={selectedTouristForSchedule}
                  onChange={(e) => setSelectedTouristForSchedule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Tourist</option>
                  {assignedTourists.map((tourist) => (
                    <option key={tourist.tourist_id} value={tourist.tourist_id}>
                      {tourist.profiles?.full_name || 'Tourist'}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                placeholder="Activity Name"
                value={newActivity.activity_name}
                onChange={(e) => setNewActivity({...newActivity, activity_name: e.target.value})}
              />
              <Input
                placeholder="Location"
                value={newActivity.location_name}
                onChange={(e) => setNewActivity({...newActivity, location_name: e.target.value})}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {newActivity.scheduled_date ? format(newActivity.scheduled_date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newActivity.scheduled_date}
                    onSelect={(date) => date && setNewActivity({...newActivity, scheduled_date: date})}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  value={newActivity.scheduled_time}
                  onChange={(e) => setNewActivity({...newActivity, scheduled_time: e.target.value})}
                />
                <Input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={newActivity.duration_minutes}
                  onChange={(e) => setNewActivity({...newActivity, duration_minutes: parseInt(e.target.value) || 180})}
                />
              </div>
              <select 
                value={newActivity.category}
                onChange={(e) => setNewActivity({...newActivity, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="heritage">Heritage Sites</option>
                <option value="attraction">Attraction Places</option>
                <option value="adventure">Adventure Activities</option>
              </select>
              <Textarea
                placeholder="Description (optional)"
                value={newActivity.description}
                onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                className="min-h-[80px]"
              />
              <div className="flex space-x-2">
                <Button onClick={addActivityToSchedule} className="flex-1">
                  Add Activity
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddActivity(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}