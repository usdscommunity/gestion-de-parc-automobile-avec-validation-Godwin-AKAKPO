import express from 'express';
import {apiauthrouter} from '../src/Controllers/authenticationrouter';
import {apicarsRouter} from '../src/Controllers/carsroutes';
import {apifiltreRouter} from "../src/Controllers/filtreroute";
const appExpress = express();
import dotenv from "dotenv";
dotenv.config();

appExpress.use(express.json());

appExpress.use('/auth', apiauthrouter);
appExpress.use('/cars', apicarsRouter);
appExpress.use('/cars_search',apifiltreRouter);


console.log("JWT_SECRET:", process.env.JWT_SECRET); ///Faisons démarrer le serveur 
appExpress.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});