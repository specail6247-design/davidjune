/* eslint-disable-next-line */
'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY, PLAN_CONFIG, GIFT_TIERS } from '../../lib/monetizationConfig';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export default function Monetization() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get('success')) {
      setMessage('Order placed! You will receive an email confirmation.');
    }

    if (query.get('canceled')) {
      setMessage(
        'Order canceled -- continue to shop around and checkout when you are ready.'
      );
    }
  }, []);

  const handlePlanCheckout = async (plan: keyof typeof PLAN_CONFIG) => {
    // When the customer clicks on the button, redirect them to Checkout.
    const stripe = await stripePromise;

    if (!stripe) {
      console.error('Stripe has not loaded');
      return;
    }

    // This is where you would ideally have a backend that creates a checkout session.
    // For this client-side example, we'll just show a message.
    alert(`Redirecting to Stripe to purchase the ${PLAN_CONFIG[plan].name} plan...`);

    // In a real application, you would make a call to your backend to create a
    // Checkout Session and then redirect to Stripe.
    /*
    const response = await fetch('/api/checkout-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });
    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer
      // using `result.error.message`.
      console.error(result.error.message);
    }
    */
  };

  const handleGiftCheckout = async (amount: number, currency: string) => {
    alert(`Redirecting to Stripe to gift ${amount} ${currency}...`);

    // Similar to plans, you'd have a backend create a session for this.
  };

  return (
    <section className="bg-gray-900 text-white p-8 rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Support Our Mission</h2>
      
      {message ? (
        <div className="bg-blue-600 text-white p-4 rounded-md mb-6 text-center">
          {message}
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Pricing Plans */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-2xl font-semibold mb-4 text-center">Choose a Plan</h3>
          <div className="flex flex-col gap-4">
            {Object.keys(PLAN_CONFIG).map((plan) => (
              <div key={plan} className="bg-gray-700 p-4 rounded-md flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-bold">{PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG].name}</h4>
                  <p className="text-gray-400">{PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG].price}</p>
                  <ul className="text-sm text-gray-300 mt-2">
                    {PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG].features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <button 
                  onClick={() => handlePlanCheckout(plan as keyof typeof PLAN_CONFIG)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Gifting Tiers */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-2xl font-semibold mb-4 text-center">Give a Gift</h3>
          <div className="flex flex-col gap-4">
            {GIFT_TIERS.map((tier, i) => (
              <div key={i} className="bg-gray-700 p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold">{`${tier.amount} ${tier.currency}`}</p>
                  <p className="text-gray-400">One-time gift</p>
                </div>
                <button 
                  onClick={() => handleGiftCheckout(tier.amount, tier.currency)}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Gift Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
