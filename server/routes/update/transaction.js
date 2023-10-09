// add a route to update a transaction
// import prismas client
import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
    const transaction = await readBody(event);
    const prisma = new PrismaClient();

    const updateTransaction = await prisma.transaction.update({
        where: {
            id: transaction.id,
        },
        data: transaction,
    })
    .catch((error) => {
        console.log(error);
    });

    return updateTransaction;
});