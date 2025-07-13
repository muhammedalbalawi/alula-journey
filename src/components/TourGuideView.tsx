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
  Lock
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

export function TourGuideView() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guideId, setGuideId] = useState('');
  const [password, setPassword] = useState('');
  const [notifications, setNotifications] = useState<RescheduleRequest[]>([
    {
      id: '1',
      touristName: 'Ahmed Al-Rashid',
      originalDate: '2024-07-15',
      originalTime: '09:00',
      requestedDate: '2024-07-16',
      requestedTime: '10:00',
      reason: 'Family emergency - need to reschedule',
      status: 'pending',
      location: 'Hegra (الحجر)',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      touristName: 'Sarah Johnson',
      originalDate: '2024-07-14',
      originalTime: '14:00',
      requestedDate: '2024-07-14',
      requestedTime: '16:00',
      reason: 'Flight delay',
      status: 'pending',
      location: 'Al-Ula Old Town',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [showResponseDialog, setShowResponseDialog] = useState(false);
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

  const handleLogin = () => {
    if (guideId === 'guide123' && password === 'password') {
      setIsLoggedIn(true);
      toast({
        title: 'Login Successful',
        description: 'Welcome to your dashboard!'
      });
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Try guide123/password',
        variant: 'destructive'
      });
    }
  };

  // Show login form if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Tour Guide Login</CardTitle>
            <p className="text-gray-600">Sign in to access your dashboard</p>
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
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full"
              disabled={!guideId || !password}
            >
              Sign In
            </Button>
            <p className="text-xs text-center text-gray-500">
              Demo credentials: guide123 / password
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
                <p className="text-sm text-gray-600">Active Tours</p>
                <p className="text-xl font-semibold">12</p>
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
      </div>
    </div>
  );
}