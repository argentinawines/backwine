import { User } from "../models/User.js";
import { hashPassword, checkPassword } from "../utils/handlePassword.js";
import { Admin  } from "../models/Admin.js"
// import { tokenSign } from "../utils/"



//create user
export const createUser = async (req, res, next) => {
    console.log("body create user===>>>", req.body);
    try {
      const hashedPassword = await hashPassword(req.body.password);
      const userCreate = await User.create({
        ...req.body,
        password: hashedPassword,
      });
  
      if (!userCreate)
        return res.status(418).send({ message: "the user cannot be created" });
      res.status(201).send({ message: "User was Created" });
    } catch (e) {
      next(e);
    }
  };

    //create admin
    export const createAdmin = async (req, res, next) => {
        try {
          const hashedPassword = await hashPassword(req.body.password);
          console.log(req.body, "body");
          const newAdmin = await Admin.create({
            
            ...req.body,
            
            password: hashedPassword,
          });
          
          
          if (!Admin)
            return res
              .status(401)
              .send({ message: "the Admin cannot be created" });
          res
            .status(200)
            .send({ message: "The Admin was Created", newAdmin });
        } catch (e) {
          next(e);
          console.log("error==>", e);
          
        }
      };

        //login

    export const login = async (req, res, next) => {
            try {
              const { email, password } = req.body;
              console.log("body==>", req.body);
            
              const responseUser = await User.findByPk(email, {
                // include: { model: Turn },
              });
             
              const respDBadmin = await Admin.findByPk(email);
            
          
              //no response
              if (!responseUser && !respDBadmin )
                return res
                  .status(401)
                  .send({ message: "no user with this email." });
              let respDB;
              if (responseUser) respDB = responseUser;
              if (respDBadmin) respDB = respDBadmin;
           
              const passwordCorrect = await checkPassword(
                password,
                respDB.password
              );
          
              //si el password es correct token
              if (passwordCorrect) {
                // const tokenDeAcceso = await tokenSign(respDB.dataValues, "10h");
                res.status(200).send({ 
                    user: respDB, 
                    // token: tokenDeAcceso 
                });
              } else {
                //password incorrecto
                res.status(401).send({
                  message: `the user ${email} is not authorized.`,
                });
              }
            } catch (e) {
              next(e);
            }
          };

      export const getUsers = async (req, res, next) => {
            try {
              const users = await User.findAll({});
              if (users.length === 0)
                return res
                  .status(404)
                  .send({ message: "No users" });
              res.status(200).send(users);
            } catch (e) {
              next(e);
            }
          };

          export const getAdmin = async (req, res, next) => {
            console.log("req.body==>", req.body);
            
            
           const pk= req.body.email
            console.log("pk==>", pk);

            try {
              const users = await Admin.findByPk(pk, );
              if (!users)

                return res

                  .status(404)
                  .send({ message: "No admin" });
                  console.log("users==>", users);
                  
              res.status(200).send(users);
            } catch (e) {
              next(e);
            }
          };