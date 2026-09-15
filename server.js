import app from './src/app.js'
import dotenv from 'dotenv/config'

const PORT = process.env.PORT

app.listen(PORT, ()=>{
    console.log(`Le serveur tourne sur http://localhost:${PORT}`);
})
