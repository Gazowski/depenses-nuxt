// add a route to update categories
// import prismas client
import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
    const category = await readBody(event);
    const prisma = new PrismaClient();
    const updateCategory = await prisma.category.update({
        where: {
            id: category.id,
        },
        data: category,
    })
    .catch((error) => {
        console.log(error);
    });

    return updateCategory;
});