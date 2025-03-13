import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connect_db} from "./config/db.config.js";

import timeTableRoutes from './routes/timetable.js';


const app = express();
dotenv.config();
app.use(express.json());
app.use(cors({origin:true,credentials:true}));

const PORT = process.env.BACKEND_PORT;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})

await connect_db().then(()=> {
    console.log('connected to db')
});

app.get('/hello',(_,res)=>{
    res.send('backend is up and running')
})

app.use('/api/timetable', timeTableRoutes);
app.use(express.json()); // Enables JSON parsing
app.use(express.urlencoded({ extended: true }));




