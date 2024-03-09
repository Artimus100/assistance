import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient;

async function main(){
    const host = await Prisma.host.create({
        data:{
            username:"sdvfd",
            password:"dsf",
            firstname:"",
            lastname:""
        }
        
    })
    console.log(host);
}

main()
.then(async()=>{
    await Prisma.$disconnect()
  })
  .catch(async(e)=>{
    console.log(e)
    await Prisma.$disconnect()
    process.exit(1)
  })