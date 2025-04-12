import { db } from "@/server/db"

await db.user.create({
    data: {
        email: "test@test.com",
        fistName: "Test",
        lastName: "Test",
        imageUrl: "https://example.com/test.png",
    },
})

console.log("User created")
