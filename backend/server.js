import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
const app = express();
dotenv.config();
app.use(express.json());
app.use(cors({origin:true,credentials:true}));





const PORT = process.env.BACKEND_PORT;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})

app.get('/hello',(_,res)=>{
    res.send('backend is up and running')
})

