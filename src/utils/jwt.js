import jwt from "jsonwebtoken"


const jwt_secret = process.env.jwt_secret;



export const tokenSign = async (user, time) => {
  return jwt.sign(user, jwt_secret, { expiresIn: time });
};



export const tokenVerify = async (req,res,next) => {

    

    const bearerheader = req.headers["authorization"]; //1. tomamos el token desde el front.
    // console.log('**************');
    // console.log('token al back?==>>', bearerheader);
    // console.log('***************');
    if (typeof bearerheader !== "undefined") {
      let tokenWithoutbearer = null; 
      tokenWithoutbearer = bearerheader.split(" ")[1]; //2. le sacamos la palabra bearer
      token = tokenWithoutbearer; //3.guardamos en el token--> el token limpio

      //verificamos el token, si está bien continua con la ruta
      jwt.verify(token, jwt_secret, (err) => {
        if (err) {
          return res.status(401).send({ message: "El token ya no es valido." });
        } else {
          next();
        }
      });
      
    } else {
      return res.sendStatus(403); //forbidden (error 403)
    }
  
};

