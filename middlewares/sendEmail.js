const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {
  try {
    var transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "1c2f8751c1d58c",
        pass: "afd487621a2cf5"
      }
    });
  
    const mailOptions = {
      from: process.env.SMPT_MAIL,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
  
    await transport.sendMail(mailOptions);
  } catch (error) {
    console.log(`someting went wrong: ${error.message}`)
     return res.status(500).json({message:error.message})
  }
};
