import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect_db } from './config/db.config.js';
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
<<<<<<< Updated upstream
=======
import groupRoutes from './routes/group.route.js';
import venueRoutes from './routes/venue.route.js';
import { authenticateToken } from './middleware/jwt.middleware.js';
>>>>>>> Stashed changes

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const PORT = process.env.BACKEND_PORT;

app.listen(PORT, () => {
<<<<<<< Updated upstream
  console.log(`Server is running on port ${PORT}`);
=======
  console.log('Server started at http://localhost:' + PORT);
>>>>>>> Stashed changes
});

await connect_db().then(() => {
  console.log('Connected to the database');
});

app.get('/hello', (_, res) => {
  res.send('Backend is up and running');
});

<<<<<<< Updated upstream
app.use('/auth', authRoute);
app.use('/user', userRoute);
=======
// gimashi
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);

// ravindu
app.use('/api/group', authenticateToken, groupRoutes);
app.use('/api/venue', authenticateToken, venueRoutes);
>>>>>>> Stashed changes
