const express = require('express');
const bodyParser = require('body-parser');
const dotEnv = require("dotenv");
const app = express();
dotEnv.config();

const SSLCommerzPayment = require('sslcommerz-lts');
const store_id = 'moinu65cd8fe0cc565';
const store_passwd = 'moinu65cd8fe0cc565@ssl';
const is_live = false; 

let transactionHistory = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/ssl-init', (req, res) => {
    const { name, phone, amount,address } = req.body; 
    const tran_id = generateTransactionID(); 
    const data = {
        total_amount: amount,
        currency: 'BDT',
        tran_id: tran_id,
        success_url: `http://localhost:${process.env.PORT}/success?tran_id=${tran_id}`,
        fail_url: `http://localhost:${process.env.PORT}/fail?tran_id=${tran_id}`,
        cancel_url: `http://localhost:${process.env.PORT}/cancel?tran_id=${tran_id}`,            
        shipping_method: 'Courier',
        product_name: 'Subject Wise Bangla Quran.',
        product_category: 'Islamic Book',
        product_profile: 'general',
        cus_name: name,
        cus_email: 'sujon0127@gmail.com',
        cus_add1: address,
        cus_add2: address,
        cus_city: address,
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: phone,
        cus_fax: phone,
        ship_name: name,
        ship_add1: "Flat-5D,plot-289/A,road-15,block-C",
        ship_add2: "Bashundhara R/A, Dhaka",
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    sslcz.init(data).then(apiResponse => {
        transactionHistory.push({
            tran_id: tran_id,
            amount: amount,
            status: "Done",
            name: name,
            phone: phone,
            address : address
        });
        res.json({ ssl_payment_url: apiResponse.GatewayPageURL });
    }).catch(error => {
        res.status(500).json({ error: 'Failed to initiate payment' });
    });
});


app.get('/success', (req, res) => {
    const tran_id = req.query.tran_id;
 
    const transaction = transactionHistory.find(transaction => transaction.tran_id === tran_id);
    if (transaction) {
        transaction.status = 'success';
    }
    res.send('Payment Successful');
});


app.get('/fail', (req, res) => {
    const tran_id = req.query.tran_id;

    const transaction = transactionHistory.find(transaction => transaction.tran_id === tran_id);
    if (transaction) {
        transaction.status = 'failure';
    }
    res.send('Payment Failed');
});

app.get('/cancel', (req, res) => {
    const tran_id = req.query.tran_id;
    const transaction = transactionHistory.find(transaction => transaction.tran_id === tran_id);
    if (transaction) {
        transaction.status = 'cancelled';
    }
    res.send('Payment Cancelled');
});

app.get('/transaction-history', (req, res) => {
    res.json({ transactionHistory });
});

function generateTransactionID() {
    return 'REF' + Math.random().toString(36).substr(2, 9);
}

app.listen(process.env.PORT, () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});
