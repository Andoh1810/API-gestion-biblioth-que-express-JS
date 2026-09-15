import empruntsController from "../controller/emprunts.controller.js";
import { Router } from "express";

const empruntsRoutes = Router()

const patternRoutes = {
    emprunter: "/loans",
    retourner: "/loans/:id/return",
    hitoriqueEmprunts: "/loans/user/:id"
}

empruntsRoutes.post(patternRoutes.emprunter, empruntsController.emprunter)

empruntsRoutes.put(patternRoutes.retourner, empruntsController.retourner)

empruntsRoutes.get(patternRoutes.hitoriqueEmprunts, empruntsController.historique)

export default empruntsRoutes