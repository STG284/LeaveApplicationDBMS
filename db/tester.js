const {Pool, Client} = require('pg')
const secrets = require('../secrets')


async function performTest1(){
    let finalres = null;
    try{
        let client = new Client(
            secrets.pgsql
        )        
        await client.connect();

        res = await client.query('SELECT * from Employee2');
        console.log("received results = ", res);
        client.end();
        finalres = res;
    }catch(e){
        console.error("DBMS error", e);
        finalres = -1;
    }
    return finalres;
}

async function performTest2(){
    let finalres = null;
    try{
        let client = new Client(
            secrets.pgsql
        )        
        await client.connect();

        res = await client.query('SELECT * from Employee');
        console.log("received results = ", res);
        client.end();
        finalres = res;
    }catch(e){
        console.error("DBMS error", e);
        finalres = -1;
    }
    return finalres;
}

async function performTest3(){
    return "todo"
}

module.exports = {
    performTest1: performTest1,
    performTest2: performTest2,
    performTest3: performTest3
}


// performTest1();