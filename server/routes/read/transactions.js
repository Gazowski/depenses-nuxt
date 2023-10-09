// get all transactions
// import prismas client
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv"

export default defineEventHandler(async (event) => {
    dotenv.config();
    console.log('--------------------------')
    console.log('process.env.DATABASE_URL', process.env.DATABASE_URL)
    console.log('--------------------------')
    const prisma = new PrismaClient();

    // get params from url
    let params = await readBody(event);

    // get all transactions that match the query (check params in url)
    const transactions = await prisma.transaction.findMany({
        where: {
            ...params
        }
    })


    return transactions;
}
);
