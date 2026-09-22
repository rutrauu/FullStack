const express = require("express")
const knex = require("knex")
const http_errors = require("http-errors")
const cors = require("cors")

const PORT = 8001
const HOSTNAME = "localhost"

const api = express()
api.use(cors())
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
        .then( dados => {
            if( !dados ){
                return next( http_errors( 404 , "Produto não encontrado" ) )
            }
            res.json( dados )
        } )
        .catch( next )
})

api.get( "/category" , (req, res, next) => {
    conn("categoria")
        .then( dados => res.json( dados ) )
        .catch( next )
})

api.get( "/category/:idCat" , (req, res, next) => {
    const id = req.params.idCat
    conn("categoria")
        .where( "categoria.id" , id )
        .first()
        .then( dados => res.json( dados ) )
        .catch( next )
})

api.delete( "/category/:idCat" , (req, res, next) => {
    const id = req.params.idCat
    conn("categoria")
        .where( "id" , id )
        .delete()
        .then( dados => {
            if( !dados ){
                return next( http_errors( 404 , "Erro ao excluir"))
            }
            res.status(200).json( {
                resposta : "Categoria excluída"
            } )
        }  )
        .catch( next )
})

api.delete( "/product/:idProd" , (req, res, next) => {
    const id = req.params.idProd
    conn("produto")
        .where( "id" , id )
        .delete()
        .then( dados => {
            if( !dados ){
                return next( http_errors( 404 , "Erro ao excluir"))
            }
            res.status(200).json( {
                resposta : "Produto excluído"
            } )
        }  )
        .catch( next )
})


api.post( "/category" , (req, res, next) => {
    conn("categoria")
        .insert( req.body )
        .then( dados => {
            if( !dados ){
                return next( http_errors( 404 , "Erro ao inserir"))
            }
            res.status(201).json( {
                resposta : "Categoria Inserida" ,
                id : dados[0]
            } )
        } )
        .catch( next )
})

api.put( "/category/:idCat" , (req, res, next) => {
    const idCategoria = req.params.idCat
    conn("categoria")
        .where( "id" , idCategoria )
        .update( req.body )
        .then( dados => {
            if( !dados ){
                return next( http_errors( 404 , "Erro ao editar"))
            }
            res.status(200).json( {
                resposta : "Categoria editada" 
            })
        } )
        .catch( next )
})


api.post( "/product" , (req, res, next) => {
    const { nome, preco, codCategoria } = req.body
    const precoNumero = Number( preco )
    const categoriaId = Number( codCategoria )
    if( !nome || !Number.isFinite( precoNumero ) || precoNumero < 0 || !Number.isInteger( categoriaId ) || categoriaId < 1 ){
        return next( http_errors( 400 , "Nome, preço e categoria são obrigatórios" ) )
    }
    conn("produto")
        .insert( { nome, preco: precoNumero, codCategoria: categoriaId } )
        .then( dados => {
            if( !dados ){
                return next( http_errors( 404 , "Erro ao inserir"))
            }
            res.status(201).json( {
                resposta : "Produto Inserido" ,
                id : dados[0]
            } )
        } )
        .catch( next )
})

api.put( "/product/:idProd" , (req, res, next) => {
    const idProduto = req.params.idProd
    const { nome, preco, codCategoria } = req.body
    const precoNumero = Number( preco )
    const categoriaId = Number( codCategoria )
    if( !nome || !Number.isFinite( precoNumero ) || precoNumero < 0 || !Number.isInteger( categoriaId ) || categoriaId < 1 ){
        return next( http_errors( 400 , "Nome, preço e categoria são obrigatórios" ) )
    }
    conn("produto")
        .where( "id" , idProduto )
        .update( { nome, preco: precoNumero, codCategoria: categoriaId } )
        .then( dados => {
            if( !dados ){
                return next( http_errors( 404 , "Erro ao editar"))
            }
            res.status(200).json( {
                resposta : "Produto editado" 
            })
        } )
        .catch( next )
})

api.use( (erro, req, res, next) => {
    const status = erro.statusCode || erro.status || 500
    res.status( status ).json( {
        erro: status === 500 ? "Erro interno do servidor" : erro.message
    } )
} )

api.listen( PORT , ()=>{
    console.log( `Servidor rodando em: http://${HOSTNAME}:${PORT}`)
})
