import { User } from "../models/User.js";
import { hashPassword, checkPassword } from "../utils/handlePassword.js";
import { Admin  } from "../models/Admin.js"
import { tokenSign } from "../utils/jwt.js";



//create user
export const createUser = async (req, res, next) => {
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
            .send({
              message: "The Admin was Created",
              admin: { email: newAdmin.email, rol: newAdmin.rol },
            });
        } catch (e) {
          next(e);
          
        }
      };

        //login

    export const login = async (req, res, next) => {
            try {
              const { email, password } = req.body;
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
                const token = await tokenSign(
                  { email: respDB.email, role: respDBadmin ? "admin" : "user" },
                  "10h"
                );
                res.status(200).send({
                    user: { email: respDB.email, rol: respDB.rol },
                    token,
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
            try {
              const email = String(req.body?.email || "").trim().toLowerCase();
              const password = String(req.body?.password || "");
              const admin = await Admin.findByPk(email);
              if (!admin || !(await checkPassword(password, admin.password))) {
                return res.status(401).send({ message: "Invalid administrator credentials." });
              }

              const token = await tokenSign({ email: admin.email, role: "admin" }, "10h");
              return res.status(200).send({
                email: admin.email,
                rol: admin.rol || "admin",
                token,
              });
            } catch (e) {
              next(e);
            }
          };
