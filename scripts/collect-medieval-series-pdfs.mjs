import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = join(root, "tmp", "pdfs", "medieval-series-optimized");
const outputRoot = join(root, "output", "pdf", "medieval-series");

const decks = [
  ["01-kells", "01-book-of-kells", "Khi chữ biến thành hình"],
  ["02-sinai", "02-pantocrator-sinai", "Gương mặt nhìn thẳng"],
  ["03-taull", "03-sant-climent-de-taull", "Vòm trời trong lòng đá"],
  ["04-bayeux", "04-bayeux-embroidery", "Lịch sử chạy theo đường kim"],
  ["05-chartres", "05-chartres-rose", "Ánh sáng cũng là kiến trúc"],
  ["06-giotto", "06-giotto-scrovegni", "Cơ thể bước vào không gian"],
  ["07-siena", "07-simone-martini-siena", "Vàng giữ lời chào lại"],
  ["08-tres-riches", "08-tres-riches-heures", "Một năm được vẽ như quyền lực"],
  ["09-arnolfini", "09-arnolfini-portrait", "Căn phòng khép kín, câu hỏi mở"],
  ["10-merode", "10-merode-triptych", "Đời thường mở thành nơi thiêng"],
];

await mkdir(outputRoot, { recursive: true });
const index = [
  "# Mười bộ slide: Nghệ thuật Trung cổ",
  "",
  "Mỗi PDF có 20 trang. Animation nằm trong HTML project tương ứng; PDF giữ bố cục tĩnh để đọc và lưu trữ.",
  "",
];

for (const [slug, fileStem, title] of decks) {
  const source = join(tempRoot, slug, "deck.pdf");
  const target = join(outputRoot, `${fileStem}.pdf`);
  const sourceStat = await stat(source);
  if (sourceStat.size < 100_000) throw new Error(`Unexpectedly small PDF for ${slug}: ${sourceStat.size} bytes`);
  await copyFile(source, target);
  const html = `../../../examples/medieval-series/${slug}/deck.html`;
  index.push(`- [${title}](${fileStem}.pdf) · 20 trang · [HTML project](${html})`);
}

await writeFile(join(outputRoot, "README.md"), `${index.join("\n")}\n`, "utf8");
console.log(`Collected ${decks.length} PDFs in ${outputRoot}`);
