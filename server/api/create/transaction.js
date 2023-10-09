// add route for create a transaction with prisma

// import prismas client
import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
    const transaction = await readBody(event);
    const prisma = new PrismaClient();

    const createTransaction = await prisma.transaction.createMany({
        data: transaction,
        skipDuplicates: true,
    })
    .catch((error) => {
        console.log('Erreur dans le strore Transaction:', error);
    });

    return createTransaction;
});
