import prisma from "../lib/prisma.js";
import { httpCode } from "../static/httpCode.js";
import { v4 as uuidv4 } from "uuid"
import emailService from "../services/email.service.js";

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

                const verifUserReservation = await prisma.emprunts.findFirst({where: {userId:utilisateurId}})

                if(verifUserReservation){
                    return res.status(httpCode.BAD_REQUEST).json({ message: "Cet Utilisateur a déjà emprunté ce livre!" })
                }

                const verifReservation = await prisma.notifications.findFirst({where: {userId:utilisateurId, livreId, statut:"NON_LU"}})
                if(verifReservation){
                    return res.status(httpCode.UNAUTHORIZED).json({message: "Livre indisponible, et réservation déjà faite par cet utilisateur"})
                }
                const reservation = await prisma.notifications.create({
                    data : {
                        id: uuidv4(),
                        userId: utilisateurId,
                        livreId,
                        statut: "NON_LU",
                        message: `L'utilisateur ${user.nom}, a réservé le livre ${livre.titre}`
                    }
                })
                return res.status(httpCode.UNAUTHORIZED).json({ message: "Ce livre n'est pas disponible!, réservation effectuée", reservation })
            }

            const listeEmprunts = await prisma.emprunts.findMany({where:{userId:utilisateurId, statut:"EN_COURS"}})

            if(listeEmprunts.length > 0){
                return res.status(httpCode.UNAUTHORIZED).json({message: "Vous avez déjà un emprunt en cours!"})
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

            //NOTIFIER LES UTILISATEURS AYANT RÉSERVÉ LE LIVRE
            const notifications = await prisma.notifications.findMany({where:{statut:"NON_LU", livreId : emprunt.livreId}})

            notifications.forEach(async (notif) =>{

                const user = await prisma.utilisateurs.findUnique({where: {id : notif.userId}})
                const livre = await prisma.livres.findUnique({where: {id: notif.livreId}})

                await prisma.notifications.update({
                    where:{id: notif.id},
                    data : {
                        statut: "LU",
                        message: `Notification envoyée à ${user.nom}`
                    }
                })

                emailService.notification(user.email, "Disponibilité du livre", `Bonjour ${user.nom}, le livre ${livre.titre} est disponible. Vous pouvez emprunter!`)
            })

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