import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { server_id, action_type, target_id, target_type, changes, reason } = await req.json();
    
    if (!server_id || !action_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create audit log entry
    const log = await base44.entities.AuditLog.create({
      server_id,
      action_type,
      executor_id: user.id,
      executor_name: user.full_name,
      target_id,
      target_type,
      changes,
      reason,
      timestamp: new Date().toISOString(),
    });
    
    return Response.json({ success: true, log });
  } catch (error) {
    console.error('Error writing audit log:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});