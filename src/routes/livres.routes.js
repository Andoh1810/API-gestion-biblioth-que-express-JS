import livresController from "../controller/livres.controller.js";
import { Router } from "express";

const livresRoutes = Router()

const patternRoutes = {
    Books : "/books",
    BooksId: "/books/:id"
}

livresRoutes.get(patternRoutes.Books, livresController.getBooks)

livresRoutes.post(patternRoutes.Books, livresController.postBooks)

livresRoutes.put(patternRoutes.BooksId, livresController.putBooks)

livresRoutes.delete(patternRoutes.BooksId, livresController.deletBooks)

export default livresRoutes