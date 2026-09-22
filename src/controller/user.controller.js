import { httpCode } from "../static/httpCode.js";
import prisma from "../lib/prisma.js";
import jwt from 'jsonwebtoken'
import {v4 as uuidv4} from 'uuid'
import bcrypt from 'bcrypt'
import emailService from "../services/email.service.js";
import qrcode from "qrcode"

//GENERATION DE L'ACCESS TOKEN

const generationAccessToken =(user)=>{

    return jwt.sign(
        {
            id: user.id
        },
        process.env.CLE_ACCESS_TOKEN,
        {expiresIn: '8m'}
    )

}

//GENERATION DU REFRESH TOKEN

const generationRefreshToken =(user)=>{

    return jwt.sign(
        {
            id: user.id
        },
        process.env.CLE_REFRESH_TOKEN,
        {expiresIn: '8d'}
    )

}

const userController = {

    signup : async (req, res)=>{

        try {
            const {nom, email, motDePasse} = req.body

            if(!nom || !email || !motDePasse){
                return res.status(httpCode.BAD_REQUEST).json({message: "Tous les champs sont requis!"})
            }

            const emailExist = await prisma.utilisateurs.findUnique({where: {email}})

            if(emailExist){
                return res.status(httpCode.BAD_REQUEST).json({message: "L'email existe déjà!"})
            }

            const haspassword = await bcrypt.hash(motDePasse, 10)
            const newUser = await prisma.utilisateurs.create({
                data: {
                    id: uuidv4(),
                    nom,
                    email,
                    motDePasse: haspassword
                }
            })

            //Creation du qrcode

            const imageQr = await qrcode.toBuffer(`NOM: ${newUser.nom}, EMAIL: ${newUser.email}`)

            emailService.envoieQrcode(email,"Vos inforamtions","Connexion réuissie, scannez pour voir vos infos",`<img src="cid:qrcode" alt='image'/>`,imageQr)

            return res.status(httpCode.CREATED).json({message:"utilisateur créé avec succès!", newUser})

        } catch (error) {
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({erreur: error.message})
        }

    },

    login : async (req, res)=>{

        try {

            const {email, motDePasse} = req.body

            if(!email || !motDePasse){
                return res.status(httpCode.BAD_REQUEST).json({message: "Tous les champs sont requis!"})
            }

            const user = await prisma.utilisateurs.findUnique({where: {email}})

            if(!user){
                return res.status(httpCode.BAD_REQUEST).json({message: "email ou mot de passe invalide!"})
            }

            const verifPassword = bcrypt.compare(motDePasse, user.motDePasse)

            if(!verifPassword){
                return res.status(httpCode.BAD_REQUEST).json({message: "email ou mot de passe invalide!"})
            }

            
            const accessToken = generationAccessToken(user)
            const refreshToken = generationRefreshToken(user)
            
            await prisma.utilisateurs.update({
                where: {email},
                data: {
                    refreshToken: refreshToken
                }
            })

            return res.status(httpCode.OK).json({message: "utilisateur connecté avec succès!", refreshToken: refreshToken, accessToken: accessToken})
            
        } catch (error) {
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({erreur: error.message})
        }
        
    },

    logout : async (req, res)=>{

        try {
            const iduser = req.user.id
            const user = await prisma.utilisateurs.findUnique({where: {id: iduser}})
            await prisma.utilisateurs.update({where: {id: iduser}, data:{refreshToken: null}})

            return res.status(httpCode.OK).json({message: `Déconnexion de ${user.nom} reussi `})
        } catch (error) {
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({erreur: error.message})
        }
        
    },

    getUser : async (req, res)=>{
        
        try {
            const iduser = req.params.id
            const user = await prisma.utilisateurs.findUnique({where: {id: iduser}})

            if(!user){
                return res.status(httpCode.NOT_FOUND).json({message: "utilisateur introuvable"})
            }

            return res.status(httpCode.OK).json({message: "Utilisateur trouvé!", user})

        } catch (error) {
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({erreur: error.message})
        }

    },

    putUser : async (req, res)=>{

        try {
            const iduser = req.params.id
            const {nom, email, motDePasse} = req.body
            const user = await prisma.utilisateurs.findUnique({where: {id : iduser}})

            if(!user){
                return res.status(httpCode.NOT_FOUND).json({message: "Utilisateur introuvable"})
            }

            const updateUser = await prisma.utilisateurs.update({
                where: {id:iduser},
                data : {
                    nom: nom ?? user.nom,
                    email: email ?? user.email,
                    motDePasse: motDePasse ?? user.motDePasse
                }
            })

            return res.status(httpCode.OK).json({message : "Utilisateur modifié avec succès!", updateUser})

        } catch (error) {
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({erreur: error.message})
        }
        
    },

    deleteUser : async (req, res)=>{
        try {
            const iduser = req.params.id
            const user = await prisma.utilisateurs.findUnique({where: {id:iduser}})

            if(!user){
                return res.status(httpCode.NOT_FOUND).json({message: "Utilisateur introuvable!"})
            }
 
            await prisma.utilisateurs.delete({where: {id:iduser}})

            return res.status(httpCode.OK).json({message: "Utilisateur supprimé avec succès!", user})
        } catch (error) {
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({erreur: error.message})
        }
    }

}

export default userController