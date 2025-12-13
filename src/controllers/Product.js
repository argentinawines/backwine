import { Product } from "../models/Product.js";
import { DBIMAGE } from "../models/DBIMAGE.js";


export const createProduct = async (req, res, next) => {
  try {
    const productCreated = await Product.create({ ...req.body });

    if (!productCreated)
      return res.status(401).send({ message: "the product was not created." });

    // Si vienen imágenes en req.body.images (array de objetos con url y main)
    console.log("req.body.images==>", req.body.image);
    
    if (req.body.image && Array.isArray(req.body.image)) {
      const imagePromises = req.body.image.map((img) =>
        DBIMAGE.create({
          cloudinaryID: img.public_id,
          productId: productCreated.id,
          url: img.url,
          main: img.main || true, // Si no se especifica, se asigna true por defecto
        })
      );
      await Promise.all(imagePromises);
    }

    res.status(200).send({
      message: "this product was created.",
      productCreated,
    });
  } catch (e) {
    next(e);
  }
};

export async function getProducts(req, res) {
  try {
    const products = await Product.findAll({
      include: {
        model: DBIMAGE,
         // opcional: usar `as` si definiste alias
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export const getProductID = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = await Product.findByPk(id, {
      include: {
        model: DBIMAGE,
        
      },
    });

    if (!productId)
      return res.status(404).send({ message: "the product was not found." });

    res.status(200).send({
      message: "The product was found",
      product: productId,
    });
  } catch (e) {
    next(e);
  }
};


export const editProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productEdited = await Product.findByPk(id);
    if (!productEdited)
      return res.status(404).send({ message: "the product was not found" });

    await productEdited.update({ ...req.body });

    // Si vienen imágenes en el body
    if (req.body.images && Array.isArray(req.body.images)) {
      const incomingImages = req.body.images;

      // Actualizar o crear imágenes
      for (const img of incomingImages) {
        const existingImage = await DBIMAGE.findByPk(img.cloudinaryID);
        if (existingImage) {
          await existingImage.update({
            url: img.url,
            main: img.main,
          });
        } else {
          await DBIMAGE.create({
            cloudinaryID: img.cloudinaryID,
            productId: id,
            url: img.url,
            main: img.main,
          });
        }
      }

      // OPCIONAL: eliminar imágenes que ya no están
      const existingImages = await DBIMAGE.findAll({ where: { productId: id } });
      const incomingIDs = incomingImages.map((img) => img.cloudinaryID);
      for (const dbImage of existingImages) {
        if (!incomingIDs.includes(dbImage.cloudinaryID)) {
          await dbImage.destroy();
        }
      }
    }

    res.status(201).send({ message: "the product was edited", product: productEdited });
  } catch (e) {
    next(e);
  }
};


export const productDelete = async (req, res) => {
  try {
    const { id } = req.params;

    // Primero eliminamos las imágenes relacionadas al producto
    await DBIMAGE.destroy({
      where: { productId: id },
    });

    // Luego eliminamos el producto
    const result = await Product.destroy({
      where: { id: id },
    });

    if (result === 0) {
      return res.status(404).json({ msg: "The product was not found" });
    }

    res.send({ msg: "Your product and associated images were deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "An error occurred while deleting the product" });
  }
};


export const getProductsByName = async (req, res) => {
  const name  = req.query.name
    
  
  try {
      const wines = await getProducts()

      if (name) {
          const winesName = dogs.filter(w => w.name.toLowerCase().includes(name.toLowerCase()))

          if(!winesName.length){
              return res.status(404).send({info: "I'm sorry I can't to find it"})
          }
          return res.send(winesName)
      }
      res.json(wines)
      
  } catch (error) {
      console.log(error, "falla el nombre")
  }

}

export const getProductsByQuery = async (req, res) => {
  const query = req.query.query || req.query.name;

  console.log("query", query);

  try {
    // Hacemos la consulta directa a la base de datos
    const allProducts = await Product.findAll({
      include: {
        model: DBIMAGE,
      },
    });

    if (query) {
      const filtered = allProducts.filter((product) => {
        const q = query.toLowerCase();

        return (
          product.name?.toLowerCase().includes(q) ||
          product.description?.toLowerCase().includes(q) ||
          product.category?.toLowerCase().includes(q) ||
          product.tag?.toLowerCase().includes(q) ||
          product.varietal?.toLowerCase().includes(q) ||
          product.brand?.toLowerCase().includes(q) ||
          product.store?.toLowerCase().includes(q)
        );
      });

      if (!filtered.length) {
        return res.status(404).send({ info: "I'm sorry I can't find it" });
      }

      return res.send(filtered);
    }

    res.json(allProducts);
  } catch (error) {
    console.log(error, "falla el nombre");
    res.status(500).send({ error: "Internal Server Error" });
  }
};

// export const createProduct = async (req, res, next) => {
//     console.log("req.body==>", req.body);
//     try {
//       const productCreated = await Product.create({ ...req.body });
//       if (!productCreated)
//         return res
//           .status(401)
//           .send({ message: "the product was not created." });
//       res.status(200).send({
//         message: "this product was created.",
//         productCreated,
//       });
//     } catch (e) {
//       next(e);
//     }
//   };
  



// export async function getProducts(req, res) {
//     try {
//       const products = await Product.findAll({
       
//       });
//       res.json(products);
//     } catch (error) {
//       res.status(500).json({
//         message: error.message,
//       });
//     }
//   }


//   export const getProductID = async (req, res, next) => {
//     try {
//       const { id } = req.params;
//       const productId = await Product.findByPk(id);
//       if (!productId)
//         return res
//           .status(404)
//           .send({ message: "the product was not found." });
//       res.status(200).send({
//         message: "The product was found",
//         product: productId,
//       });
//     } catch (e) {
//       next(e);
//     }
//   };

//   // edit product

//   export const editProduct = async (req, res, next) => {
//     try {
//       const { id } = req.params;
//       const productEdited = await Product.findByPk(id);
//       if (!productEdited)
//         return res
//           .status(404)
//           .send({ message: "the product was no found" });
//           productEdited?.update({ ...req.body });
//       res
//         .status(201)
//         .send({ message: "the product was edited", user: productEdited });
//     } catch (e) {
//       next(e);
//     }
//   };
  
//   // delete product
//   export const productDelete = async (req, res) =>{
//     try {
//         const {id} = req.params
//         const result = await Product.destroy({
//             where:{id : id },
//         })
//         console.log(result)
//         res.send({ msg: "your Product was deleted" });
  
//     } catch (error) {
//         return res
//         .status(404)
//         .json({ msg: "we cannot do it" });  
//     }
//   }

