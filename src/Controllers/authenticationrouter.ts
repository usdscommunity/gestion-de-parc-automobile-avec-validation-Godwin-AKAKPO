import  express  from "express";
import {Request, Response} from "express";
import {sql_db_pool_promise} from "../db/mysql";
import {User} from "../models/User";
import {generateToken} from "../../security/jwt-auth";
const bcrypt = require('bcrypt');
import {authenticationfilter} from "../../security/auth-filter";
import {insertToken} from "../models/token-blacklist";
//Déclarons la constante de la route 

const authrouter = express.Router();

authrouter.post('/register', async(req: Request, res : Response)=>{
    const users = req.body as User
    //Véridifions si tous les champs requis ont été vraiment founi 
    if (!users.email || !users.password){
        res.status(400).json({message : "Veuillez remplir les champs email et password"});
        return;
    }
    //Vérifons si un utilisateur avec ce mail n'existe pas déjà 
    const sqlRequest1 = "SELECT * FROM users WHERE email = ?";
    const result1 = await sql_db_pool_promise.execute(sqlRequest1, [users.email])as any[];
    const user1 = result1[0]
    if (user1['length']> 0 ){
        res.status(401).json({message : "Ce mail est déjà associé à un compte "});
        return;
    }
    //Une fois les verifications préalables effectués enregistrons le users 
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(users.password, salt)
      
        const sqlRequest2 = "INSERT INTO users(email, password) VALUES (?,?)";
        const result2 = await sql_db_pool_promise.execute(sqlRequest2, [users.email, hashedPassword]);
        res.status(200).json({message : "L'utilisateur a été a été créer avec succès", });
        return;
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Erreur lors de la création du l'utilisateur"});
        return;
    }
});

authrouter.post('/admin/init-admin', async(req : Request, res : Response)=>{
    const users = req.body as User
    //Vérifions si tous les champs du body requis ont été rempli 
    if (!users.email || !users.password){
        res.status(400).json({message:"Veuillez remplir tous les champs"});
        return;
    }
    //Vérifions si l'on essaie vraiment de créer le premier admin
    const x = 'admin'
    const sqlRequest1 = "SELECT * FROM users WHERE role = ?";
    const result1 = await sql_db_pool_promise.execute(sqlRequest1, [x])as any[];
    const user = result1[0];
    if (user.length > 0){
        res.status(401).json({message : "L'admin par défaut existe déja dans la base de donnés",});
        return;
    }

    //Vérifions si aucun compte n'est associé au mail
    const sqlRequest2 = "SELECT * FROM users WHERE email = ?";
    const result2 = await sql_db_pool_promise.execute(sqlRequest2, [users.email])as any[];
    const Userr = result2[0];
    if (Userr.length > 0 ){
        res.status(401).json({message : "Ce mail est déjà associé à un compte ", result2});
        return;
    }
    //Une fois chacun de ses vérifications effectué créons le premier admin 
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(users.password, salt)
        const sqlRequest3 = "INSERT INTO users(email, password, role) VALUES (?,?,?)";
        const result3 = await sql_db_pool_promise.execute(sqlRequest3, [users.email, hashedPassword, 'admin'])as any[];
        res.status(200).json({message : "Le premier admin a été créer avec succès", result3});
        return;
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Erreur lors de la création du premier admin "});
        return;
    }
});

authrouter.post('/login', async(req : Request, res : Response)=>{
    const users = req.body as User
    //Vérifions si les champs email et password ont vraiment été rempli 
    if (!users.email || !users.password){
        res.status(400).json({message : "Veuillez bien remplir les champs email et password"});
        return;
    }
    try {
        //Vérifions si l'utilisateur squi essaie de se connester est vraiment dans notre base de donnés 
        const sqlRequest1 = "SELECT * FROM users WHERE email = ?";
        const result1 = await sql_db_pool_promise.execute(sqlRequest1, [users.email])as any[];
        const user1 = result1[0]
        if (user1['length'] == 0){
            res.status(404).json({message : "Aucun compte n'est associé à cet email"});
            return;
        }
         //Comparons mtn les mots de passe dans le cas ou l'utilisateurs est  b vraiment inscris dans notre bd
        const user = user1[0];
        if (!(await bcrypt.compare(users.password, user.password))){
            res.status(401).json({message : "Mot de passe incorrect "});
            return;
        }
        const token = generateToken(user.id)
        res.status(200).json({"token": token})
       

    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Erreur lors de la conneciond de l'utilisateurs"})
    }
}); 
//Deconnexion des utilisateurs 
authrouter.post("/logout",   async(req : Request, res : Response)=>{
    const authHeader = req.headers['authorization'] as string;
    const token = authHeader.replace("Bearer ", "");
    try {
        await insertToken(token);  // Ici on procède à  l'enregistrement du token dans la base de données précisement dans la table token_blacklist
       
        res.status(200).json({ message: "Déconnexion réussie" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la déconnexion" });
    }
   
})

export const apiauthrouter = authrouter;