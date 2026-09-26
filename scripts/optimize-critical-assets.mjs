import sharp from "sharp";

const jobs = [
  ["public/assets/original-first-screen/1d6c2900267b6b8d.png", "public/assets/original-first-screen/hero.webp", { quality: 82 }],
  ["public/assets/official-footer-building.png", "public/assets/official-footer-building.webp", { quality: 82 }],
  ["public/assets/daria-enhanced.webp", "public/assets/daria-poster.webp", { width: 840, quality: 82 }],
  ...["tishina", "frolov", "sorokin", "maksakov"].map(name => [
    `public/assets/official-avatar-${name}.png`,
    `public/assets/official-avatar-${name}.webp`,
    { width: 100, height: 100, quality: 82 },
  ]),
  ["public/assets/original-first-screen/utin.jpg", "public/assets/official-avatar-utin.webp", { width: 100, height: 100, quality: 82 }],
];

for (const [source, destination, options] of jobs) {
  let image = sharp(source);
  if (options.width) image = image.resize(options.width, options.height, { fit: "cover", position: "attention" });
  await image.webp({ quality: options.quality }).toFile(destination);
  console.log(`${source} -> ${destination}`);
}
