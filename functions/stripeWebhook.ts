import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Webhook event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata;

      console.log('Checkout completed:', metadata);

      if (metadata.type === 'server_boost') {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + parseInt(metadata.duration));

        await base44.asServiceRole.entities.ServerBoost.create({
          server_id: metadata.serverId,
          user_id: metadata.userId,
          user_email: metadata.userEmail,
          user_name: metadata.userName || 'User',
          boost_level: 1,
          expires_at: expiresAt.toISOString(),
          is_active: true,
          payment_id: session.payment_intent
        });

        const server = await base44.asServiceRole.entities.Server.filter({ id: metadata.serverId });
        if (server.length > 0) {
          await base44.asServiceRole.entities.Server.update(metadata.serverId, {
            member_count: (server[0].member_count || 0) + 1
          });
        }

        console.log('Server boost created successfully');

      } else if (metadata.type === 'server_subscription') {
        await base44.asServiceRole.entities.UserSubscription.create({
          user_id: metadata.userId,
          user_email: metadata.userEmail,
          server_id: metadata.serverId,
          subscription_id: metadata.subscriptionId,
          subscription_name: metadata.subscriptionName,
          tier: 1,
          status: 'active',
          started_at: new Date().toISOString(),
          payment_id: session.subscription
        });

        const subscription = await base44.asServiceRole.entities.ServerSubscription.filter({ 
          id: metadata.subscriptionId 
        });
        if (subscription.length > 0) {
          await base44.asServiceRole.entities.ServerSubscription.update(metadata.subscriptionId, {
            subscriber_count: (subscription[0].subscriber_count || 0) + 1
          });
        }

        console.log('User subscription created successfully');
      }

    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      
      const userSubs = await base44.asServiceRole.entities.UserSubscription.filter({
        payment_id: subscription.id
      });

      for (const userSub of userSubs) {
        await base44.asServiceRole.entities.UserSubscription.update(userSub.id, {
          status: 'cancelled',
          expires_at: new Date().toISOString()
        });
      }

      console.log('Subscription cancelled successfully');
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});