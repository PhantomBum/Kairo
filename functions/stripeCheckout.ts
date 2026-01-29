import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const { type, serverId, serverName, userId, userEmail, amount } = await req.json();

    let priceId;
    let metadata = {
      base44_app_id: Deno.env.get('BASE44_APP_ID'),
      type,
      user_id: userId,
      user_email: userEmail
    };

    if (type === 'server_boost') {
      priceId = 'price_1Sv534PvPSTEb1qf8vXNmA4M'; // $4.99
      metadata.server_id = serverId;
      metadata.server_name = serverName;
    } else if (type === 'credits_1000') {
      priceId = 'price_1Sv534PvPSTEb1qftUxVolKL'; // $9.99
      metadata.credits_amount = '1000';
    } else if (type === 'credits_5000') {
      priceId = 'price_1Sv534PvPSTEb1qfXQriQ8H9'; // $39.99
      metadata.credits_amount = '5000';
    } else {
      return Response.json({ error: 'Invalid purchase type' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${req.headers.get('origin') || 'http://localhost:5173'}?payment=success`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:5173'}?payment=cancelled`,
      metadata
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});