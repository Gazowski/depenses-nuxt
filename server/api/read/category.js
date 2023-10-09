// route to get all categories

// import prismas client
import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
    const prisma = new PrismaClient();

    const categories = await prisma.category.findMany()
    .catch((error) => {
        console.log(error);
    });

    return categories;
});