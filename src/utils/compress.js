const sharp = require("sharp");
const fs = require("fs");

async function compressImage({
  inputPath,
  outputPath,
  width,
  height,
  quality,
  maxSizeKB,
}) {
  const buffer = fs.readFileSync(inputPath);

  let currentQuality = quality || 80;

  async function doCompress(q) {
    return await sharp(buffer)
      .resize(width || null, height || null, { fit: "inside" })
      .jpeg({ quality: q })
      .toBuffer();
  }

  let outputBuffer = await doCompress(currentQuality);

  if (maxSizeKB) {
    while (outputBuffer.length / 1024 > maxSizeKB && currentQuality > 10) {
      currentQuality -= 5;
      outputBuffer = await doCompress(currentQuality);
    }
  }

  fs.writeFileSync(outputPath, outputBuffer);

  return {
    finalSizeKB: (outputBuffer.length / 1024).toFixed(2),
    qualityUsed: currentQuality,
    outputPath,
  };
}

module.exports = { compressImage };
