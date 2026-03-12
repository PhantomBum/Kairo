import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    console.log('Processing webhook event:', event.type);
    
    const session = event.data.object;
    const { user_id, server_id, product_type } = session.metadata || {};
    
    switch (event.type) {
      case 'checkout.session.completed': {
        if (product_type === 'nitro' || product_type === 'elite_subscription') {
          // Grant premium status
          const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id });
          if (profiles.length > 0) {
            const badges = profiles[0].badges || [];
            if (!badges.includes('premium')) {
              badges.push('premium');
              await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, { 
                badges,
              });
            }
          }
          console.log('Granted premium to user:', user_id);
        } else if (product_type === 'boost') {
          // Create server boost
          await base44.asServiceRole.entities.ServerBoost.create({
            server_id,
            user_id,
            boost_level: 1,
            is_active: true,
            payment_id: session.subscription || session.payment_intent,
          });
          
          // Update server boost count
          const servers = await base44.asServiceRole.entities.Server.filter({ id: server_id });
          if (servers.length > 0) {
            const features = servers[0].features || [];
            if (!features.includes('boosted')) features.push('boosted');
            await base44.asServiceRole.entities.Server.update(servers[0].id, { features });
          }
          console.log('Created server boost for:', server_id);
        } else if (product_type === 'credits') {
          // Add credits to user
          const credits = await base44.asServiceRole.entities.UserCredits.filter({ user_id });
          if (credits.length > 0) {
            await base44.asServiceRole.entities.UserCredits.update(credits[0].id, {
              balance: (credits[0].balance || 0) + 1000,
            });
          } else {
            await base44.asServiceRole.entities.UserCredits.create({
              user_id,
              balance: 1000,
            });
          }
          console.log('Added 1000 credits to user:', user_id);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        // Handle subscription cancellation
        if (product_type === 'nitro' || product_type === 'elite_subscription') {
          const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id });
          if (profiles.length > 0) {
            const badges = (profiles[0].badges || []).filter(b => b !== 'premium');
            await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, { badges });
          }
          console.log('Removed premium from user:', user_id);
        } else if (product_type === 'boost') {
          const boosts = await base44.asServiceRole.entities.ServerBoost.filter({
            server_id,
            user_id,
            is_active: true,
          });
          for (const boost of boosts) {
            await base44.asServiceRole.entities.ServerBoost.update(boost.id, { is_active: false });
          }
          console.log('Deactivated boost for server:', server_id);
        }
        break;
      }
      
      case 'invoice.paid': {
        // Subscription renewed
        console.log('Invoice paid for:', session.subscription);
        break;
      }
      
      case 'invoice.payment_failed': {
        // Payment failed
        console.log('Payment failed for subscription:', session.subscription);
        break;
      }
    }
    
    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});