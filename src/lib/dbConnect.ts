import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection : ConnectionObject = {};

async function dbConnect() : Promise<void> {
    if(connection.isConnected){
        console.log("Already connected to database");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {});
        console.log("DB: \n", db);
        connection.isConnected = db.connections[0].readyState;
        console.log("DB Connected Successfully!!!");
        
    } catch (error: any) {
        console.log("Detabase Connection failed !!!: \n", error)
        process.exit();
    }
}

export default dbConnect;