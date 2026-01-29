import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  try {
    const body = await req.text();
    
    const base44 = createClientFromRequest(req);
    
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata;

      console.log('Payment completed:', metadata);

      if (metadata.type === 'server_boost') {
        await base44.asServiceRole.entities.ServerBoost.create({
          server_id: metadata.server_id,
          user_id: metadata.user_id,
          user_email: metadata.user_email,
          user_name: metadata.user_email.split('@')[0],
          boost_level: 1,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_id: session.id
        });

        const server = await base44.asServiceRole.entities.Server.filter({ id: metadata.server_id });
        if (server.length > 0) {
          await base44.asServiceRole.entities.Server.update(metadata.server_id, {
            features: [...(server[0].features || []), 'boosted']
          });
        }

        console.log('Server boost created');
      } else if (metadata.type === 'credits_1000' || metadata.type === 'credits_5000') {
        const creditsAmount = parseInt(metadata.credits_amount);
        const userCredits = await base44.asServiceRole.entities.UserCredits.filter({ 
          user_email: metadata.user_email 
        });

        if (userCredits.length > 0) {
          await base44.asServiceRole.entities.UserCredits.update(userCredits[0].id, {
            balance: (userCredits[0].balance || 0) + creditsAmount,
            lifetime_purchased: (userCredits[0].lifetime_purchased || 0) + creditsAmount
          });
        } else {
          await base44.asServiceRole.entities.UserCredits.create({
            user_id: metadata.user_id,
            user_email: metadata.user_email,
            balance: creditsAmount,
            lifetime_purchased: creditsAmount
          });
        }

        console.log('Credits added:', creditsAmount);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});