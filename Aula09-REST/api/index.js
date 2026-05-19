const express = require("express")
const knex = require("knex")
const http_errors = require("http-errors")

const PORT = 8001
const HOSTNAME = "localhost"

const api = express()
api.use( express.json() )
api.use( express.urlencoded( { extended : true } ) )

const conn = knex( {
    client : "mysql" ,
    connection : {
        host : HOSTNAME ,
        user : "root" ,
        password : "" ,
        database : "loja_26_1"
    }
} ) 

api.get( "/" , (req, res, next) => {
    res.json( { resposta : 'Seja bem-vindo(a) à nossa API' } )
} )


api.get( "/product" , (req, res, next) => {
    conn("produto")
        .leftJoin("categoria" , "produto.codCategoria" , "=" , "categoria.id")
        .select("produto.*" , "categoria.nome AS cat")
        .then( dados => res.json( dados ) )
        .catch( next )
})

api.get( "/product/:idProd" , (req, res, next) => {
    const id = req.params.idProd
    conn("produto")
        .leftJoin("categoria" , "produto.codCategoria" , "=" , "categoria.id")
        .select("produto.*" , "categoria.nome AS cat")
        .where( "produto.id" , id )
        .first()
        .then( dados => res.json( dados ) )
        .catch( next )
})

api.get( "/categoty" , (req, res, next) => {
    conn("categoria")
        .then( dados => res.json( dados ) )
        .catch( next )
})

api.get( "/categoty/:idCat" , (req, res, next) => {
    const id = req.params.idcat
    conn("categoria")
        .where( "categoria.id" , id )
        .first()
        .then( dados => res.json( dados ) )
        .catch( next )
})



api.listen( PORT , ()=>{
    console.log( `Servidor rodando em: http://${HOSTNAME}:${PORT}`)
})
