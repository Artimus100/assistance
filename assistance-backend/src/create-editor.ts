import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient;

async function main(){
    
        // ... you will write your Prisma Client queries here
        const editor = await Prisma.editor.create({
          data:{
              username:"parthdhinge@gmail.com",
              password:"1234589",
              firstname:"parth",
              lastname:"dhinge"
          }
        })
        console.log(editor);
      
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