import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  action: string;
  target_table?: string;
  target_id?: string;
  details?: Record<string, any>;
}

export const logAdminAction = async (entry: AuditLogEntry) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot log admin action: No authenticated user');
      return;
    }

    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        admin_user_id: user.id,
        action: entry.action,
        target_table: entry.target_table,
        target_id: entry.target_id,
        details: entry.details
      });

    if (error) {
      console.error('Failed to log admin action:', error);
    }
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

// Common audit actions
export const AUDIT_ACTIONS = {
  CREATE_GUIDE: 'create_guide',
  UPDATE_GUIDE: 'update_guide',
  DELETE_GUIDE: 'delete_guide',
  ASSIGN_TOURIST: 'assign_tourist',
  REMOVE_ASSIGNMENT: 'remove_assignment',
  CREATE_DRIVER: 'create_driver',
  UPDATE_DRIVER: 'update_driver',
  DELETE_DRIVER: 'delete_driver',
  APPROVE_GUIDE_REQUEST: 'approve_guide_request',
  REJECT_GUIDE_REQUEST: 'reject_guide_request',
  LOGIN: 'admin_login',
  LOGOUT: 'admin_logout'
} as const;