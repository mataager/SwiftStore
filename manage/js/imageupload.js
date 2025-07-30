// uploadToCloudinary
const uploadPreset = "Hancock"; // Replace with your unsigned upload preset name
const cloudName = "dzxs5xgfy"; // Replace with your Cloudinary cloud name
// async function uploadToCloudinary(file, uploadPreset, cloudName) {
//   if (!file) {
//     console.error("No file provided for upload");
//     return { success: false, data: { error: "No file provided for upload" } };
//   }

//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("upload_preset", uploadPreset);

//   const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       body: formData,
//     });

//     if (!response.ok) {
//       const errorDetails = await response.json();
//       return {
//         success: false,
//         data: { error: errorDetails.error?.message || "Upload failed" },
//       };
//     }

//     const data = await response.json();
//     return {
//       success: true,
//       data: { link: data.secure_url }, // Mimic Imgur's `link` field
//     };
//   } catch (error) {
//     console.error("Error uploading image to Cloudinary:", error);
//     return {
//       success: false,
//       data: { error: error.message },
//     };
//   }
// }
//
// async function imgurUpload(clientId, formData) {
//   try {
//     const response = await fetch("https://api.imgur.com/3/image", {
//       method: "POST",
//       headers: {
//         Authorization: `Client-ID ${clientId}`,
//       },
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to upload image: ${response.statusText}`);
//     }

//     const result = await response.json();
//     return result; // Return the result for further handling
//   } catch (error) {
//     console.error("Error uploading image to Imgur:", error);
//     throw error; // Re-throw the error for the caller to handle
//   }
// }

// Imgur upload implementation
async function uploadToImgur(file, { clientId }) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      Authorization: `Client-ID ${clientId}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorDetails = await response.json();
    throw new Error(errorDetails.error?.message || "Imgur upload failed");
  }

  const result = await response.json();
  return {
    service: "imgur",
    url: result.data.link,
    data: result.data,
  };
}
// Cloudinary upload implementation
async function uploadToCloudinary(file, { uploadPreset, cloudName }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorDetails = await response.json();
    throw new Error(errorDetails.error?.message || "Cloudinary upload failed");
  }

  const result = await response.json();
  return {
    service: "cloudinary",
    url: result.secure_url,
    data: result,
  };
}

async function uploadToBunny(
  file,
  { accessKey, storageZoneName, storetitle, region = "", pullZone },
  optimizeOptions = null // Add optional optimization parameters
) {
  try {
    let fileToUpload = file;

    // Optimize image if options are provided and file is an image
    if (optimizeOptions && file.type.startsWith("image/")) {
      fileToUpload = await optimizeImage(file, optimizeOptions);
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const filename = `Matager_img_${storetitle}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExtension}`;

    const baseHostname = "storage.bunnycdn.com";
    const hostname = region ? `${region}.${baseHostname}` : baseHostname;
    const uploadUrl = `https://${hostname}/${storageZoneName}/${filename}`;

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: accessKey,
        "Content-Type": "application/octet-stream",
      },
      body: fileToUpload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    // Return public URL
    return {
      url: `https://${pullZone}/${filename}`,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
/**
 * Optimizes an image file before upload
 * @param {File} file - The image file to optimize
 * @param {Object} options - Optimization options
 * @param {number} [options.maxWidth=800] - Maximum width in pixels
 * @param {number} [options.maxHeight=600] - Maximum height in pixels
 * @param {number} [options.quality=0.7] - JPEG quality (0.1 to 1.0)
 * @param {number} [options.maxSizeKB=300] - Target max file size in KB
 * @returns {Promise<Blob>} - Optimized image as Blob
 */
async function optimizeImage(file, options = {}) {
  console.log("optimizat-work");
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.7,
    maxSizeKB = 200,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Create canvas for resizing
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with quality settings
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas toBlob failed"));
              return;
            }

            // Check if we need to reduce quality further to meet size target
            if (blob.size / 1024 > maxSizeKB) {
              const reducedQuality = Math.max(
                0.1,
                quality * (maxSizeKB / (blob.size / 1024))
              );
              canvas.toBlob(
                (reducedBlob) => {
                  if (!reducedBlob) {
                    reject(
                      new Error("Canvas toBlob failed on quality reduction")
                    );
                    return;
                  }
                  resolve(reducedBlob);
                },
                file.type || "image/jpeg",
                reducedQuality
              );
            } else {
              resolve(blob);
            }
          },
          file.type || "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
