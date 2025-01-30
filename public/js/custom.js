/**
 * Clientside helper functions
 */

$(document).ready(function() {
  const stripe = Stripe("pk_test_51QkuCwFSYQio1CHoeN3Ijafdbnq2W08a969LrjuxOHla2D65wNYYs7CkVa8AhkD42ShBIbkYBr0C1qER8f8jrWOg00J5UjvAz4");

  var amounts = document.getElementsByClassName("amount");

  // iterate through all "amount" elements and convert from cents to dollars
  for (var i = 0; i < amounts.length; i++) {
    amount = amounts[i].getAttribute('data-amount') / 100;  
    amounts[i].innerHTML = amount.toFixed(2);
  }

  if($("#checkout").length){
    // call the function after the element has been loaded here
    console.log("Checkout loaded!");
    initializeCheckout();
  };

  if($("#success").length){
    // call the function after the element has been loaded here
    console.log("Success loaded!");
    initializeReturn();
  };

  // Create a Checkout Session
  async function initializeCheckout() {
    const fetchClientSecret = async () => {
      const response = await fetch("/create-checkout-session", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: $("#priceId").val() })
      });
      const { clientSecret } = await response.json();
      return clientSecret;
    };
  
    const checkout = await stripe.initEmbeddedCheckout({
      fetchClientSecret,
    });
  
    // Mount Checkout
    checkout.mount('#checkout');
  }

  async function initializeReturn() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get('session_id');
    const response = await fetch(`/session-status?session_id=${sessionId}`);
    const session = await response.json();
  
    if (session.status == 'open') {
      window.replace('http://localhost:3000/checkout')
    } else if (session.status == 'complete') {
      document.getElementById('success').classList.remove('hidden');
      document.getElementById('customer-email').textContent = session.customer_email
    }
  }
})

