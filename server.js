// Imports
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoURI = 'mongodb+srv://customer:123@cluster0.bsa8w.mongodb.net/customer-management-system?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Mongoose Customer Schema
const customerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emailAddress: { type: String, required: true },
    addresses: [{
        street: String,
        city: String,
        state: String,
        pinCode: String,
        isPrimary: Boolean
    }]
});

const Customer = mongoose.model('Customer', customerSchema);

// Routes
app.get('/', (req, res) => {
    res.send('Hello world');
});

// 1. Create a new customer
app.post('/customers', async (req, res) => {
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 2. Get a customer by ID
app.get('/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);  // Return customer details
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 3. Update customer details
app.put('/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 4. Delete a customer
app.delete('/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5. Search and filter customers by name, city, etc.
app.get('/customers', async (req, res) => {
    const { name, city, state, pinCode } = req.query;

    let query = {};
    // Searching from DB
    if (name) query['$or'] = [{ firstName: new RegExp(name, 'i') }, { lastName: new RegExp(name, 'i') }];
    if (city) query['addresses.city'] = new RegExp(city, 'i');
    if (state) query['addresses.state'] = new RegExp(state, 'i');
    if (pinCode) query['addresses.pinCode'] = pinCode;

    try {
        const customers = await Customer.find(query);
        res.json(customers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
