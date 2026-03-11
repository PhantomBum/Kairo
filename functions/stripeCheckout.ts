import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get request body
    const { product_type, type, price_id, success_url, cancel_url, user_id, server_id } = await req.json();
    const pType = type || product_type;
    
    // Create checkout session
    const sessionConfig = {
      payment_method_types: ['card'],
      mode: product_type === 'subscription' ? 'subscription' : 'payment',
      success_url: success_url || `${req.headers.get('origin') || 'https://app.base44.com'}/success`,
      cancel_url: cancel_url || `${req.headers.get('origin') || 'https://app.base44.com'}/cancel`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_id,
        server_id,
        product_type,
      },
    };

    // Handle different product types
    if (pType === 'elite_subscription' || pType === 'nitro') {
      // Kairo Premium/Nitro
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Kairo Elite',
            description: 'Animated profiles, custom themes, 100MB uploads, HD voice, monthly credits, and more',
          },
          unit_amount: 999, // $9.99
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }];
      sessionConfig.mode = 'subscription';
    } else if (pType === 'boost') {
      // Server boost
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Server Boost',
            description: 'Boost this server for better quality and perks',
          },
          unit_amount: 499, // $4.99
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }];
      sessionConfig.mode = 'subscription';
    } else if (pType === 'credits') {
      // Kairo credits
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: '1000 Kairo Credits',
            description: 'Use credits to purchase profile decorations and items',
          },
          unit_amount: 499, // $4.99
        },
        quantity: 1,
      }];
      sessionConfig.mode = 'payment';
    } else if (price_id) {
      // Custom price ID
      sessionConfig.line_items = [{ price: price_id, quantity: 1 }];
    } else {
      return Response.json({ error: 'Invalid product type' }, { status: 400 });
    }
    
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    console.log('Created checkout session:', session.id);
    
    return Response.json({ 
      url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});