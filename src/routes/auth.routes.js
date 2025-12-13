//auth.routes.js
import { Router } from "express";
import passport from "passport";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);



router.get("/auth/callback/google", (req, res, next) => {
 
  
    passport.authenticate("google", { session: false }, (err, usuario, info) => {
     
  
      if (err) {
        return res.status(500).json({ error: "Error interno en autenticación", detalles: err });
      }
  
      if (!usuario) {
        return res.status(401).json({ error: "Usuario no encontrado o no autorizado" });
      }
  
      // ✅ Éxito: devolver el usuario con su token
      if(usuario){
        const usuarioJson =JSON.stringify(usuario)
        console.log("Usuario autenticado:", usuarioJson);
        
        return res
        .set("Content-Type", "text/html")
        .send(`
          <script>
            const user = ${JSON.stringify(usuario)};
            window.opener.postMessage({ usuario: user }, "https://whineshipping.vercel.app");
            window.close();
          </script>
        `);
       
       
      }
     

    })(req, res, next); // ¡IMPORTANTE! Ejecutar el middleware
  });





// Si no se encontró el usuario o la aut

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Error al cerrar sesión");
    res.redirect("/");
  });
});

export default router;
