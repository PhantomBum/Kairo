import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { type, serverId, serverName, subscriptionId, subscriptionName, duration, userId, userEmail } = await req.json();

    // Get app URL with fallback
    const appUrl = Deno.env.get('BASE44_APP_URL') || 'https://kairo-8406c21a.base44.app';
    
    let sessionConfig = {
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${appUrl}/Kairo?payment=success`,
      cancel_url: `${appUrl}/Kairo?payment=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        type,
        serverId: serverId || '',
        serverName: serverName || '',
        userId: userId || '',
        userEmail: userEmail || ''
      }
    };

    // Add customer email if provided (required for subscriptions)
    if (userEmail) {
      sessionConfig.customer_email = userEmail;
    }

    if (type === 'server_boost') {
      const prices = {
        1: 499,  // $4.99
        3: 1299, // $12.99
        12: 4999 // $49.99
      };

      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${serverName} Server Boost`,
            description: `${duration} month${duration > 1 ? 's' : ''} of server boost`,
          },
          unit_amount: prices[duration],
        },
        quantity: 1,
      }];
      sessionConfig.metadata.duration = duration;

    } else if (type === 'server_subscription') {
      const subscription = await base44.entities.ServerSubscription.filter({ id: subscriptionId });
      if (subscription.length === 0) {
        return Response.json({ error: 'Subscription not found' }, { status: 404 });
      }

      const sub = subscription[0];
      sessionConfig.mode = 'subscription';
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${serverName} - ${sub.name}`,
            description: sub.description || `Tier ${sub.tier} subscription`,
          },
          unit_amount: Math.round(sub.price * 100),
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      }];
      sessionConfig.metadata.subscriptionId = subscriptionId;
      sessionConfig.metadata.subscriptionName = subscriptionName || '';
    } else {
      return Response.json({ error: 'Invalid type' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return Response.json({ url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});