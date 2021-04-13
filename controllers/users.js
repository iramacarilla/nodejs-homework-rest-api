
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const { findById, findByEmail,  updateToken, updateUser, updateAvatar, verifyUser, sendEmail } = require('../model/users');
const User = require('../schemas/userSchema');
const {Subscription} = require('../helpers/constans')
const {HttpCode} = require('../helpers/constans');
const jimp = require('jimp');
const  path  = require('path');
const fs = require('fs').promises;
const { nanoid } = require('nanoid');
const sgMail = require('@sendgrid/mail')
const Mailgen = require('mailgen')

const SECRET_KEY = process.env.SECRET_KEY
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY

const storageDir = path.join(process.cwd(), 'public', 'avatars')

/*const createTemplate = async (req) => {
  const {verifyToken, username} = req.body
  const mailGenerator = await new Mailgen({
    theme: 'default',
    product: {
      name: 'ContactsSystem',
      link: 'https:/localhost:3000/'
    }
  });
  
  const email = await {
    body: {
      name: username,
      intro: 'Welcome to ContactsSystem! We\'re very excited to have you on board.',
      action: {
        instructions: 'To get started with ContactsSystem, please click here:',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'Confirm your account',
          link: `https:/localhost:3000/api/users/verify/${verifyToken}`
        }
      },
      outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
  };
  const emailBody = await mailGenerator.generate(email);
  return emailBody
}

const sendEmail = async (req) => {
  const {verifyToken, email, username} = req.body
  const emailBody = await createTemplate(verifyToken, email, username)
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: email,
    from: 'noreple@contactssystem.com', // Use the email address or domain you verified above
    subject: 'Sending with Twilio SendGrid is Fun',
    html: emailBody,
  };
  
  sgMail
  .send(msg)
  /*.then(() => {}, error => {
    console.error(error);
    
    if (error.response) {
      console.error(error.response.body)
    }
  });*/
//}
  const registration = async (req, res, next) => {
    const {  username, email,password } = req.body
    const user = await findByEmail( email )
    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: 'error',
        code: HttpCode.CONFLICT,
        message: 'Email is already in use',
        data: 'Conflict',
      })
    }
    try {
      const verifyToken =  nanoid()
      try {
         sendEmail({verifyToken, username, email})
        
      }
      catch(error) {
        throw Error('503/Unavailable')
      }
    const newUser =  new User({ username, email, verifyToken })
    newUser.setPassword(password)
    await newUser.save()
      res.status(HttpCode.CREATED).json({
        status: 'success',
        code: HttpCode.CREATED,
        data: {
           email: newUser.email,
           subscription: newUser.subscription,
           avatarURL: newUser.avatarURL,
           //newUser,
          message: 'Registration successful'
        },
      })
    } catch (error) {
      next(error)
    }
  }

  const login = async (req, res, next) => {
      try {
    const { email, password } = req.body
    const user = await findByEmail(email)
    if (!user || !(await user.validPassword(password)) || !user.verify) {
      return res.status(HttpCode.BAD_REQUEST).json({
        status: 'error',
        code: HttpCode.BAD_REQUEST,
        message: 'Incorrect login or password',
        data: 'Bad request',
      })
    }
  
    else { 
    const id = user.id
    const payload = {id}
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' })
    await updateToken(id, token);
    res.json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        token,
        user: {
            email: user.email,
            subscription: user.subscription
        }
      },
    })
  }}
  catch(e)
  {next(e)}
  }
  
const logout = async (req, res, next) => {
   const id = req.user.id
   const user = await updateToken(id, null)
 return res.status(HttpCode.NO_CONTENT).json({ 
    
 })}


const current = async (req, res, next) => {
    try {
    const { id, email, subscription } = req.user;
    console.log(id);
    const user = await findById(id);
    if (!user) {
    return res.status(HttpCode.UNAUTHORIZED).json({
    status: 'error',
    code: HttpCode.UNAUTHORIZED,
    message: 'Not authorized',
    });
    }
      
return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    data: {
        email,
        subscription,
        },
    });
    } catch (err) {
          next(err);
    }
}

const updateSub =  async (req, res, next) => {
  try {
    const {subscription} = req.body;
    const subOption = Object.values(Subscription)
    console.log(subOption)
    if (!subOption.includes(subscription)) {
      return res.status(HttpCode.BAD_REQUEST).json({
        status: 'error',
        code: HttpCode.BAD_REQUEST,
        message:`Invalid subscription. Choose one of folowing:${subOption}`
    })}
    const user  = await updateUser( req.user.id, subscription);
       return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        message:`Subscription changed to ${subscription}`,
        data: {
          email: user.email,
          subscription: subscription,
        },
    })
 } catch (error) {
   next(error)
 }
}

const avatars = async (req, res, next) => {
  try {
  const temPathFile = req.file.path
  const id = req.user.id
  const img = await jimp.read(temPathFile)
  await img.autocrop().cover(250, 250, jimp.HORIZONTAL_ALIGN_CENTER || jimp.VERTICAL_ALIGN_MIDDLE).writeAsync(temPathFile)
  const pathFile =  path.join(storageDir, `${id}-${req.file.originalname}`)
  await fs.rename(temPathFile, pathFile)
  const url = await updateAvatar(id, pathFile)
  return res.status(HttpCode.OK).json({ 
  status: 'success',
  code: HttpCode.OK,
  message: 'Your avatar is updated',
  data: {
     alatarURL: url.avatarURL
      },
  })
} 
catch(error)
{ 
  next(error)
}
}

const verify = async (req, res, next) => {
  try {
    //const { id, email, subscription } = req.user;
    //console.log(id);
    const result = await verifyUser(req.params);
    if (result)
    {
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
          message: 'Verification successful'
          },
      });
    }
    return res.status(HttpCode.UNAUTHORIZED).json({
    status: 'error',
    code: HttpCode.UNAUTHORIZED,
    message: 'Your verification token is not valid',
    });
    } catch (err) {
          next(err);
    }
}

const resending = async (req, res, next) => {
  try {
    const  {email}  = req.body;
    //console.log(id);
    const user = await findByEmail(email)
    //const result = await sendEmail({verifyToken, username, email})
    if (email )
    { if(!user.verify)
      {
        console.log(!user.verify);
        console.log(user);

        await sendEmail({verifyToken: user.verifyToken, username: user.username, email})
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
          message: 'Verification email sent'
          },
      });}
      return res.status(HttpCode.BAD_REQUEST).json({
        status: 'error',
        code: HttpCode.BAD_REQUEST,
        message: 'Verification has already been passed',
        });
    }
    return res.status(HttpCode.BAD_REQUEST).json({
    status: 'error',
    code: HttpCode.BAD_REQUEST,
    message: 'missing required field email',
    });
    } catch (err) {
          next(err);
    }
}


module.exports = {
 login,
 registration,
 logout,
 current,
 updateSub,
 avatars,
 verify,
 resending
}