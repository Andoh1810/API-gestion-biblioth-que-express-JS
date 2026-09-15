import express from 'express'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import userRoutes from './routes/user.routes.js'
import livresRoutes from './routes/livres.routes.js'
import empruntsRoutes from './routes/emprunts.routes.js'

const limit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {error: "Trop de requettes pour cette adresse IP"}
})

const app = express()

//middlewares
app.use(express.json())
app.use(morgan('tiny'))
app.use(limit)

//routes
app.use("/users", userRoutes)
app.use(livresRoutes)
app.use(empruntsRoutes)

export default app