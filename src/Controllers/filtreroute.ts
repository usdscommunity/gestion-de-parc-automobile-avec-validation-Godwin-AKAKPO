import express from 'express';
import {Request, Response} from 'express';
import { sql_db_pool_promise } from '../db/mysql';
import {authenticationfilter} from "../../security/auth-filter";

const filtrerouter = express.Router();

filtrerouter.get('/:brand', authenticationfilter, async(req : Request, res : Response)=>{
    const brand = req.params['brand']
    try {
        const sqlRequest = "SELECT * FROM cars WHERE brand = ?"
        const result = await sql_db_pool_promise.execute(sqlRequest, [brand])as any[];
        const cars = result[0];
        if (cars.length === 0){
            res.status(404).json({message : "Aucune voiture n'a été enregistré avec ce model"});
            return;
        }
        res.status(200).json({message : "Liste des voitures avec ce modèle", cars : cars})
    } catch (err) {
        console.log(err);
        res.status(500).json({message : "Erreur lors du filtrage des voitures"});
        return;
    }
});
export const apifiltreRouter = filtrerouter; 