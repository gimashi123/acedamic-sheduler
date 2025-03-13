import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect_db } from './config/db.config.js';

import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import groupRoutes from './routes/group.route.js';
import venueRoutes from './routes/venue.route.js';
import { authenticateToken } from './middleware/jwt.middleware.js';
const app = express();
dotenv.config();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const PORT = process.env.BACKEND_PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

await connect_db().then(() => {
  console.log('Connected to the database');
});

app.get('/hello', (_, res) => {
  res.send('Backend is up and running');
});


app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/group', authenticateToken, groupRoutes);
app.use('/api/venue', authenticateToken, venueRoutes);
