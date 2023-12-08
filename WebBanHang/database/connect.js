const { MongoClient } = require('mongodb');



async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = "mongodb+srv://Zephia:sx9sIwU5e3WeDN0W@appbanhang.zsp1fr6.mongodb.net/?retryWrites=true&w=majority";


    const client = new MongoClient(uri);

    try {
        async function listDatabases(client) {
            databasesList = await client.db().admin().listDatabases();
            console.log("Databases:");
            databasesList.databases.forEach(db => console.log(` - ${db.name}`));
        };
        // Connect to the MongoDB cluster
        await client.connect();
        const connect = client.db("WebBanHang");
        const create = connect.createCollection("admins");

        await listDatabases(client);



    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);