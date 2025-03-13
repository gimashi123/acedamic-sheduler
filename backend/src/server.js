import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect_db } from './config/db.config.js';

import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import groupRoutes from './routes/group.route.js';
import venueRoutes from './routes/venue.route.js';

import timeTableRoutes from './routes/timetable.js';


const app = express();
dotenv.config();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const PORT = process.env.BACKEND_PORT;

app.listen(PORT, () => {
  console.log("Server started at http://localhost:" + PORT);
});

await connect_db().then(() => {
  console.log('Connected to the database');
});

app.get('/hello',(_,res)=>{
    res.send('backend is up and running')
})

// Routes
app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/api/timetable', timeTableRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/venues', venueRoutes);
