const {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    fetchCustomers,
    fetchRestaurants,
    fetchReservations,
    createReservation,
    destroyReservation,
} = require('./db.js')

const express = require('express');
const app = express();
app.use(express.json());
app.get('/api/customers', async (req, res, next) => {
    try {
        res.send(await fetchCustomers());
    } catch (ex) {
        next(ex)
    }
});
app.get('/api/restaurants', async (req, res, next) => {
    try {
        res.send(await fetchRestaurants());
    } catch (ex) {
        next(ex)
    }
});
app.get('/api/reservations', async (req, res, next) => {
    try {
        res.send(await fetchReservations());
    } catch (ex) {
        next(ex)
    }
});
app.post('/api/customers/:id/reservations', async (req, res, next) => {
    try {
        res.status(201).send(await createReservation({
            date: req.body.date,
            party_count:req.body.party_count,
            restaurant_id: req.body.restaurant_id,
            customer_id: req.body.customer_id
        }));
    } catch (ex) {
        next(ex)
    }
});
app.delete('/api/customers/:customer_id/reservations/:id', async (req, res, next) => {
    try {
        res.status(204).send(await destroyReservation({
            id: req.params.reservation_id,
            customer_id : req.params.customer_id,
        }));
    } catch (ex) {
        next(ex)
    }
});
app.use((err, req, res, next) => {
    res.status(err.status || 500).send ({ error: err.message || err });
});

const init = async () => {
    console.log("Connecting to database");
    await client.connect();
    console.log("Connected to database");
    await createTables();
    console.log("Created tables");

    await Promise.all([
        createCustomer({ name: 'john' }),
        createCustomer({ name: 'emily' }),
        createCustomer({ name: 'christina' }),
        createCustomer({ name: 'joe' })
    ]);

    await Promise.all([
        createRestaurant({ name: 'Taj Indian Cuisine' }),
        createRestaurant({ name: 'Sushi Masa' }),
        createRestaurant({ name: 'Thai Kitchen' })
    ]);


    console.log("Initial data inserted");
    const customers = await fetchCustomers();
    const restaurants = await fetchRestaurants();
    console.log(await fetchCustomers());
    console.log(await fetchRestaurants());

    const [reservation1, reservation2, reservation3] = await Promise.all([
        createReservation({
            date: '02/14/2025',
            party_count: 10,
            restaurant_id: restaurants[1].id,
            customer_id: customers[1].id,
        }),
        createReservation({
            date: '05/24/2025',
            party_count: 7,
            restaurant_id: restaurants[0].id,
            customer_id: customers[2].id,
        }),
        createReservation({
            date: '12/31/2024',
            party_count: 5,
            restaurant_id: restaurants[2].id,
            customer_id: customers[0].id,
        })
    ]);
    console.log(await fetchReservations());
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`listening to port ${port}`);
    });
}
init();

