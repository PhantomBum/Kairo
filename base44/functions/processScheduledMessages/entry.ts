import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all pending scheduled messages that are due
    const now = new Date();
    const scheduled = await base44.asServiceRole.entities.ScheduledMessage.filter({
      status: 'pending',
    });
    
    const dueMessages = scheduled.filter(m => new Date(m.scheduled_at) <= now);
    
    console.log(`Processing ${dueMessages.length} scheduled messages`);
    
    for (const msg of dueMessages) {
      try {
        // Create the actual message
        await base44.asServiceRole.entities.Message.create({
          channel_id: msg.channel_id,
          server_id: msg.server_id,
          author_id: msg.author_id,
          author_name: msg.author_name,
          author_avatar: msg.author_avatar,
          content: msg.content,
          attachments: msg.attachments || [],
          type: 'default',
        });
        
        // Mark as sent
        await base44.asServiceRole.entities.ScheduledMessage.update(msg.id, {
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
        
        console.log(`Sent scheduled message ${msg.id}`);
      } catch (err) {
        console.error(`Failed to send scheduled message ${msg.id}:`, err);
        
        // Mark as failed
        await base44.asServiceRole.entities.ScheduledMessage.update(msg.id, {
          status: 'failed',
          error: err.message,
        });
      }
    }
    
    return Response.json({ 
      success: true,
      processed: dueMessages.length,
    });
  } catch (error) {
    console.error('Error processing scheduled messages:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});