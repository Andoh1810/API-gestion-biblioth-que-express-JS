import prisma from "../lib/prisma.js";
import { httpCode } from "../static/httpCode.js";
import { v4 as uuidv4 } from "uuid"

const empruntsController = {

    emprunter: async (req, res) => {

        try {

            const { livreId, utilisateurId } = req.body

            const user = await prisma.utilisateurs.findUnique({ where: { id: utilisateurId } })
            const livre = await prisma.livres.findUnique({ where: { id: livreId } })

            if (!user) {
                return res.status(httpCode.NOT_FOUND).json({ message: "Utilisateur avec cet id introuvable!" })
            }

            if (!livre) {
                return res.status(httpCode.NOT_FOUND).json({ message: "Livre avec cet id introuvable!" })
            }

            if (!livre.disponible) {
                return res.status(httpCode.UNAUTHORIZED).json({ message: "Ce livre n'est pas disponible!" })
            }

            await prisma.livres.update({ where: { id: livreId }, data: { disponible: false } })

            const emprunt = await prisma.emprunts.create({
                data: {
                    id: uuidv4(),
                    userId: utilisateurId,
                    livreId: livreId,
                    statut: "EN_COURS"
                }
            })

            return res.status(httpCode.CREATED).json({message: "Livre emprunté avec succès", emprunt})

        } catch (error) {
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({ message: error.message })
        }

    },

    retourner: async (req, res) => {

        try {
            
            const id_emprunt = req.params.id

            const emprunt = await prisma.emprunts.findUnique({where: {id: id_emprunt}})

            if(!emprunt){
                return res.status(httpCode.NOT_FOUND).json({message: "Emprunt introuvable!"})
            }

            const livre = await prisma.livres.update({where: {id: emprunt.livreId}, data:{disponible: true}})

            const dateRemise = new Date()
            const remise = await prisma.emprunts.update({where: {id:id_emprunt}, data:{statut:"TERMINE", dateRetour: dateRemise}})

            return res.status(httpCode.OK).json({message: "Livre rendu avec succès!", livre: livre, remise: remise})

        } catch (error) {
            
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({ message: error.message })

        }

    },

    historique: async (req, res) => {

        try {

            const idUser = req.params.id

            const user = await prisma.utilisateurs.findUnique({where: {id:idUser}})
            
            if(!user){
                return res.status(httpCode.NOT_FOUND).json({message: "Utilisateur avec id dans params introuvabe!"})
            }

            const listeEmprunts = await prisma.emprunts.findMany({where:{userId:idUser}})

            return res.status(httpCode.OK).json({message: "Liste des emprunts: ", listeEmprunts})

        } catch (error) {
         
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({ message: error.message })

        }

    }

}

export default empruntsController