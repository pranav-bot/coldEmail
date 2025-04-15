import { db } from "@/server/db"

await db.user.upsert({
    where: {
        id: "user_2vm63qumXfMymSyikc0d8s5zxFi"
    },
    create: {
        id: "user_2vm63qumXfMymSyikc0d8s5zxFi",
        emailAddress: "pranav23advani@gmail.com",
        firstName: "Pranav",
        lastName: "Advani",
        imageUrl: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydm02M25ndVRUejJwZG42MUVYWFNMTTdEbDAifQ"
    },
    update: {
        emailAddress: "pranav23advani@gmail.com",
        firstName: "Pranav",
        lastName: "Advani",
        imageUrl: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydm02M25ndVRUejJwZG42MUVYWFNMTTdEbDAifQ"
    }
})

console.log("User created/updated")
