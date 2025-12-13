import axios from "axios";
import { wordpressDB } from "../config/wordpressConection.js";

/**
 * Sube una imagen a tu backend desde una URL externa.
 */
const uploadFromUrlToBackend = async (url) => {
  try {
    const response = await axios.post("http://localhost:3001/cloudinary", {
      imageUrl: url,
    });
    return response.data[0]; // asumimos que siempre se sube una imagen
  } catch (error) {
    console.error("Error al subir imagen al backend desde URL:", error.message);
    return null;
  }
};

export const migrateProducts = async (req, res) => {
  try {
    const [products] = await wordpressDB.execute(`
      SELECT 
        p.ID AS id_producto,
        MAX(p.post_title) AS nombre,
        MAX(p.post_content) AS detalle,
        MAX(CASE WHEN pm.meta_key = '_price' THEN CAST(pm.meta_value AS DECIMAL(10,2)) END) AS precio,
        MAX(
          REPLACE(
            REPLACE(img.guid, 'http://argentinawineshipping.desprogramarte.org', 'https://vinos.sistemas4b.com'),
            'https://argentinawineshipping.com',
            'https://vinos.sistemas4b.com'
          )
        ) AS imagen_url,
        GROUP_CONCAT(DISTINCT CASE WHEN tt.taxonomy = 'product_cat' THEN t.name END) AS categorias,
        GROUP_CONCAT(DISTINCT CASE WHEN tt.taxonomy = 'product_tag' THEN t.name END) AS tags
      FROM wpqx_posts p
      LEFT JOIN wpqx_postmeta pm ON pm.post_id = p.ID
      LEFT JOIN wpqx_postmeta thumb ON thumb.post_id = p.ID AND thumb.meta_key = '_thumbnail_id'
      LEFT JOIN wpqx_posts img ON img.ID = thumb.meta_value AND img.post_type = 'attachment'
      LEFT JOIN wpqx_term_relationships tr ON tr.object_id = p.ID
      LEFT JOIN wpqx_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
      LEFT JOIN wpqx_terms t ON t.term_id = tt.term_id
      WHERE p.post_type = 'product' AND p.post_status = 'publish'
      GROUP BY p.ID;
    `);

    let migratedCount = 0;

    for (const prod of products) {
      let imageCloudinary = null;

      try {
        const uploadedImage = await uploadFromUrlToBackend(prod.imagen_url);
        if (uploadedImage) {
          imageCloudinary = {
            url: uploadedImage.secure_url,
            public_id: uploadedImage.public_id,
            main: true,
          };
        }
      } catch (err) {
        console.warn(`No se pudo subir imagen de ${prod.nombre}`);
      }

      const payload = {
        name: prod.nombre,
        description: prod.detalle,
        price: prod.precio,
        category: prod.categorias,
        tag: prod.tags,
        image: imageCloudinary ? [imageCloudinary] : [],
      };

      try {
        await axios.post("http://localhost:3001/product", payload);
        migratedCount++;
      } catch (err) {
        console.error(`Error migrando ${prod.nombre}:`, err.message);
      }
    }

    res.status(200).json({
      message: "Migración completada con éxito",
      cantidad_migrados: migratedCount,
    });
  } catch (error) {
    console.error("Error migrando productos:", error);
    res.status(500).json({ message: "Falló la migración" });
  }
};

export const migrateProductsOffers = async (req, res) => {
  try {
    const [products] = await wordpressDB.execute(`
      SELECT 
        p.ID AS id_producto,
        MAX(p.post_title) AS nombre,
        MAX(p.post_content) AS detalle,
        MAX(CASE WHEN pm.meta_key = '_price' THEN CAST(pm.meta_value AS DECIMAL(10,2)) END) AS precio,
        MAX(
          REPLACE(
            REPLACE(img.guid, 'http://argentinawineshipping.desprogramarte.org', 'https://vinos.sistemas4b.com'),
            'https://argentinawineshipping.com',
            'https://vinos.sistemas4b.com'
          )
        ) AS imagen_url,
        GROUP_CONCAT(DISTINCT CASE WHEN tt.taxonomy = 'product_cat' THEN t.name END) AS categorias,
        GROUP_CONCAT(DISTINCT CASE WHEN tt.taxonomy = 'product_tag' THEN t.name END) AS tags
      FROM wpqx_posts p
      LEFT JOIN wpqx_postmeta pm ON pm.post_id = p.ID
      LEFT JOIN wpqx_postmeta thumb ON thumb.post_id = p.ID AND thumb.meta_key = '_thumbnail_id'
      LEFT JOIN wpqx_posts img ON img.ID = thumb.meta_value AND img.post_type = 'attachment'
      LEFT JOIN wpqx_term_relationships tr ON tr.object_id = p.ID
      LEFT JOIN wpqx_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
      LEFT JOIN wpqx_terms t ON t.term_id = tt.term_id
      WHERE p.post_type = 'product'
        AND p.post_status = 'publish'
        AND p.post_title IN (
          'Catena Zapata Tasting',
          'Toasting with Enemigo',
          'Malbec Great Selection',
          'By James Suckling with Love',
          'Malbec World Day Celebration',
          'In love with Malbec',
          'Tasting Escorihuela'
        )
      GROUP BY p.ID;
    `);

    const duplicatedProducts = [];
    const savedProducts = [];

    for (const prod of products) {
      // Verificar si ya existe un producto con ese nombre en la tabla product
      const [existing] = await localDB.execute(
        `SELECT * FROM product WHERE name = ? LIMIT 1`,
        [prod.nombre]
      );

      if (existing.length > 0) {
        duplicatedProducts.push(prod.nombre);
        continue; // Salta al siguiente producto
      }

      let imageCloudinary = null;

      try {
        const uploadedImage = await uploadFromUrlToBackend(prod.imagen_url);
        if (uploadedImage) {
          imageCloudinary = {
            url: uploadedImage.secure_url,
            public_id: uploadedImage.public_id,
            main: true,
          };
        }
      } catch (err) {
        console.warn(`No se pudo subir imagen de ${prod.nombre}`);
      }

      const payload = {
        name: prod.nombre,
        description: prod.detalle,
        price: prod.precio,
        category: prod.categorias,
        tag: prod.tags,
        image: imageCloudinary ? [imageCloudinary] : [],
      };

      try {
        await axios.post("http://localhost:3001/product", payload);
        savedProducts.push(prod.nombre);
      } catch (err) {
        console.error(`Error guardando ${prod.nombre}:`, err.message);
      }
    }

    res.status(200).json({
      message: "Migración completada con éxito",
      duplicados: duplicatedProducts,
      guardados: savedProducts,
    });
  } catch (error) {
    console.error("Error migrando productos:", error);
    res.status(500).json({ message: "Falló la migración" });
  }
};
