import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Clock, CheckCircle, XCircle, Send, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GuideRequestProps {
  userId: string;
}

interface GuideRequestData {
  id: string;
  request_message: string;
  status: 'pending' | 'approved' | 'rejected';
  assigned_guide_id?: string;
  admin_response?: string;
  created_at: string;
  adults_count?: number;
  children_count?: number;
  guides?: {
    name: string;
    email: string;
    phone: string;
  };
}

export function GuideRequest({ userId }: GuideRequestProps) {
  const [requests, setRequests] = useState<GuideRequestData[]>([]);
  const [newRequestMessage, setNewRequestMessage] = useState('');
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('guide_requests')
        .select(`
          *,
          guides (
            name,
            email,
            phone
          )
        `)
        .eq('tourist_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      })));
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load guide requests.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async () => {
    if (!newRequestMessage.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message with your guide request.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // First, ensure the user profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            user_type: 'tourist'
          });
        
        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          toast({
            title: 'Error',
            description: 'Failed to create user profile. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      } else if (profileError) {
        throw profileError;
      }

      // Now submit the guide request
      const { error } = await supabase
        .from('guide_requests')
        .insert({
          tourist_id: userId,
          request_message: newRequestMessage.trim(),
          status: 'pending',
          adults_count: adultsCount,
          children_count: childrenCount
        });

      if (error) throw error;

      setNewRequestMessage('');
      fetchRequests(); // Refresh the list
      toast({
        title: 'Request Submitted',
        description: 'Your guide request has been sent to the admin.',
      });
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit guide request.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canRequestNewGuide = !requests.some(req => req.status === 'pending' || req.status === 'approved');

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5" />
          <span>Guide Requests</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {canRequestNewGuide && (
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30">
            <h3 className="font-medium">Request a Tour Guide</h3>
            
            {/* Family Members Selection */}
            <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-muted">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <h4 className="font-medium text-sm">Family Members</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adults" className="text-sm font-medium">Adults</Label>
                  <Select value={adultsCount.toString()} onValueChange={(value) => setAdultsCount(parseInt(value))}>
                    <SelectTrigger id="adults">
                      <SelectValue placeholder="Select adults" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Adult{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="children" className="text-sm font-medium">Children</Label>
                  <Select value={childrenCount.toString()} onValueChange={(value) => setChildrenCount(parseInt(value))}>
                    <SelectTrigger id="children">
                      <SelectValue placeholder="Select children" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 11 }, (_, i) => i).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Child' : 'Children'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-accent/10 p-2 rounded">
                Total: {adultsCount + childrenCount} member{adultsCount + childrenCount !== 1 ? 's' : ''}
              </div>
            </div>

            <Textarea
              placeholder="Please describe your tour preferences, dates, and any special requirements..."
              value={newRequestMessage}
              onChange={(e) => setNewRequestMessage(e.target.value)}
              className="min-h-[100px]"
              disabled={submitting}
            />
            <Button
              onClick={submitRequest}
              disabled={submitting || !newRequestMessage.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-medium">Your Requests</h3>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading...</p>
            </div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No guide requests yet. Submit your first request above!
            </p>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="border border-muted/50">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {/* Family Members Info */}
                  {(request.adults_count || request.children_count) && (
                    <div className="bg-background/50 p-3 rounded-lg border border-muted">
                      <p className="text-sm font-medium mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        Family Members:
                      </p>
                      <div className="text-sm text-muted-foreground">
                        <span className="inline-block mr-4">
                          Adults: {request.adults_count || 1}
                        </span>
                        <span className="inline-block">
                          Children: {request.children_count || 0}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-1">Your Message:</p>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                      {request.request_message}
                    </p>
                  </div>

                  {request.status === 'approved' && request.guides && (
                    <div className="bg-accent/20 p-3 rounded-lg border border-accent/30">
                      <p className="text-sm font-medium text-accent-foreground mb-2">
                        Assigned Guide:
                      </p>
                      <div className="text-sm text-accent-foreground/80">
                        <p><strong>Name:</strong> {request.guides.name}</p>
                        <p><strong>Email:</strong> {request.guides.email}</p>
                        <p><strong>Phone:</strong> {request.guides.phone}</p>
                      </div>
                    </div>
                  )}

                  {request.admin_response && (
                    <div>
                      <p className="text-sm font-medium mb-1">Admin Response:</p>
                      <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                        {request.admin_response}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}