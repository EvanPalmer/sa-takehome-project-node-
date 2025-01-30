const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const YOUR_DOMAIN = 'http://localhost:3000';

var app = express();
app.use(express.static('public'));

// view engine setup (Handlebars)
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
app.use(express.json({}));

/**
 * Home route
 */
app.get('/', function(req, res) {
  res.render('index');
});

/**
 * Checkout route
 */
app.get('/checkout', function(req, res) {
  // Just hardcoding amounts here to avoid using a database
  const item = req.query.item;
  let title, amount, error;

  switch (item) {
    case '1':
      title = "The Art of Doing Science and Engineering"
      amount = 2300      
      priceId = "price_1Ql0CLFSYQio1CHonUPjxlZ4"      
      break;
    case '2':
      title = "The Making of Prince of Persia: Journals 1985-1993"
      amount = 2500
      priceId = "price_1QkyjGFSYQio1CHoE4NIjCY8"
      break;     
    case '3':
      title = "Working in Public: The Making and Maintenance of Open Source!"
      amount = 2800  
      priceId = "price_1Ql0CwFSYQio1CHoXQr5XpVD"
      break;     
    default:
      // Included in layout view, feel free to assign error
      error = "No item selected"      
      break;
  }

  res.render('checkout', {
    title: title,
    amount: amount,
    priceId: priceId,
    error: error
  });
});

/**
 * Create Checkout Session route
 */
app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [
      {
        price: req.body.priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    return_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
  });

  res.send({clientSecret: session.client_secret});
});

app.get('/session-status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    customer_email: session.customer_details.email
  });
});

/**
 * Success route
 */
app.get('/success', async(req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    // const customer = await stripe.customers.retrieve(session.customer);
    const lineItems = await stripe.checkout.sessions.listLineItems(req.query.session_id);

    res.render('success',  { session : session, lineItems : lineItems } );
});

/**
 * Cancel route
 */
app.get('/cancel', function(req, res) {
  res.render('cancel');
});

/**
 * Start server
 */
app.listen(3000, () => {
  console.log('Getting served on port 3000');
});
