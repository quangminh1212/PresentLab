# Mười thế giới — Nghệ thuật Trung cổ

Deck HTML 10 trang cho một triển lãm concept về 10 ngôn ngữ thị giác trong nghệ thuật Trung cổ. Mỗi trang dùng một cấu trúc trình bày và một chuyển động khác nhau, từ trang sách mở ra, icon nhìn thẳng và dải thêu kể chuyện đến kính màu dạng hoa, tranh nội thất có điểm soi và triptych ba cánh.

## Mở và điều hướng

Mở [`deck.html`](../../../examples/medieval-10/deck.html) trong trình duyệt. Dùng phím mũi tên, Page Up / Page Down, Home / End hoặc cuộn / vuốt trang. Bố cục co lại cho màn hình nhỏ; hiệu ứng tắt khi bật chế độ giảm chuyển động.

## Mười nguồn cảm hứng

Ảnh concept được nhúng trực tiếp trong deck.html dưới dạng data URI. Chúng diễn giải chất liệu và ngôn ngữ thị giác; không phải ảnh tư liệu, bản sao hay bản phục dựng các nguyên tác.

| Trang | Tác phẩm / truyền thống | Treatment của slide |
| --- | --- | --- |
| 01 | Book of Kells, trang Chi-Rho, folio 34r, khoảng năm 800 | Bìa dạng thủ bản, chữ lớn và khung trang trí |
| 02 | Christ Pantocrator, tu viện St Catherine, nửa đầu thế kỷ VI | Icon chân dung đối xứng, nền vàng và vòng hào quang |
| 03 | Tranh tường Sant Climent de Taüll, khoảng năm 1123 | Các tầng hình tượng Romanesque |
| 04 | Thêu Bayeux, thế kỷ XI | Dải kể chuyện nằm ngang và đường chỉ chạy |
| 05 | Cửa sổ hoa nhà thờ Chartres, khoảng 1200–1225 | Sơ đồ kính màu hướng tâm trên nền xanh thẫm |
| 06 | Bích họa nhà nguyện Scrovegni của Giotto, 1303–1305 | Hình ảnh tràn khung, cử chỉ và đường chéo cảm xúc |
| 07 | Annunciation, Simone Martini và Lippo Memmi, 1333 | Panel Siena dát vàng, nét mảnh và đường cong |
| 08 | Très Riches Heures du duc de Berry, anh em Limbourg, thế kỷ XV | Trang lịch mùa với tiểu họa và vòng mùa |
| 09 | Arnolfini Portrait, Jan van Eyck, 1434 | Bố cục nội thất cùng các điểm soi chi tiết |
| 10 | Annunciation Triptych (Mérode Altarpiece), xưởng Robert Campin, khoảng 1427–1432 | Triptych ba cánh làm trang kết |

Lưu ý về tên gọi: Bayeux thường được gọi là “tấm thảm” nhưng thực chất là tranh thêu len trên vải lanh. Book of Kells là thủ bản được minh họa; Chartres là kính màu. Deck chọn cả hội họa và các loại hình hình ảnh gần kề để mỗi trang có chất liệu thị giác riêng.

## Nguồn tham khảo

- Trinity College / Visit Trinity, [Chi-Rho page in the Book of Kells](https://www.visittrinity.ie/blog/symbolism-in-the-book-of-kells-the-chi-rho-page/)
- Smarthistory, [Art and architecture of Saint Catherine’s Monastery at Mount Sinai](https://smarthistory.org/saint-catherines-monastery-sinai/)
- Museu Nacional d’Art de Catalunya, [Paintings from Sant Climent de Taüll](https://www.museunacional.cat/en/colleccio/paintings-sant-climent-de-taull/master-taull/015966-cjt)
- Bayeux Museum, [Why the Bayeux Tapestry is an embroidery](https://www.bayeuxmuseum.com/en/the-bayeux-tapestry/discover-the-bayeux-tapestry/tapestry-or-embroidery/)
- Cathédrale de Chartres, [The 13th-century cathedral and its windows](https://www.cathedrale-chartres.org/en/cathedrale/monument/architecture/the-13th-century-cathedral/)
- Cappella degli Scrovegni, [Giotto’s chapel](https://www.cappelladegliscrovegni.it/index.php/en/la-cappella-di-giotto)
- Uffizi Galleries, [Annunciation with St Margaret and St Ansanus](https://www.uffizi.it/en/artworks/annunciation-with-st-margaret-and-st-ansanus)
- Château de Chantilly, [Cabinet des Livres and the Très Riches Heures](https://chateaudechantilly.fr/chateau/le-cabinet-des-livres/)
- The National Gallery, London, [The Arnolfini Portrait](https://www.nationalgallery.org.uk/paintings/jan-van-eyck-the-arnolfini-portrait)
- The Metropolitan Museum of Art, [Annunciation Triptych (Mérode Altarpiece)](https://www.metmuseum.org/collection/the-collection-online/search/470304)

## Tạo concept art

Mỗi ảnh được tạo riêng bằng built-in ImageGen theo prompt dưới đây. Sau khi tạo, ảnh PNG được lưu ở thư mục ImageGen của môi trường và bản JPEG được nhúng dưới dạng data URI trong deck.html để deck chạy độc lập. Không có ảnh ngoài mạng trong HTML.

### Ảnh nhúng — 01-kells-illuminated.jpg

~~~text
Create an original 16:9 landscape concept artwork for a Vietnamese museum-style presentation, inspired by the Insular illuminated manuscript tradition and the Chi Rho page of the Book of Kells. Show a large abstract interlace monogram-like shape, tiny interwoven animals and spirals, dense hand-painted vellum ornament, mineral greens, brick red, lapis blue and small gold accents, intricate close-up craftsmanship. Original composition with manuscript texture and strong central focal point. It must not reproduce the actual folio or contain readable letters, words, text, modern typography, logo, watermark, border, or collage.
~~~

### Ảnh nhúng — 02-sinai-pantocrator.jpg

~~~text
Create an original 16:9 landscape image asset for a Vietnamese editorial slide deck about medieval art, inspired by the visual language of a sixth-century Byzantine encaustic icon of Christ Pantocrator at Sinai. Make an original frontal sacred portrait with solemn symmetrical composition, luminous burnished gold ground, restrained dark crimson and deep ultramarine, carefully modeled face with subtle asymmetry, aged wood panel and faint craquelure. Visually powerful and museum-like, high detail, flat icon space rather than modern realism. Leave a quiet dark-gold area along the lower left for slide typography. This is a new concept illustration, not a copy or reconstruction of the real icon. No text, letters, logos, watermark, border, collage, or modern objects.
~~~

### Ảnh nhúng — 03-taull-fresco.jpg

~~~text
Create an original 16:9 landscape concept artwork for a Vietnamese art-history presentation, inspired by the Romanesque apse painting of Christ in Majesty at Sant Climent de Taüll, circa 1123. Use an imposing frontal sacred figure inside a bold mandorla, compact geometric folds, flat mineral pigment, symmetrical registers of small saints and restrained architectural curves; palette of midnight blue, warm ochre, chalk white and muted red. Matte fresco on aged plaster, expressive but deliberately non-naturalistic. New artwork, not a copy of the real fresco. No text, readable symbols, logos, watermark or modern items.
~~~

### Ảnh nhúng — 04-bayeux-embroidery.jpg

~~~text
Create an original very wide 16:9 landscape artwork for a Vietnamese slide deck, inspired by the narrative rhythm and material of the 11th-century Bayeux embroidery. Show a procession of horses, riders, ships and heraldic plants moving left to right across three narrow horizontal registers, stitched wool shapes on weathered ivory linen, limited rust, olive, blue and gold palette, playful flat silhouettes, hand-sewn texture. This is original textile concept art, not a reconstruction of a particular scene. No readable embroidery, letters, caption, logo, watermark, border frame or modern objects.
~~~

### Ảnh nhúng — 05-chartres-rose.jpg

~~~text
Create an original 16:9 landscape concept artwork for a medieval art-history presentation, inspired by the early 13th-century rose windows of Chartres Cathedral. A huge circular Gothic stained-glass rose window dominates the center with leaded geometric tracery, concentric medallions and jewel-like translucent cobalt blue, ruby red and amber glass glowing in daylight. Rich handcrafted glass texture, deep shadow around the circle so the geometry reads clearly. Original window design, not an exact cathedral window. No letters, captions, logos, watermark, photo frame or modern objects.
~~~

### Ảnh nhúng — 06-giotto-fresco.jpg

~~~text
Create an original 16:9 landscape concept artwork for a Vietnamese art-history deck, inspired by Giotto's early 14th-century Scrovegni Chapel frescoes. Show five fully clothed adult figures sharing a quiet farewell on a hillside, arranged along a strong diagonal rocky slope beneath a deep blue sky; expressive compassionate gestures, solid sculptural volumes, simple grounded space, a small bare tree, matte pigments and visible aged plaster. Calm and emotionally resonant, with no injury, no body, no weapons, no violence, no nudity, no text, no logos, no watermark, no copy of a specific Giotto fresco.
~~~

### Ảnh nhúng — 07-simone-annunciation.jpg

~~~text
Create an original 16:9 landscape concept artwork for a Vietnamese medieval art slide, inspired by the Sienese Gothic style and Simone Martini's 1333 Annunciation. Use a refined gold-leaf ground, slender courtly figures at opposite sides, a curved floral stem sweeping between them, ornate patterned robes, delicate linear drawing, small carved-looking gold details and a narrow architectural frame. Elegant, decorative, jewel-like and rhythmically balanced. New composition, not a reconstruction of Simone Martini's panel. No readable words, no logos, watermark, modern typography or objects.
~~~

### Ảnh nhúng — 08-tres-riches-calendar.jpg

~~~text
Create an original 16:9 landscape concept artwork for a medieval art-history presentation, inspired by the calendar miniatures in the Très Riches Heures du duc de Berry by the Limbourg brothers. Show a small winter landscape with a walled French manor, tiny aristocratic visitors and villagers, bare trees, distant hills, a narrow ornate zodiac-like upper arch with no symbols or writing. Jewel-toned opaque pigments, crisp miniature detail, blue sky, rose and gold accents, a parchment page feel. Original miniature, not a copy of any month page. No text, letters, logos, watermark or modern elements.
~~~

### Ảnh nhúng — 09-van-eyck-interior.jpg

~~~text
Create an original 16:9 landscape concept artwork for a Vietnamese slide deck, inspired by the early Netherlandish oil technique of Jan van Eyck and the domestic detail of the Arnolfini Portrait. A believable 15th-century interior with two formally dressed adult figures standing apart, daylight from a small window, polished wood, glass, brass and fabric rendered in minute luminous oil glazes; a convex mirror quietly reflecting the room. Rich russet, emerald and deep blue palette, realistic but clearly an original period oil painting, not a copy. No text, logo, watermark, frame, modern furniture or objects.
~~~

### Ảnh nhúng — 10-merode-triptych.jpg

~~~text
Create an original 16:9 landscape concept artwork for a Vietnamese presentation, inspired by the 15th-century early Netherlandish domestic triptychs associated with the workshop of Robert Campin. Show an open three-panel altarpiece: center panel with a quiet candlelit devotional interior, left narrow panel with a kneeling patron at a doorway, right narrow panel with a carpenter at a bench. Fine oil glazes, precise household objects, pale window light, warm oak, carmine and blue. New imagined triptych, not a copy of the Mérode Altarpiece. No text, logos, watermark or contemporary objects.
~~~

## Render bản xem tĩnh

Từ thư mục gốc:

~~~powershell
node dist/cli.js validate --input examples/medieval-10/deck.html
node dist/cli.js render --input examples/medieval-10/deck.html --output .artifacts/medieval-10 --format png,pdf,pptx
~~~

Animation chạy trong bản HTML ở trình duyệt. Renderer hiện tại xuất PNG, PDF và PPTX tĩnh.
