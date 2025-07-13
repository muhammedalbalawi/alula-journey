import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
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
  guides?: {
    name: string;
    email: string;
    phone: string;
  };
}

export function GuideRequest({ userId }: GuideRequestProps) {
  const [requests, setRequests] = useState<GuideRequestData[]>([]);
  const [newRequestMessage, setNewRequestMessage] = useState('');
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
          status: 'pending'
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
                  <div>
                    <p className="text-sm font-medium mb-1">Your Message:</p>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
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