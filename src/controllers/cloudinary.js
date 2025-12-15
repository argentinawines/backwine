// import cloudinary from "../config/cloudinary.js";
// import { DBIMAGE } from "../models/DBIMAGE.js";

// const uploadToCloudinary = (fileBuffer) => {
//   console.log("fileBuffer", fileBuffer);

//   return new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream({}, (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result);
//         }
//       })
//       .end(fileBuffer);
//   });
// };

// export const uploadImages = async (req, res) => {
//   try {
//     console.log("req", req);
//     const { files } = req;
//     const image = files.image ? files.image[0] : null;
//     const imagesArray = files.imagesArray ? files.imagesArray : [];

//     if (!image && imagesArray.length === 0 && !req.body.imageUrl) {
//       return res.status(400).json({ error: "No images provided" });
//     }

//     const cloudinaryObjectArray = [];

//     if (image) {
//       const imageBuffer = Buffer.from(image.buffer);
//       const imageUrl = await uploadToCloudinary(imageBuffer);
//       cloudinaryObjectArray.push(imageUrl);
//     }

//     for (const file of imagesArray) {
//       const fileBuffer = Buffer.from(file.buffer);
//       const fileUrl = await uploadToCloudinary(fileBuffer);
//       cloudinaryObjectArray.push(fileUrl);
//     }

//     // 🔽 NUEVO: Imagen desde URL externa
//     if (req.body.imageUrl) {
//       try {
//         const response = await axios.get(req.body.imageUrl, {
//           responseType: "arraybuffer",
//         });
//         const urlBuffer = Buffer.from(response.data, "binary");
//         const uploadedUrlImage = await uploadToCloudinary(urlBuffer);
//         cloudinaryObjectArray.push(uploadedUrlImage);
//       } catch (e) {
//         console.error("Error uploading image from URL:", e.message);
//       }
//     }

//     res.json(cloudinaryObjectArray);
//   } catch (error) {
//     console.error("Error uploading images:", error);
//     res.status(500).json({ error: "Failed to upload images" });
//   }
// };

// export const deleteImages = async (req, res) => {
//   try {
//     const body = await req.body;
//     const { publicId, projectId } = body;
//     console.log("publicId", publicId);

//     if (!publicId && !projectId) {
//       return res
//         .status(400)
//         .json({ error: "Image ID and Project ID are required" });
//     }

//     if (Array.isArray(publicId) && projectId) {
//       await Promise.all(
//         publicId.map(async (id) => {
//           const response = await cloudinary.uploader.destroy(id);
//           if (response.result !== "ok") {
//             throw new Error(
//               `Failed to delete image with ID ${id}: ${response.result}`
//             );
//           }
//         })
//       );

//       await Promise.all(
//         publicId.map(async (cloudinaryID) => {
//           await DBIMAGE.destroy({ where: { cloudinaryID: cloudinaryID } });
//         })
//       );
//     } else if (publicId && !Array.isArray(publicId) && projectId) {
//       const response = await cloudinary.uploader.destroy(publicId);
//       if (response.result !== "ok") {
//         throw new Error(
//           `Failed to delete image with ID ${publicId}: ${response.result}`
//         );
//       }

//       await DBIMAGE.destroy({ where: { cloudinaryID: publicId } });
//     } else if (publicId && !projectId) {
//       const response = await cloudinary.uploader.destroy(publicId);
//       if (response.result !== "ok") {
//         throw new Error(
//           `Failed to delete image with ID ${publicId}: ${response.result}`
//         );
//       }
//     }

//     res.json({ message: "Image deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting image:", error);
//     res
//       .status(500)
//       .json({ error: `Failed to delete image: ${error.message} ` });
//   }
// };
import cloudinary from "../config/cloudinary.js";
import { DBIMAGE } from "../models/DBIMAGE.js";
import axios from "axios";

/**
 * Sube un buffer a Cloudinary usando upload_stream (ideal con multer.memoryStorage)
 */
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: "argentinawines",
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      )
      .end(fileBuffer);
  });
};

export const uploadImages = async (req, res) => {
  try {
    const files = req.files || {};
    const image = files.image?.[0] || null;
    const imagesArray = files.imagesArray || [];

    if (!image && imagesArray.length === 0 && !req.body?.imageUrl) {
      return res.status(400).json({ error: "No images provided" });
    }

    const out = [];

    // 1) Imagen principal
    if (image?.buffer) {
      const result = await uploadToCloudinary(image.buffer);
      out.push(result);
    }

    // 2) Array de imágenes
    for (const f of imagesArray) {
      if (!f?.buffer) continue;
      const result = await uploadToCloudinary(f.buffer);
      out.push(result);
    }

    // 3) Imagen desde URL externa (opcional)
    if (req.body?.imageUrl) {
      try {
        const resp = await axios.get(req.body.imageUrl, {
          responseType: "arraybuffer",
        });
        const result = await uploadToCloudinary(Buffer.from(resp.data));
        out.push(result);
      } catch (e) {
        console.error("Error uploading image from URL:", e?.message || e);
      }
    }

    return res.json(out);
  } catch (error) {
    console.error("Error uploading images:", error);
    return res.status(500).json({
      error: "Failed to upload images",
      detail: error?.message || String(error),
    });
  }
};

export const deleteImages = async (req, res) => {
  try {
    const { publicId, projectId } = req.body || {};

    if (!publicId) {
      return res.status(400).json({ error: "publicId is required" });
    }

    const ids = Array.isArray(publicId) ? publicId : [publicId];

    // 1) Borrar en Cloudinary
    await Promise.all(
      ids.map(async (id) => {
        const r = await cloudinary.uploader.destroy(id);
        if (r.result !== "ok" && r.result !== "not found") {
          throw new Error(`Cloudinary destroy failed for ${id}: ${r.result}`);
        }
      })
    );

    // 2) Borrar en DB (si corresponde)
    if (projectId) {
      await Promise.all(
        ids.map((cloudinaryID) => DBIMAGE.destroy({ where: { cloudinaryID } }))
      );
    }

    return res.json({ message: "Image deleted successfully", deleted: ids });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({
      error: "Failed to delete image",
      detail: error?.message || String(error),
    });
  }
};
