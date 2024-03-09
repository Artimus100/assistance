import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(){
  
  const user = await prisma.editor.upsert({
    where:{
      username:'test@test.com',
    },
    update: {},
    create:{
        username:'test1@test.com',
        firstname: 'test1 Editor',
        lastname: 'test1 editor',
        password: 'davrqcr13fq4wrfcqefqwe'
    },
    
  });
  console.log({user});
}
main()
 .then(async()=>{
    await prisma.$disconnect()
 })
 .catch(async(e)=>{
   console.log(e)
   await prisma.$disconnect()
   process.exit(1)
 })