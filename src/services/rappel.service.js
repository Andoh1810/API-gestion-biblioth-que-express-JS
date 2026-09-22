import prisma from "../lib/prisma.js";

const NOMBRE_JOUR = 5
const AVANT_LE = 1

const rappel = async () => {

    try {

        const empruntsEnCours = await prisma.emprunts.findMany({ 
            where: { statut: "EN_COURS", rappel: false }, 
            include: { user: true, livre: true } 
        })

        const dateActuelle = new Date()
        
        for (const emprunt of empruntsEnCours) {
            const dateEcheance = new Date(emprunt.dateEmprunt)
        }

    } catch (error) {
        console.error(error);
    }

}