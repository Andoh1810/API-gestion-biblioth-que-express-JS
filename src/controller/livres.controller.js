import prisma from "../lib/prisma.js";
import { httpCode } from "../static/httpCode.js";
import {v4 as uuidv4} from "uuid"

const livresController = {
    getBooks : async (req, res)=>{

        try {

            const livres = await prisma.livres.findMany({where: {disponible: true}})

            if(!livres){
                return res.status(httpCode.NOT_FOUND).json({message: "Aucun livre disponible!"})
            }

            return res.status(httpCode.OK).json({message: "Liste des livres disponibles", livres})

        } catch (error) {

            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({message: error.message})

        }

    },
    postBooks : async (req, res)=>{

        try {
            
            const {titre,auteur,description,ISBN} = req.body

            if(!titre || !auteur || !description || !ISBN){
                return res.status(httpCode.BAD_REQUEST).json({message: "Tous les champs sont requis!"})
            }

            const livre = await prisma.livres.findUnique({where: {ISBN}})

            if(livre){
                return res.status(httpCode.BAD_REQUEST).json({message: "Un livre avec cet ISBN existe déjà!"})
            }

            const newLivre = await prisma.livres.create({
                data: {
                    id: uuidv4(),
                    titre,
                    auteur,
                    description,
                    ISBN
                }
            })

            return res.status(httpCode.CREATED).json({message: "Livre créé avec succès!", newLivre})

        } catch (error) {

            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({message: error.message})

        }
        
    },
    putBooks : async (req, res)=>{
        
        try {
            
            const idLivre = req.params.id

            const livre = await prisma.livres.findUnique({where: {id: idLivre}})

            if(!livre){
                return res.status(httpCode.NOT_FOUND).json({message: "Livre introuvable!"})
            }

            const {titre,auteur,description,ISBN} = req.body

            const updateLivre = await prisma.livres.update({
                where: {id: idLivre},
                data: {
                    titre: titre ?? livre.titre,
                    auteur: auteur ?? livre.auteur,
                    description: description ?? livre.description,
                    ISBN: ISBN ?? livre.ISBN
                }
            })

            return res.status(httpCode.OK).json({message: "Livre modifié avec succès!", updateLivre})

        } catch (error) {

            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({message: error.message})

        }

    },
    deletBooks : async (req, res)=>{
        
        try {
            
            const idLivre = req.params.id

            const livre = await prisma.livres.findUnique({where: {id: idLivre}})

            if(!livre){
                return res.status(httpCode.NOT_FOUND).json({message: "Livre introuvable!"})
            }

            await prisma.livres.delete({where: {id:idLivre}})

            return res.status(httpCode.OK).json({message: `Livre avec l'id: ${idLivre} supprimé avec succès!`})

        } catch (error) {

            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({message: error.message})
   
        }

    }
}

export default livresController