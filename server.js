const app = require("./app");
const { connectDatabase } = require("./config/database");
const cloudinary = require("cloudinary");
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});




const PORT = process.env.PORT || 4000;

app.get("/",(req,res)=>{
   res.send({message:"Api is working.."})
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
