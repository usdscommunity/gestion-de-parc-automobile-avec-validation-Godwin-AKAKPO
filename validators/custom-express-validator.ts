const {body} = require('express-validator');

//Récupérons l'année actuelle grace à la méthode getFullYear de l'objet Date()
const annee_courante = new Date().getFullYear();

export const ValidateCar =  [
    body('brand') 
        .notEmpty()
        .withMessage('La marque est requis')
        .isLength({min : 2 , max : 50})
        .withMessage("Le nom de la marque doit etre compris entre 2 et 5"),

    body('model')
        .notEmpty()
        .withMessage('Le modèle est requis.'),
    
    body('year')  
        .notEmpty()
        .withMessage("L' année est requis")
        .isInt({min : 1990, max : annee_courante + 1 })
        .withMessage(`L'année doit être entre 1900 et ${annee_courante + 1}.` ),
    
    body('price')
        .notEmpty()
        .withMessage("Le prix est requis")
        .isFloat({ min: 0 })
        .withMessage('Le prix doit être un nombre positif.')
]