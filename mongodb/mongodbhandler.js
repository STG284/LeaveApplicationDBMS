const { MongoClient } = require("mongodb");
const utils = require("../utils/utils")

// const dbName = "LeaveApplicationDBMS"
const dbName = "testDB"
const url = `mongodb://localhost:27017/${dbName}`;



async function updateEmployeeDetails(EID, updateDict) {
    // EID must not be null,
    // updateDict can have one or all of the following keys=
    //      {email, website, researchInterests, background, publications, courses}
    //  and publications, courses is a list containing json objects
    //      all others are text fields
    

    const mongoclient = new MongoClient(url, {
        useUnifiedTopology: true
    });


    try {

        await mongoclient.connect()

        let collection = mongoclient.db().collection("Employee");

        // this option instructs the method to create a document if no documents match the filter
        const options = { upsert: true };

        const filter = { eid: EID };
        const updateDoc = {
            $set: updateDict
        }

        // console.log("\n update value: ", updateDoc, "\n")

        await collection.updateOne(filter, updateDoc, options)
        
    } catch (error) {
        console.error("Error: \n", error)
        throw error

    } finally {

        await mongoclient.close()
    }

}

async function getEmployeeDetails(EID) {
    // EID must not be null,

    const mongoclient = new MongoClient(url, {
        useUnifiedTopology: true
    });


    try {

        await mongoclient.connect()

        let collection = mongoclient.db().collection("Employee");
        let options = {
            // hide _id from outputs
            projection: {_id:0},
            // to create a document if no documents match the filter
            upsert: true
        }
        
        // create employee document of not found!
        await collection.findOneAndUpdate({ eid: EID }, {$set:{eid: EID}}, options)
        
        let results =  await collection.findOne({ eid: EID }, options)

        // console.log("results:", results)

        return results

    } catch (error) {
        console.error("Error: \n", error)
        throw error

    } finally {

        await mongoclient.close()
    }

}


module.exports = {
    updateEmployeeDetails: updateEmployeeDetails,
    getEmployeeDetails: getEmployeeDetails
}