import { getUncachableStripeClient } from './stripeClient';

async function createBattlepassProduct() {
  const stripe = await getUncachableStripeClient();

  // Check if battlepass product already exists
  const existingProducts = await stripe.products.search({ 
    query: "name:'Asylum DayZ Premium Battlepass'" 
  });
  
  if (existingProducts.data.length > 0) {
    console.log('Battlepass product already exists:', existingProducts.data[0].id);
    return;
  }

  // Create the Premium Battlepass product
  const product = await stripe.products.create({
    name: 'Asylum DayZ Premium Battlepass',
    description: 'Unlock all premium rewards for the current season. Includes exclusive tactical gear, weapons, and cosmetics.',
    metadata: {
      type: 'battlepass',
      season: 'genesis',
    }
  });

  // Create price for the battlepass ($9.99 one-time purchase)
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 999, // $9.99 in cents
    currency: 'usd',
  });

  console.log('Created Battlepass Product:', product.id);
  console.log('Created Battlepass Price:', price.id);
}

createBattlepassProduct().catch(console.error);
