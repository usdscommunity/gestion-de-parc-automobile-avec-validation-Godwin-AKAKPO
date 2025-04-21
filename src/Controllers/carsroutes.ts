import express from 'express';
import {Response, Request } from 'express';
import { sql_db_pool_promise } from '../db/mysql';
import {Car} from '../models/Cars'; 
import { ValidateCar } from '../../validators/custom-express-validator'
import { validationResult } from 'express-validator';
import {authenticationfilter} from "../../security/auth-filter";
import {authorizeRole} from "../../security/auth-filter";
const carsrouter =  express.Router();

carsrouter.post('/', authenticationfilter, authorizeRole('admin'), ValidateCar, async(req : Request, res : Response)=>{
    const UserId = req.userId; // Je récupère l'id de l'utilisateur connecté grace à mon middleware
    const car = req.body as Car;
    const errors = validationResult(req);
   // if(!car.brand || !car.model || !car.year || !car.price){
        //res.status(401).json({message: "Les champs brand, model, year et price sont requis"})
       // return;
   // }
    if (!errors.isEmpty()){
        res.status(400).json({errors : errors.array()});
        return;
    }
    try {
        const sqlRequest1 = "INSERT INTO cars(brand, model, year, price, created_by) VALUES (?, ?, ?, ?, ?)";
        const result = await sql_db_pool_promise.execute(
            sqlRequest1, 
            [car.brand , car.model, car.year, car.price, UserId]
        );
        res.status(201).json({message: "Voiture enregistré avec succès", Car: car, result: result})

    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Erreur lors de l'enregistrement de la voiture"});
        return;
    
    }
});

carsrouter.get('/', authenticationfilter, async(req : Request, res :Response)=>{
    try {
        const sqlRequest ="SELECT * FROM cars"
        const result = await sql_db_pool_promise.execute(sqlRequest, [])as any[];
        const cars = result[0]
        if (cars.length == 0){
            res.status(404).json({message : "Aucune voiture n'est enregistré actuellement"});
            return;
        }
        res.status(200).json({message: "Liste de(s) voiture(s) trouvé(s) :", cars : cars})
    } catch (err) {
        console.log(err);
        res.status(500).json({message : "Erreur lors de la récupération de(s) voiture(s) "})
    }
});

carsrouter.get('/:id', authenticationfilter, async(req : Request, res :Response)=>{
    const id_car = req.params['id']
    try {
        const sqlRequest ="SELECT * FROM cars WHERE id = ?"
        const result = await sql_db_pool_promise.execute(sqlRequest, [id_car])as any[];
        const cars = result[0]
        if (cars.length == 0){
            res.status(404).json({message : "Aucune voiture n'est enregistré actuellement avec cet id"});
            return;
        }
        res.status(200).json({message: "Voiture trouvé pour cet id :", cars : cars})
    } catch (err) {
        console.log(err);
        res.status(500).json({message : "Erreur lors de la récupération de la voiture "})
    }
});

carsrouter.put('/:id', authenticationfilter, authorizeRole('admin'), ValidateCar, async(req : Request, res : Response)=>{
    const id_car = req.params['id'];
    const car = req.body as Car;
    const errors = validationResult(req);
    // if(!car.brand || !car.model || !car.year || !car.price){
         //res.status(401).json({message: "Les champs brand, model, year et price sont requis"})
        // return;
    // }
     if (!errors.isEmpty()){
        res.status(400).json({errors : errors.array()});
        return;
     }
    const sqlRequest = "SELECT * FROM cars WHERE id = ?"
    const result = await sql_db_pool_promise.execute(
        sqlRequest, 
        [id_car]
    )as any[];
    const cars  = result[0]
    if (cars['length'] === 0){
        res.status(404).json({message : "Voiture non retrouvé "})
        return;
    }  
    try {
        const sqlRequest = "UPDATE cars SET brand = ?, model = ?, year = ?, price = ? WHERE id = ?";
        const result = await sql_db_pool_promise.execute(sqlRequest, [car.brand, car.model, car.year, car.price, id_car])as any[];
        const cars = result[0];
        res.status(200).json({message : "Voiture mis à jour avec succès", car : car, cars : cars })
        return;
    } catch (err) {
        console.log(err);
        res.status(500).json({message : "Erreur lors de la mise à jour de la voiture "});
        return;
    }
});

carsrouter.delete('/:id', authenticationfilter, authorizeRole('admin'), async(req : Request, res : Response) =>{
    const car_id = req.params['id'];
    const car = req.body as Car;
    const sqlRequest = "SELECT * FROM cars WHERE id = ?"
    const result = await sql_db_pool_promise.execute(
        sqlRequest, 
        [car_id]
    )as any[];
    const cars  = result[0]
    if (cars['length'] === 0){
        res.status(404).json({message : "Voiture non retrouvé "})
        return;
    }  
    try {
        const sqlRequest = "DELETE FROM cars WHERE id = ?"
        const result = await sql_db_pool_promise.execute(
            sqlRequest, 
            [car_id]
        )as any[];
             
        res.status(201).json({message: "La voiture a été supprimé avec succès", car : car});
        return;
    } catch (err) {
        console.log(err);
        res.status(500).json({message : "Erreur lors de la suppresiion de la voiture"});
        return;
    }
})

export const apicarsRouter = carsrouter