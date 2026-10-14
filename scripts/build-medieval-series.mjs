import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(root, "examples", "medieval-series");
const sourceAssets = join(root, "examples", "medieval-10", "assets");

const S = (kind, kicker, title, body, points = []) => ({
  kind,
  kicker,
  title,
  body,
  points,
});

const decks = [
  {
    slug: "01-kells",
    shortTitle: "Book of Kells",
    title: "Khi chữ biến thành hình",
    subtitle: "Đọc trang Chi-Rho trong Book of Kells",
    work: "Book of Kells, folio 34r (Chi-Rho page)",
    maker: "Tu viện Ireland hoặc vùng lân cận; nghệ nhân vô danh",
    date: "Khoảng thế kỷ IX",
    medium: "Thủ bản Phúc Âm có minh họa",
    artwork: "01-kells-illuminated.jpg",
    style: "kells",
    styleName: "Thủ bản Insular · giấy da, xanh khoáng và đỏ đất",
    theme: {
      paper: "#f3e9d5", ink: "#26372d", muted: "#6c6b58", accent: "#a94f35",
      accent2: "#b28b43", deep: "#18291f", veil: "rgba(243,233,213,.93)",
      serif: "Georgia, 'Palatino Linotype', serif", sans: "'Segoe UI', Arial, sans-serif",
    },
    sources: [
      ["Trinity College Dublin, Chi-Rho page", "https://www.visittrinity.ie/blog/symbolism-in-the-book-of-kells-the-chi-rho-page/"],
      ["Trinity College Dublin Digital Collections, Book of Kells", "https://digitalcollections.tcd.ie/"],
    ],
    slides: [
      S("cover", "MỘT TRANG · MỘT THẾ GIỚI", "Khi chữ biến thành hình", "Trang Chi-Rho trong Book of Kells — nơi nét chữ, biểu tượng và hoa văn cùng dẫn mắt người xem."),
      S("thesis", "Ý CHÍNH", "Không có đường ranh giữa chữ và hình.", "Chi-Rho là dấu hiệu viết tắt tên Đức Kitô bằng hai chữ cái Hy Lạp. Trên folio 34r, nó trở thành cả một kiến trúc thị giác."),
      S("object", "ĐỊNH DANH TÁC PHẨM", "Folio 34r: trang mở đầu Tin Mừng Matthew.", "Đây không phải trang bìa của cả cuốn sách. Nó mở phần văn bản Tin Mừng Matthew trong một bản thủ bản gồm bốn Phúc Âm."),
      S("interlude", "NHÌN TOÀN TRANG", "Tâm điểm trước. Chi tiết sau.", "Hãy bắt đầu ở monogram lớn, rồi lần theo các vòng xoắn và nút thắt nhỏ quanh nó."),
      S("split", "MỘT CUỐN SÁCH ĐƯỢC LÀM ĐỂ NHÌN", "Văn bản thiêng, hình ảnh nghi lễ.", "Book of Kells vừa lưu giữ bản văn vừa là vật thể được trưng bày trong những dịp phụng vụ quan trọng. Trang trí không đứng ngoài chức năng của cuốn sách."),
      S("sequence", "CẤU TRÚC", "Hai chữ cái giữ toàn bộ trang lại.", "Chi và Rho chồng lên nhau để tạo thành dấu hiệu trung tâm.", ["Chi — nét X mở rộng", "Rho — thân chữ P kéo dài", "Các đường viền nối chữ với nền trang"]),
      S("detail", "MẠNG LƯỚI NÉT", "Một đường xoắn có thể thành nhiều thứ.", "Các dải đan, vòng tròn và nút thắt khiến mắt đi qua trang nhiều lần mà không theo một lối duy nhất."),
      S("split", "NHỮNG HÌNH ẨN", "Con vật xuất hiện trong đường viền.", "Trinity ghi nhận nhiều hình nhỏ đan vào hoa văn: động vật, côn trùng, rắn và thiên thần. Ta cần nhìn kỹ mới nhận ra chúng."),
      S("statement", "CHI TIẾT", "Một con rái cá. Một con cá.", "Chi tiết ở vùng dưới trang được diễn giải như liên hệ với Thánh Thể. Đó là cách đọc biểu tượng, không phải chú thích do họa sĩ để lại."),
      S("quiet", "NHỊP ĐỌC", "Hình ảnh giữ người xem ở lại.", "Không cần đọc trọn chữ Latin mới có thể bắt đầu quan sát. Màu, nhịp lặp và tương phản tạo một lối vào cho ánh nhìn."),
      S("sequence", "NGÔN NGỮ THỊ GIÁC", "Insular là một cuộc gặp gỡ.", "Truyền thống địa phương kết hợp với nhiều ảnh hưởng Kitô giáo để tạo nên phong cách riêng của Ireland và Britain thời trung cổ.", ["Nút thắt và xoắn", "Chữ viết và biểu tượng Kitô giáo", "Nhiều truyền thống hình ảnh cùng tồn tại"]),
      S("split", "CHẤT LIỆU", "Một trang không chỉ là bề mặt.", "Thủ bản được chép và tô vẽ bằng tay. Vật liệu, thao tác và thời gian đều góp phần tạo nên mật độ thị giác của trang."),
      S("inquiry", "CÁCH ĐỌC", "Đâu là họa tiết, đâu là biểu tượng?", "Có chi tiết mang nghĩa Kitô giáo rõ ràng; một số cách giải thích các con vật nhỏ vẫn là diễn giải. Giữ ranh giới ấy giúp ta nhìn chính xác hơn."),
      S("archive", "ĐỜI SỐNG TÁC PHẨM", "Trang sách tiếp tục được bảo vệ.", "Trinity thay đổi những trang được trưng bày để giảm tác động bảo tồn. Folio 34r cũng có thể xem qua bộ sưu tập số của thư viện."),
      S("detail", "PHÓNG ĐẠI", "Phóng lớn làm lộ nhịp của bàn tay.", "Bản số cho phép người xem tiến gần tới từng nút thắt, cánh nhỏ và khoảng trống mà mắt thường có thể bỏ qua."),
      S("sequence", "ĐỪNG NHẦM", "Ba điều dễ bị đọc sai.", "Tách dữ kiện khỏi cảm nhận khi nói về một trang thủ bản.", ["Đây là folio 34r, không phải trang đầu cuốn sách", "Chi-Rho là monogram của Đức Kitô", "Không phải mọi chi tiết nhỏ đều có cách giải thích chắc chắn"]),
      S("split", "NHÌN LẠI", "Hoa văn không lấp chỗ trống.", "Nó định hình thứ tự quan sát, làm cho văn bản trở thành một trải nghiệm thị giác có nhịp."),
      S("statement", "GHI NHỚ", "Tâm điểm kéo mắt vào; đường nét giữ mắt lại.", "Đó là chuyển động của trang Chi-Rho: một dấu hiệu lớn mở ra vô số đường đọc nhỏ."),
      S("closing", "MANG THEO", "Đọc chậm hơn một vòng.", "Nhìn monogram. Lần theo đường đan. Rồi tự hỏi chi tiết nào là quan sát và chi tiết nào là diễn giải."),
      S("sources", "NGUỒN THAM KHẢO", "Để lần theo trang sách.", "Thông tin định danh và cách đọc biểu tượng được đối chiếu với các nguồn của Trinity College Dublin."),
    ],
  },
  {
    slug: "02-sinai",
    shortTitle: "Pantocrator Sinai",
    title: "Gương mặt nhìn thẳng",
    subtitle: "Christ Pantocrator tại tu viện St Catherine, Sinai",
    work: "Christ Pantocrator, tu viện St Catherine, Sinai",
    maker: "Nghệ nhân vô danh; nguồn gốc chính xác chưa rõ",
    date: "Thế kỷ VI (niên đại thường được chấp nhận)",
    medium: "Icon encaustic trên bảng gỗ",
    artwork: "02-sinai-pantocrator.jpg",
    style: "byzantine",
    styleName: "Icon Byzantine · vàng trầm, đối xứng và ánh nhìn trực diện",
    theme: {
      paper: "#1c1b1a", ink: "#f3e8c9", muted: "#b9a878", accent: "#c49a45",
      accent2: "#8f3835", deep: "#11100f", veil: "rgba(28,27,26,.91)",
      serif: "Georgia, 'Palatino Linotype', serif", sans: "'Segoe UI', Arial, sans-serif",
    },
    sources: [
      ["St Catherine's Monastery, Christ Pantocrator", "https://mused.com/stories/50/christ-pantocrator-palladion-of-the-monastery-of-sinai/"],
      ["Library of Congress, manuscripts at St Catherine's Monastery", "https://www.loc.gov/collections/manuscripts-in-st-catherines-monastery-mount-sinai/about-this-collection/"],
    ],
    slides: [
      S("cover", "SINAI · THẾ KỶ VI", "Gương mặt nhìn thẳng", "Một icon nhỏ gọn đặt người xem trước ánh nhìn trực diện và một lịch sử nhiều lớp."),
      S("thesis", "Ý CHÍNH", "Icon không chỉ mô tả một nhân vật.", "Nó tạo một cuộc gặp giữa hình ảnh, người xem và cộng đồng phụng tự."),
      S("object", "ĐỊNH DANH", "Một panel gắn với tu viện Sinai.", "Christ Pantocrator hiện được lưu giữ tại tu viện St Catherine. Nguồn gốc ban đầu của icon vẫn chưa xác định."),
      S("interlude", "NHÌN THẲNG", "Ánh mắt giữ trục giữa.", "Bố cục trực diện khiến người xem khó lướt qua gương mặt; nền vàng kéo hình ra khỏi một căn phòng cụ thể."),
      S("split", "NIÊN ĐẠI", "Lịch sử của lớp sơn từng bị đọc khác đi.", "Trước khi được làm sạch năm 1962, tác phẩm từng được xem là muộn hơn. Việc làm sạch cho thấy một bề mặt encaustic cổ hơn."),
      S("sequence", "KỸ THUẬT", "Encaustic: sắc tố trộn với sáp nóng.", "Kỹ thuật này giúp tạo bề mặt có độ sâu và những chuyển sắc mềm trên bảng gỗ.", ["Sắc tố được đưa vào sáp nóng", "Hình được dựng thành nhiều lớp", "Bề mặt hiện nay mang dấu thời gian"]),
      S("detail", "KHUÔN MẶT", "Hai sắc thái trong cùng một gương mặt.", "Gương mặt có một cái nhìn kép: vừa nghiêm nghị vừa từ bi. Tác giả của nguồn tại tu viện lưu ý rằng ý định ban đầu không thể xác nhận."),
      S("split", "DIỄN GIẢI", "Một cách đọc không phải câu trả lời cuối.", "Có cách diễn giải xem hai nửa gương mặt như hai bản tính của Đức Kitô. Hãy trình bày đó là một giả thuyết, không phải dữ kiện chắc chắn."),
      S("statement", "SO SÁNH", "Chân dung cổ đại gặp hình ảnh phụng tự.", "Nguồn của tu viện so sánh kỹ thuật xử lý ánh mắt với chân dung Fayum thời cổ đại. Đây là một liên hệ thị giác, không khẳng định một bản sao trực tiếp."),
      S("quiet", "NỀN VÀNG", "Không gian không cần chiều sâu thực.", "Nền vàng làm sáng nhân vật và định hình một không gian thiêng mang tính biểu tượng."),
      S("sequence", "VẬT THỂ", "Bảng gỗ được nhìn, giữ và tôn kính.", "Icon tồn tại trong đời sống cộng đồng, không chỉ như một vật trưng bày bảo tàng.", ["Hình ảnh đặt trong tu viện", "Bề mặt được làm sạch và nghiên cứu", "Các bản sao tiếp tục xuất hiện trong thực hành tín ngưỡng"]),
      S("split", "MỘT LỊCH SỬ PHỤC HỒI", "Năm 1962 mở lại một thời kỳ.", "Cuộc làm sạch giúp nhận ra lớp encaustic và thay đổi cách định niên đại. Một thao tác bảo tồn có thể viết lại lịch sử nghệ thuật."),
      S("inquiry", "ĐIỀU CHƯA BIẾT", "Nơi sáng tác vẫn là câu hỏi.", "Một số học giả liên hệ icon với Constantinople. Nguồn gốc cụ thể và người đặt làm chưa được xác định."),
      S("archive", "ẢNH HƯỞNG", "Một hình ảnh thành chuẩn mực.", "Nguồn của tu viện ghi nhận các icon Byzantine về sau tại Sinai được sao theo hình tượng này, dấu hiệu cho thấy vị trí của nó trong cộng đồng."),
      S("detail", "CÁCH NHÌN", "Đọc ánh mắt trước khi giải nghĩa.", "Quan sát hướng nhìn, độ nghiêng của đầu và sự khác biệt giữa hai nửa gương mặt trước khi đưa ra một kết luận biểu tượng."),
      S("sequence", "ĐỪNG NHẦM", "Tách ba lớp thông tin.", "Niên đại, kỹ thuật và ý nghĩa diễn giải có mức độ chắc chắn khác nhau.", ["Lưu giữ tại St Catherine's: dữ kiện", "Niên đại thế kỷ VI: quan điểm học thuật phổ biến", "Ý nghĩa của ánh nhìn kép: nhiều cách giải thích"]),
      S("split", "BẢO TỒN", "Mỗi lần nhìn là một lần tiếp xúc.", "Bề mặt encaustic và gỗ đòi hỏi điều kiện bảo quản cẩn trọng; ảnh số giúp nhiều người quan sát mà không chạm vào vật thể."),
      S("statement", "GHI NHỚ", "Tấm icon đứng yên; cách nhìn tiếp tục đổi.", "Từ giả thuyết về niên đại đến những diễn giải gương mặt, tác phẩm luôn được đọc lại qua bằng chứng mới."),
      S("closing", "MANG THEO", "Nhìn gương mặt. Giữ mở cách giải thích.", "Một icon thuyết phục bằng sự hiện diện, nhưng không buộc người xem vào một ý nghĩa duy nhất."),
      S("sources", "NGUỒN THAM KHẢO", "Từ Sinai và Library of Congress.", "Các dữ kiện về vật thể, kỹ thuật và lịch sử nghiên cứu được đối chiếu với nguồn của tu viện và thư viện."),
    ],
  },
  {
    slug: "03-taull",
    shortTitle: "Sant Climent de Taüll",
    title: "Vòm trời trong lòng đá",
    subtitle: "Christ in Majesty và tranh tường Romanesque ở Taüll",
    work: "Paintings from Sant Climent de Taüll",
    maker: "Master of Taüll",
    date: "Khoảng năm 1123",
    medium: "Tranh tường; phần lớn được chuyển sang vải canvas",
    artwork: "03-taull-fresco.jpg",
    style: "taull",
    styleName: "Romanesque · trục chính diện, mảng phẳng và xanh đậm",
    theme: {
      paper: "#e9e1cd", ink: "#1d2c45", muted: "#5f6b70", accent: "#a85e39",
      accent2: "#c29b51", deep: "#14243a", veil: "rgba(233,225,205,.93)",
      serif: "Georgia, 'Palatino Linotype', serif", sans: "'Segoe UI', Arial, sans-serif",
    },
    sources: [
      ["MNAC, Paintings from Sant Climent de Taüll", "https://www.museunacional.cat/en/colleccio/paintings-sant-climent-de-taull/master-taull/015966-cjt"],
      ["MNAC, collection and conservation record", "https://www.museunacional.cat/en/colleccio/paintings-sant-climent-de-taull/master-taull/015966-cjt"],
    ],
    slides: [
      S("cover", "VALL DE BOÍ · CATALONIA", "Vòm trời trong lòng đá", "Christ in Majesty trên vòm apse của Sant Climent de Taüll — hình ảnh làm chủ cả không gian nhà thờ."),
      S("thesis", "Ý CHÍNH", "Hình lớn để được đọc từ xa.", "Trục đối xứng, đường viền mạnh và những mảng màu rõ giúp hình ảnh hiện diện trong lòng apse."),
      S("object", "ĐỊNH DANH", "Một tổng thể trang trí, không chỉ một nhân vật.", "MNAC lưu giữ phần lớn tranh từ apse trung tâm, các vòm khải hoàn và apse bên của nhà thờ."),
      S("interlude", "NIÊN ĐẠI", "Dòng khắc dẫn đến năm 1123.", "Dòng chữ trên cột ghi lễ cung hiến nhà thờ bởi Giám mục Ramon de Roda; tranh được cho là thực hiện gần thời điểm này."),
      S("split", "BỐ CỤC", "Một vòm, ba tầng hình ảnh.", "Christ in Majesty ở phía trên; Đức Mẹ và các tông đồ ở tầng giữa; một dải rèm được vẽ ở phần dưới."),
      S("sequence", "PHONG CÁCH", "Romanesque đặt trọng lượng vào hình khối.", "MNAC mô tả tác phẩm qua tính phi tự nhiên, sự đồ sộ và hình học hóa.", ["Nhân vật chính diện", "Đường nét xác định hình", "Mảng trang trí dày quanh trục giữa"]),
      S("detail", "NÉT VẼ", "Đường viền dựng nên thể tích.", "Họa sĩ dùng đường bao rõ và chuyển sắc để tạo cảm giác khối trên bề mặt tường."),
      S("split", "KHÔNG GIAN", "Kiến trúc kéo ánh nhìn lên cao.", "Vòm apse và các dải hình ảnh dẫn người xem từ phần thấp lên vùng trung tâm thiêng."),
      S("statement", "ĐIỂM NHẤN", "Màu đậm đối thoại với khoảng trống.", "Hình ảnh được đặt lên nền rộng, giúp từng nhân vật nổi bật thay vì hòa vào cảnh quan tự nhiên."),
      S("quiet", "TƯƠNG PHẢN", "Nhà thờ giản dị; nội thất rực rỡ.", "MNAC nhấn mạnh độ tương phản giữa kiến trúc đơn giản và chất lượng trang trí bên trong."),
      S("sequence", "CÁC VÙNG PHỤ", "Vòm khải hoàn mở rộng câu chuyện.", "Ngoài apse chính, bộ tranh còn có các medallion, bàn tay Chúa, Chiên Thiên Chúa và hình Lazarus.", ["Dấu hiệu tôn giáo trên vòm", "Các nhân vật nối tiếp quanh kiến trúc", "Phần còn lại vẫn hiện diện tại Taüll"]),
      S("split", "NGƯỜI TẠO TÁC", "Tên thật không còn; dấu tay còn đó.", "Bảo tàng quy tác phẩm cho Master of Taüll, tên gọi dành cho một nghệ nhân chưa xác định danh tính."),
      S("inquiry", "CÂU HỎI", "Chuyển tranh tường sang canvas thay đổi điều gì?", "Việc chuyển lớp tranh khỏi kiến trúc giúp bảo tồn và trưng bày, nhưng làm thay đổi quan hệ trực tiếp giữa hình ảnh với không gian gốc."),
      S("archive", "ĐỜI SỐNG TÁC PHẨM", "Một chiến dịch bảo tàng đầu thế kỷ XX.", "Các tranh được mua trong chiến dịch của Junta de Museus giai đoạn 1919–1923; một phần trang trí vẫn ở lại nhà thờ."),
      S("detail", "BẢO TỒN", "Tác phẩm vẫn có hai địa chỉ.", "Bảo tàng giữ phần lớn tổng thể; tại Sant Climent vẫn còn một số trang trí nguyên vị."),
      S("sequence", "ĐỌC ROMANESQUE", "Ba dấu hiệu để bắt đầu nhìn.", "Hãy quan sát cách hình ảnh điều chỉnh theo bề mặt kiến trúc.", ["Tính chính diện", "Tỷ lệ quy tụ về nhân vật trung tâm", "Đường viền và hình học"]),
      S("split", "ĐỪNG NHẦM", "Đừng tách hình khỏi vòm nhà thờ.", "Tên gọi “Christ in Majesty” chỉ một phần của một chương trình trang trí lớn hơn, gắn với apse và các dải hình xung quanh."),
      S("statement", "GHI NHỚ", "Một mái vòm biến thành sân khấu hình ảnh.", "Taüll cho thấy kiến trúc có thể trở thành khung kể chuyện, không chỉ là nơi treo tranh."),
      S("closing", "MANG THEO", "Ngước nhìn để hiểu tỷ lệ.", "Hãy tưởng tượng người xem đứng trong nhà thờ, phía dưới những hình ảnh được thiết kế cho cả không gian."),
      S("sources", "NGUỒN THAM KHẢO", "Hồ sơ bộ sưu tập MNAC.", "Thông tin định danh, niên đại, bố cục và lịch sử bảo tồn được đối chiếu với hồ sơ Museu Nacional d'Art de Catalunya."),
    ],
  },
  {
    slug: "04-bayeux",
    shortTitle: "Bayeux Embroidery",
    title: "Lịch sử chạy theo đường kim",
    subtitle: "Một cuộc chinh phục được kể bằng len và vải lanh",
    work: "Bayeux Embroidery",
    maker: "Nghệ nhân vô danh; người đặt làm chưa chắc chắn",
    date: "Thế kỷ XI",
    medium: "Len thêu trên các dải vải lanh ghép nối",
    artwork: "04-bayeux-embroidery.jpg",
    style: "bayeux",
    styleName: "Tranh thêu kể chuyện · đường ngang, len màu và nhịp nối",
    theme: {
      paper: "#f2e6cf", ink: "#332b22", muted: "#776c59", accent: "#9f4b36",
      accent2: "#6c7549", deep: "#282117", veil: "rgba(242,230,207,.93)",
      serif: "Georgia, 'Palatino Linotype', serif", sans: "'Segoe UI', Arial, sans-serif",
    },
    sources: [
      ["Bayeux Museum, Tapestry or embroidery?", "https://www.bayeuxmuseum.com/en/the-bayeux-tapestry/discover-the-bayeux-tapestry/tapestry-or-embroidery/"],
      ["Bayeux Museum, discover the Bayeux Tapestry", "https://www.bayeuxmuseum.com/en/the-bayeux-tapestry/"],
    ],
    slides: [
      S("cover", "THẾ KỶ XI · LEN TRÊN VẢI LANH", "Lịch sử chạy theo đường kim", "Bayeux Embroidery kể về cuộc chinh phục nước Anh bằng một dải hình ảnh dài gần 70 mét."),
      S("thesis", "Ý CHÍNH", "Đây là tranh thêu, không phải tapestry dệt.", "Hình được tạo bằng len thêu trên nền vải lanh. Tên gọi quen thuộc không mô tả chính xác kỹ thuật làm tác phẩm."),
      S("object", "KÍCH THƯỚC", "Một dải dài, chín phần vải ghép.", "Bayeux Museum ghi chiều dài khoảng 68,3 mét; các mảnh lanh được nối thành một chuỗi kể chuyện."),
      S("interlude", "NHỊP KỂ", "Cảnh nối tiếp cảnh, không cần khung tranh.", "Mắt người xem đi dọc vải để lần theo hành động, địa điểm và dòng chữ thêu."),
      S("split", "CHẤT LIỆU", "Mười sắc len, bốn mũi thêu chính.", "Museum nêu mười màu len và bốn kỹ thuật thêu, gồm mũi cuống, mũi xích, mũi tách và mũi Bayeux."),
      S("sequence", "CẤU TRÚC", "Ba dải chia trang vải thành nhịp.", "Trung tâm kể chính; hai dải biên chứa thêm hình ảnh phụ và nhịp trang trí.", ["Dải hình lớn ở giữa", "Biên trên và dưới dẫn mắt", "Chữ thêu đặt cạnh hành động"]),
      S("detail", "CHUYỂN ĐỘNG", "Ngựa chạy bằng đường viền lặp.", "Nhịp chân, giáo và cờ làm các cảnh có cảm giác chuyển động dù hình ảnh vẫn nằm trên một mặt phẳng."),
      S("split", "MÀU", "Màu len là dấu vết của thời gian.", "Woad, madder và weld tạo ra nhiều sắc xanh, đỏ, vàng. Một số phần màu đã phai, nhất là đoạn được phục chế nhiều."),
      S("statement", "DÒNG CHỮ", "Vải cũng mang lời kể.", "Các inscription giúp đặt tên người và hành động, nhưng hình ảnh vẫn giữ vai trò dẫn chuyện chính."),
      S("quiet", "NGƯỜI XEM", "Có thể đọc mà không cần đứng yên.", "Một dải tranh thêu được nhìn theo hành trình. Vị trí của người xem quyết định họ thấy cảnh nào trước."),
      S("sequence", "AI ĐẶT LÀM?", "Câu trả lời chưa được xác nhận.", "Người thực hiện chưa rõ. Bayeux Museum cho biết đa số sử gia cho rằng Odo, Giám mục Bayeux, có thể đã đặt làm tác phẩm.", ["Người thêu: chưa rõ", "Odo: giả thuyết phổ biến về người đặt làm", "Nhà thờ Bayeux: bối cảnh trưng bày được đề xuất"]),
      S("split", "LỊCH SỬ VÀ QUYỀN LỰC", "Một ký ức được kể từ phía người thắng.", "Tác phẩm ghi lại cuộc chinh phục nhưng cũng có thể cổ vũ cho chiến thắng Norman. Nó là nguồn sử liệu có lập trường."),
      S("inquiry", "ĐỌC PHÊ PHÁN", "Ai được xuất hiện ở trung tâm?", "Thử quan sát nhân vật được gọi tên, nhân vật ở viền và những phần câu chuyện không xuất hiện."),
      S("archive", "DẤU VẾT", "Màu gốc và phần phục chế không giống nhau.", "Bảo tàng cảnh báo một số màu trong các đoạn được phục chế thế kỷ XIX đã phai mạnh."),
      S("detail", "KỸ THUẬT", "Chỉ thêu vừa tô màu vừa tạo khối.", "Mũi thêu lấp bề mặt, xác định đường viền và tạo khác biệt giữa vải, áo giáp, cờ và thân ngựa."),
      S("sequence", "ĐỪNG NHẦM", "Ba điều cần nhớ khi gọi tên.", "Tên phổ biến, chất liệu thật và cách diễn giải lịch sử không phải một thứ.", ["Tác phẩm là tranh thêu", "Nó gồm nhiều mảnh lanh nối", "Cách kể có thể mang tính tuyên truyền"]),
      S("split", "PHƯƠNG PHÁP NHÌN", "Đọc từng đoạn nhưng nhớ cả chiều dài.", "Một cảnh riêng có thể gây ấn tượng; ý nghĩa của nó thay đổi khi đặt vào chuỗi liền trước và liền sau."),
      S("statement", "GHI NHỚ", "Sợi chỉ vừa là chất liệu, vừa là đường kể.", "Chính cấu trúc ngang khiến Bayeux giống một câu chuyện đang tiếp tục chạy."),
      S("closing", "MANG THEO", "Đi dọc câu chuyện, rồi hỏi ai kể.", "Hãy giữ đồng thời hai góc nhìn: tác phẩm như kiệt tác thêu và như một tường thuật có quan điểm."),
      S("sources", "NGUỒN THAM KHẢO", "Bayeux Museum.", "Chiều dài, kỹ thuật, chất liệu, giả thuyết về người đặt làm và lịch sử màu sắc được đối chiếu với hồ sơ bảo tàng."),
    ],
  },
  {
    slug: "05-chartres",
    shortTitle: "Chartres Rose",
    title: "Ánh sáng cũng là kiến trúc",
    subtitle: "Cửa sổ kính màu và nhà thờ Chartres thế kỷ XIII",
    work: "Các cửa sổ hoa của nhà thờ Chartres",
    maker: "Nhiều nghệ nhân và đội xây dựng; tên kiến trúc sư không được biết",
    date: "Nhà thờ Gothic được xây sau vụ cháy năm 1194",
    medium: "Kính màu trong hệ kiến trúc Gothic",
    artwork: "05-chartres-rose.jpg",
    style: "chartres",
    styleName: "Gothic · xanh kính màu, tia sáng và hình học hướng tâm",
    theme: {
      paper: "#e7e9e8", ink: "#1d2c48", muted: "#65717a", accent: "#a24742",
      accent2: "#3c75a0", deep: "#132141", veil: "rgba(231,233,232,.92)",
      serif: "Georgia, 'Palatino Linotype', serif", sans: "'Segoe UI', Arial, sans-serif",
    },
    sources: [
      ["Cathédrale de Chartres, The 13th-century Cathedral", "https://www.cathedrale-chartres.org/en/cathedrale/monument/architecture/the-13th-century-cathedral/"],
      ["Cathédrale de Chartres, The stained-glass windows", "https://www.cathedrale-chartres.org/en/cathedrale/monument/the-stained-glass-windows/"],
    ],
    slides: [
      S("cover", "CHARTRES · GOTHIC", "Ánh sáng cũng là kiến trúc", "Nhà thờ Chartres biến đá, kính và ánh sáng thành một không gian dẫn mắt lên cao."),
      S("thesis", "Ý CHÍNH", "Kính màu không được thêm vào sau cùng.", "Cửa sổ là một phần của hệ thống kiến trúc: chúng thay thế những mảng tường và định hình trải nghiệm bên trong."),
      S("object", "BỐI CẢNH", "Một nhà thờ được dựng lại sau năm 1194.", "Vụ cháy phá hủy phần lớn nhà thờ Romanesque thế kỷ XII. Công trình Gothic mới được dựng trong khoảng ba thập kỷ."),
      S("interlude", "ÁNH NHÌN", "Từ nền nhà, mắt đi qua cột đến kính.", "Các đường đứng và vòm tạo chuyển động hướng lên; kính màu làm vùng cao phát sáng."),
      S("split", "KẾT CẤU", "Đá rút lui để nhường chỗ cho kính.", "Vòm sườn và trụ bay giúp tải trọng được tổ chức lại, mở rộng diện tích cửa sổ ở phần cao."),
      S("sequence", "HỆ THỐNG", "Mỗi nhịp tường phối hợp ba phần.", "Nhà thờ tổ chức các gian theo một trật tự kiến trúc lặp.", ["Cửa sổ nhọn", "Cửa sổ hoa", "Nhịp cột và vòm"]),
      S("detail", "HÌNH HỌC", "Cửa sổ hoa gom nhiều trục vào tâm.", "Các vòng và thanh đá tạo nên cấu trúc hướng tâm. Mắt có thể đọc hình như một sơ đồ trước khi nhận ra chủ đề."),
      S("split", "MÀU SẮC", "Ánh sáng đi qua kính rồi nhuộm không gian.", "Nhà thờ mô tả màu sắc như những viên ngọc của thành thánh trong thị kiến Kitô giáo."),
      S("statement", "CẢM NHẬN", "Bức tường không còn đứng yên.", "Ánh sáng thay đổi theo thời gian trong ngày; kiến trúc vì thế luôn hiện ra hơi khác."),
      S("quiet", "CÔNG TRÌNH", "Không có một kiến trúc sư duy nhất được biết tên.", "Trang của nhà thờ lưu ý có thể đã có nhiều kiến trúc sư tham gia qua các giai đoạn xây dựng."),
      S("sequence", "ĐỘ CAO", "Cấu trúc dẫn lực xuống, ánh nhìn đi lên.", "Cột, vòm, tầng cửa và trụ bay cùng tạo ra nhịp nâng của nội thất.", ["Vòm sườn phân phối lực", "Trụ bay hỗ trợ tường cao", "Cửa sổ đưa ánh sáng vào gian giữa"]),
      S("split", "THỜ PHỤNG", "Ánh sáng mang một lớp nghĩa thiêng.", "Trong cách giải thích của nhà thờ, ánh sáng vừa làm rõ hình khối vừa gợi lên sự hiện diện của thần tính."),
      S("inquiry", "ĐIỀU CẦN NHỚ", "Một cửa sổ hoa không đại diện cho toàn bộ Chartres.", "Nhà thờ có nhiều cụm kính với vị trí và câu chuyện khác nhau. Hình minh họa trong bộ slide là concept art, không phải bản chép chính xác một cửa sổ."),
      S("archive", "THỜI GIAN", "Một công trình mang nhiều lớp niên đại.", "Mặt tiền phía tây có những phần từ 1134–1160 còn tồn tại trước vụ cháy; công trình Gothic kế thừa một phần nền cũ."),
      S("detail", "CÁCH NHÌN", "Nhìn cả kính lẫn phần đá quanh kính.", "Tracery, vòm nhọn, cột và màu kính chỉ phát huy hết ý nghĩa khi được nhìn cùng nhau."),
      S("sequence", "ĐỌC KHÔNG GIAN", "Ba nhịp đưa người xem qua nhà thờ.", "Chuyển động của mắt là một phần trải nghiệm kiến trúc.", ["Đi vào từ bóng tối", "Ngước lên theo hàng cột", "Dừng lại ở ánh sáng màu"]),
      S("split", "ĐỪNG NHẦM", "Màu sắc không chỉ để trang trí.", "Kính màu làm việc cùng kết cấu và nghi lễ. Không nên rút gọn Gothic thành “nhà thờ nhiều cửa sổ”."),
      S("statement", "GHI NHỚ", "Đá tạo khung; ánh sáng hoàn tất cảm giác.", "Chartres không tách kỹ thuật xây dựng khỏi trải nghiệm thị giác."),
      S("closing", "MANG THEO", "Đổi vị trí đứng, đổi cách nhìn.", "Hãy đọc nhà thờ bằng chuyển động: từ mặt đất, theo các vòm, đến những mảng kính trên cao."),
      S("sources", "NGUỒN THAM KHẢO", "Cathédrale Notre-Dame de Chartres.", "Niên đại, cấu trúc, cửa sổ và vai trò của ánh sáng được đối chiếu với trang kiến trúc của nhà thờ."),
    ],
  },
  {
    slug: "06-giotto",
    shortTitle: "Giotto at Padua",
    title: "Cơ thể bước vào không gian",
    subtitle: "Giotto và vòng tranh Scrovegni Chapel, Padova",
    work: "Scrovegni Chapel fresco cycle",
    maker: "Giotto di Bondone",
    date: "1303–1305",
    medium: "Tranh fresco phủ gần như toàn bộ tường nhà nguyện",
    artwork: "06-giotto-fresco.jpg",
    style: "giotto",
    styleName: "Fresco Padova · xanh lam, thạch cao ấm và cử chỉ rõ",
    theme: {
      paper: "#eee1d5", ink: "#302d2c", muted: "#766963", accent: "#8d3b38",
      accent2: "#31577d", deep: "#263c56", veil: "rgba(238,225,213,.93)",
      serif: "Georgia, 'Palatino Linotype', serif", sans: "'Segoe UI', Arial, sans-serif",
    },
    sources: [
      ["Scrovegni Chapel, The Chapel of Giotto", "https://www.cappelladegliscrovegni.it/index.php/en/la-cappella-di-giotto"],
      ["Padova Urbs Picta, Giotto's Scrovegni Chapel", "https://padovacultura.padovanet.it/en/"],
    ],
    slides: [
      S("cover", "PADOVA · 1303–1305", "Cơ thể bước vào không gian", "Giotto vẽ một câu chuyện lớn lên khắp tường Scrovegni Chapel — bằng cử chỉ, nhịp cảnh và màu sắc."),
      S("thesis", "Ý CHÍNH", "Cảm xúc trở thành một phần của kiến trúc.", "Người xem không đối diện một bức tranh đơn lẻ mà đi vào một chuỗi hình ảnh bao quanh căn phòng."),
      S("object", "ĐỊNH DANH", "Một chu kỳ fresco bao kín nhà nguyện.", "Các bức tường kể những sự kiện trong đời Đức Mẹ và Đức Kitô; bức Tận thế phổ quát khép lại chu kỳ."),
      S("interlude", "KHÔNG GIAN", "Cảnh diễn ra quanh người xem.", "Vị trí của altar và các bức tường tạo nên thứ tự nhìn, không chỉ một phông nền phía sau tranh."),
      S("split", "BẢO TRỢ", "Enrico Scrovegni đặt làm chu kỳ tranh.", "Nhà nguyện được dựng sau năm 1300 theo hình elip của phần còn lại từ đấu trường La Mã."),
      S("sequence", "CẤU TRÚC", "Câu chuyện đi từ đời sống đến phán xét.", "Toàn bộ chu kỳ được tổ chức thành một hành trình thị giác.", ["Những cảnh về Đức Mẹ", "Những cảnh về Đức Kitô", "Tận thế phổ quát đối diện bàn thờ"]),
      S("detail", "CỬ CHỈ", "Một bàn tay có thể đổi hướng câu chuyện.", "Hãy nhìn cách nhân vật hướng về nhau: tư thế và khoảng cách làm mối quan hệ trở nên dễ đọc."),
      S("split", "CƠ THỂ", "Nhân vật có trọng lượng và chỗ đứng.", "Hình khối mạnh và cách nhóm người trong không gian giúp cảnh bớt xa cách với người xem."),
      S("statement", "NHỊP CẢM XÚC", "Khoảng lặng cũng là một sự kiện.", "Giotto làm cảm xúc hiện ra qua khoảng cách, hướng nhìn và sự im lặng giữa các nhân vật."),
      S("quiet", "MÀU SẮC", "Xanh lam neo những cảnh vào một thế giới.", "Màu sắc liên kết các mảng tường và tạo nền thống nhất cho chu kỳ hình ảnh."),
      S("sequence", "TƯỜNG VÀ TRANH", "Bề mặt được tổ chức như một dàn cảnh.", "Khung kiến trúc bên trong chu kỳ chia các cảnh mà không tách chúng khỏi căn phòng.", ["Tầng hình ảnh", "Dải trang trí", "Các ô tranh theo trình tự"]),
      S("split", "KHÔNG GIAN GỐC", "Nhà nguyện từng nối với cung điện gia đình.", "Công trình ban đầu gắn với cung điện Scrovegni; việc chọn địa điểm dựa trên nền đấu trường La Mã."),
      S("inquiry", "ĐỌC LỊCH SỬ", "Đừng gọi Giotto là người “phát minh” hiện thực.", "Có thể mô tả các hình khối và cử chỉ cụ thể mà không biến thay đổi nghệ thuật thành một câu chuyện tiến bộ đơn giản."),
      S("archive", "BẢO TỒN", "Màu fresco cần một môi trường ổn định.", "Từ thập niên 1970, tình trạng tòa nhà, chất lượng không khí và bề mặt tranh được theo dõi liên tục."),
      S("detail", "NHÌN GẦN", "Khoảng cách quyết định điều mắt nhận ra.", "Từ xa, ta thấy nhịp cảnh. Ở gần, ta nhận ra biểu cảm và cách các nhân vật đáp lại nhau."),
      S("sequence", "ĐỌC CỬ CHỈ", "Ba câu hỏi cho một cảnh.", "Thay vì bắt đầu bằng biểu tượng, hãy bắt đầu bằng hành động nhìn thấy được.", ["Ai đang hướng về ai?", "Cử chỉ nào làm cảnh đổi hướng?", "Khoảng trống nào có ý nghĩa?"]),
      S("split", "ĐỪNG NHẦM", "Giotto không vẽ trên một tấm phẳng.", "Chu kỳ nằm trên các bức tường của một nhà nguyện; ánh sáng và đường đi của người xem đều ảnh hưởng trải nghiệm."),
      S("statement", "GHI NHỚ", "Một căn phòng có thể kể chuyện.", "Ở Scrovegni Chapel, cảm xúc không nằm ngoài kiến trúc — nó chạy cùng các bức tường."),
      S("closing", "MANG THEO", "Đọc căn phòng như một chuỗi cảnh.", "Hãy nhìn cả câu chuyện lẫn nơi câu chuyện được đặt vào."),
      S("sources", "NGUỒN THAM KHẢO", "Scrovegni Chapel và Padova Urbs Picta.", "Niên đại, người đặt làm, chu kỳ hình ảnh, kiến trúc và công tác bảo tồn được đối chiếu với nguồn của thành phố Padova."),
    ],
  },
  {
    slug: "07-siena",
    shortTitle: "Simone Martini",
    title: "Vàng giữ lời chào lại",
    subtitle: "Annunciation của Simone Martini và Lippo Memmi, 1333",
    work: "Annunciation with St. Maxima and St. Ansanus",
    maker: "Simone Martini và Lippo Memmi",
    date: "1333",
    medium: "Tempera trên gỗ, nền vàng",
    artwork: "07-simone-annunciation.jpg",
    style: "siena",
    styleName: "Siena Gothic · vàng lá, nét thanh và chuyển động uốn",
    theme: {
      paper: "#f3e9d5", ink: "#382e2c", muted: "#756b5d", accent: "#963e3c",
      accent2: "#b5964d", deep: "#34272a", veil: "rgba(243,233,213,.93)",
      serif: "Georgia, 'Palatino Linotype', serif", sans: "'Segoe UI', Arial, sans-serif",
    },
    sources: [
      ["Uffizi Galleries, Annunciation by Simone Martini", "https://www.uffizi.it/en/artworks/annunciation-with-st-margaret-and-st-ansanus"],
      ["Uffizi Galleries, collection entry", "https://www.uffizi.it/en/artworks/annunciation-with-st-margaret-and-st-ansanus"],
    ],
    slides: [
      S("cover", "SIENA · 1333", "Vàng giữ lời chào lại", "Một khoảnh khắc bất ngờ được giữ trong đường cong, nền vàng và những dòng chữ nổi trên tranh."),
      S("thesis", "Ý CHÍNH", "Chuyển động chạy qua một bề mặt gần như phẳng.", "Áo choàng, cánh thiên thần và dáng người tạo nhịp cho cảnh Annunciation."),
      S("object", "ĐỊNH DANH", "Tác phẩm có chữ ký và ngày tháng.", "Uffizi ghi năm 1333 và chất liệu tempera trên gỗ với nền vàng; tranh được làm cho bàn thờ thánh Ansanus tại nhà thờ Siena."),
      S("interlude", "KHOẢNH KHẮC", "Gabriel vừa xuất hiện.", "Áo choàng còn bay và đôi cánh mở rộng cho thấy khoảnh khắc đến đột ngột."),
      S("split", "PHẢN ỨNG", "Mary lùi lại và khép áo choàng.", "Tư thế co lại đối đáp với chuyển động hướng vào của thiên thần."),
      S("sequence", "ĐỌC CẢNH", "Một lời chào đi qua giữa hai nhân vật.", "Dòng inscription đặt lời chào vào khoảng vàng phía trên.", ["Thiên thần đưa lời báo", "Mary phản ứng bằng cử chỉ", "Người xem đọc cảnh theo một đường cong"]),
      S("detail", "ĐƯỜNG CONG", "Nét thanh khiến mắt di chuyển liên tục.", "Đường áo, cánh và thân cây hoa huệ nối các phần trong tranh mà không cần không gian sâu."),
      S("split", "NỀN VÀNG", "Vàng vừa là chất liệu vừa là không gian.", "Nền vàng phản sáng, đồng thời tách cảnh khỏi một địa điểm đời thường rõ ràng."),
      S("statement", "CHI TIẾT", "Cuốn sách đang mở trên tay Mary.", "Uffizi ghi nhận cuốn sách, ngai khắc hoa văn và sàn cẩm thạch — chi tiết gợi nhắc lối sống của tầng lớp giàu có thế kỷ XIV."),
      S("quiet", "VẬT THỂ", "Một bình hoa huệ nằm trên trục giữa.", "Hoa huệ thường được đọc như biểu tượng của Đức Mẹ; đây là quy ước biểu tượng, không phải một vật thể ngẫu nhiên."),
      S("sequence", "KHUNG TRANH", "Các thánh mở rộng cảnh sang hai bên.", "Thánh Ansanus xuất hiện cùng một vị thánh khác; Uffizi ghi nhận sự bất định quanh danh tính người thứ hai.", ["Ansanus gắn với Siena", "Tên Judith dưới nhân vật nữ được bảo tàng cho là sai", "Có thể là Maxima hoặc Margaret"]),
      S("split", "HAI NGHỆ NHÂN", "Simone và Lippo cùng ký tên.", "Dòng chữ gốc ghi cả hai họa sĩ. Giới phê bình thường cho rằng Simone đảm nhiệm phần lớn ý tưởng và thi công."),
      S("inquiry", "ĐIỀU ĐỌC ĐƯỢC", "Tư thế rõ hơn danh tính.", "Ngay cả khi chưa thống nhất nhân vật phụ là ai, ta vẫn có thể đọc hướng nhìn và quan hệ giữa các nhân vật."),
      S("archive", "BỐI CẢNH", "Bàn thờ đặt tranh vào trung tâm Siena.", "Tác phẩm được làm cho gian ngang của nhà thờ chính tòa, trong một không gian dâng kính Đức Mẹ."),
      S("detail", "KỸ THUẬT", "Tempera giữ đường nét sắc và mỏng.", "Bề mặt gỗ cùng lớp màu giúp các chi tiết tinh xảo hiện rõ bên trên nền vàng."),
      S("sequence", "ĐỌC HÌNH", "Ba chuyển động dẫn mắt.", "Quan sát cấu trúc trước khi giải nghĩa từng vật thể.", ["Áo choàng đang bay", "Mary khép người lại", "Hoa huệ nối trục giữa"]),
      S("split", "ĐỪNG NHẦM", "Đẹp không đồng nghĩa với tĩnh.", "Nền vàng và đường viền tinh xảo có thể trông trang nghiêm, nhưng toàn cảnh đầy chuyển động nhỏ."),
      S("statement", "GHI NHỚ", "Vàng làm thời gian chậm lại; đường nét làm nó chuyển động.", "Căng thẳng ấy tạo nên sức sống của bức Annunciation."),
      S("closing", "MANG THEO", "Theo một đường cong từ cánh đến hoa.", "Đừng nhìn hình như một bảng trang trí. Hãy theo dõi cách cử chỉ đi qua nó."),
      S("sources", "NGUỒN THAM KHẢO", "Uffizi Galleries.", "Ngày tháng, chất liệu, inscription, nhân vật và lịch sử đặt làm được đối chiếu với hồ sơ bộ sưu tập Uffizi."),
    ],
  },
  {
    slug: "08-tres-riches",
    shortTitle: "Très Riches Heures",
    title: "Một năm được vẽ như quyền lực",
    subtitle: "The Très Riches Heures du duc de Berry và lịch tháng trong sách",
    work: "Très Riches Heures du duc de Berry",
    maker: "Anh em Limbourg và các họa sĩ hoàn thiện về sau",
    date: "Bắt đầu khoảng 1411; hoàn thiện qua nhiều giai đoạn đến cuối thế kỷ XV",
    medium: "Thủ bản minh họa trên vellum",
    artwork: "08-tres-riches-calendar.jpg",
    style: "tres-riches",
    styleName: "Tiểu họa cung đình · xanh trời, vàng và khung lịch",
    theme: {
      paper: "#f2ead8", ink: "#2b3035", muted: "#756d62", accent: "#3b6794",
      accent2: "#b28d45", deep: "#29384f", veil: "rgba(242,234,216,.93)",
      serif: "Georgia, 'Palatino Linotype', serif", sans: "'Segoe UI', Arial, sans-serif",
    },
    sources: [
      ["Château de Chantilly, Très Riches Heures du duc de Berry", "https://chateaudechantilly.fr/categ-collection/manuscrits/les-tres-riches-heures-du-duc-de-berry/"],
      ["Château de Chantilly, Cabinet des Livres", "https://chateaudechantilly.fr/chateau/le-cabinet-des-livres/"],
    ],
    slides: [
      S("cover", "COURT OF BERRY · THẾ KỶ XV", "Một năm được vẽ như quyền lực", "Lịch trong Très Riches Heures đặt công việc, mùa vụ và đời sống cung đình vào cùng một cuốn sách cầu nguyện."),
      S("thesis", "Ý CHÍNH", "Lịch tháng vừa đo thời gian vừa dựng thế giới.", "Mỗi tiểu họa đưa người xem tới một mùa, một cảnh lao động hoặc một hoạt động của tầng lớp quý tộc."),
      S("object", "ĐỊNH DANH", "Một quyển sách giờ cầu nguyện.", "Château de Chantilly ghi đây là thủ bản thế kỷ XV trên vellum, với 66 minh họa lớn và 65 minh họa nhỏ."),
      S("interlude", "NGƯỜI ĐẶT LÀM", "Jean de Berry muốn cuốn sách thật giàu hình ảnh.", "Ông đặt anh em Paul, Jean và Herman de Limbourg thực hiện thủ bản vào khoảng năm 1411."),
      S("split", "LỊCH", "Mười hai tháng thành mười hai cảnh.", "Các cảnh trong lịch đặt thời tiết, mùa vụ và hoạt động xã hội vào một nhịp lặp theo năm."),
      S("sequence", "NHÌN THEO MÙA", "Một năm không trôi cùng một tốc độ.", "Nông nghiệp và đời sống triều đình hiện ra theo lịch tự nhiên.", ["Thời tiết đổi", "Việc đồng áng chuyển mùa", "Đời sống quý tộc theo dõi năm"]),
      S("detail", "TIỂU HỌA", "Chi tiết nhỏ mở ra một thế giới lớn.", "Các khuôn viên, lâu đài, trang phục và đồ vật được dựng ở quy mô nhỏ nhưng dày thông tin."),
      S("split", "CUNG ĐÌNH", "Lao động và xa hoa cùng nằm trên trang.", "Cảnh mùa vụ đứng cạnh hình ảnh hoạt động của quý tộc, làm rõ trật tự xã hội mà người bảo trợ nhìn thấy."),
      S("statement", "VẬT THỂ", "Một cuốn sách cũng là một tuyên bố về vị thế.", "Mức độ tinh xảo và số lượng hình ảnh gắn với tài lực, gu thẩm mỹ và lòng sùng đạo của Jean de Berry."),
      S("quiet", "NHIỀU BÀN TAY", "Một thế hệ không hoàn thành toàn bộ thủ bản.", "Anh em Limbourg mất năm 1416; những người khác tiếp tục bổ sung và hoàn thiện sách trong các thập kỷ sau."),
      S("sequence", "NIÊN ĐẠI", "Lịch sử tác phẩm trải gần một thế kỷ.", "Chantilly ghi dải thời gian sáng tác 1411–1489.", ["Khoảng 1411: bắt đầu theo đơn đặt hàng", "1416: Jean de Berry và anh em Limbourg qua đời", "Cuối thế kỷ XV: các họa sĩ khác tiếp tục hoàn thiện"]),
      S("split", "PHONG CÁCH", "Nhiều truyền thống gặp trong một trang.", "Chantilly mô tả ảnh hưởng Pháp, Flemish, Italy, phương Đông và cổ đại trong nghệ thuật Gothic quốc tế của thủ bản."),
      S("inquiry", "GÓC NHÌN", "Ai có quyền quyết định cảnh nào đáng vẽ?", "Cuốn sách cho thấy đời sống qua một góc nhìn cung đình. Những gì nó chọn giữ lại cũng quan trọng như những gì nó bỏ qua."),
      S("archive", "SƯU TẬP", "Một chuyến đi đến Chantilly năm 1856.", "Duc d'Aumale mua thủ bản tại Genoa và đưa nó vào bộ sưu tập hiện lưu tại Château de Chantilly."),
      S("detail", "CÁCH NHÌN", "Đọc cảnh, rồi đọc người đặt làm.", "Một trang lịch có thể cho ta thấy mùa vụ; cách sắp đặt cũng cho thấy quyền lực và thị hiếu của người bảo trợ."),
      S("sequence", "ĐỪNG NHẦM", "Đừng xem đây là ảnh chụp của toàn xã hội.", "Tiểu họa vừa chứa quan sát, vừa phản ánh lựa chọn và lý tưởng của người đặt làm.", ["Lịch tháng không đại diện mọi cộng đồng", "Cảnh lao động được nhìn từ cuốn sách cung đình", "Bản thảo được nhiều họa sĩ hoàn thiện"]),
      S("split", "BẢO TỒN", "Một cuốn sách quý được nhìn theo từng trang.", "Việc trưng bày và phục chế phải cân bằng giữa khả năng tiếp cận với sự an toàn của vellum và màu vẽ."),
      S("statement", "GHI NHỚ", "Thời gian trở thành hình ảnh; hình ảnh trở thành quyền lực.", "Đó là hai câu chuyện chạy song song trong lịch của Très Riches Heures."),
      S("closing", "MANG THEO", "Hãy nhìn ai đang được nghỉ ngơi, ai đang làm việc.", "Câu hỏi ấy giúp đọc lịch tháng vượt ra ngoài vẻ đẹp của một tiểu họa."),
      S("sources", "NGUỒN THAM KHẢO", "Château de Chantilly.", "Tên gọi, niên đại, người đặt làm, quy mô thủ bản và lịch sử sưu tập được đối chiếu với hồ sơ của Château de Chantilly."),
    ],
  },
  {
    slug: "09-arnolfini",
    shortTitle: "Arnolfini Portrait",
    title: "Căn phòng khép kín, câu hỏi mở",
    subtitle: "Jan van Eyck và Arnolfini Portrait, 1434",
    work: "Portrait of Giovanni(?) Arnolfini and his Wife",
    maker: "Jan van Eyck",
    date: "1434",
    medium: "Sơn dầu trên gỗ sồi",
    artwork: "09-van-eyck-interior.jpg",
    style: "arnolfini",
    styleName: "Nội thất Flemish · ánh cửa sổ, gỗ tối và chi tiết soi gương",
    theme: {
      paper: "#e4ded3", ink: "#292a27", muted: "#66675e", accent: "#344c39",
      accent2: "#9b573d", deep: "#1d211e", veil: "rgba(228,222,211,.93)",
      serif: "Georgia, 'Palatino Linotype', serif", sans: "'Segoe UI', Arial, sans-serif",
    },
    sources: [
      ["National Gallery, The Arnolfini Portrait", "https://www.nationalgallery.org.uk/paintings/jan-van-eyck-the-arnolfini-portrait"],
      ["National Gallery, Jan van Eyck", "https://www.nationalgallery.org.uk/artists/jan-van-eyck"],
    ],
    slides: [
      S("cover", "BRUGES · 1434", "Căn phòng khép kín, câu hỏi mở", "Một đôi người đứng trong nội thất tưởng như quen thuộc — nhưng mọi thứ trong tranh đều được sắp đặt."),
      S("thesis", "Ý CHÍNH", "Chi tiết chân thực không chứng minh đây là ảnh chụp.", "Van Eyck tạo cảm giác ta có thể bước vào căn phòng, rồi âm thầm điều chỉnh các vật thể để phục vụ bố cục."),
      S("object", "ĐỊNH DANH", "Tranh sơn dầu trên bảng gỗ sồi.", "National Gallery định niên đại 1434 và ghi người đàn ông là Giovanni(?) Arnolfini; danh tính người phụ nữ chưa rõ."),
      S("interlude", "CÁI NHÌN", "Một bàn tay chặn chuyển động lại.", "Cử chỉ giơ tay của người đàn ông có thể là lời chào. Cảnh giữ người xem ở ngưỡng cửa giữa chứng kiến và suy đoán."),
      S("split", "GƯƠNG", "Một mặt gương mở rộng căn phòng.", "Gương cầu phản chiếu cửa và hai bóng người. National Gallery đặt khả năng họ là họa sĩ hoặc người hầu dưới dạng câu hỏi."),
      S("sequence", "VẬT THỂ", "Đồ vật cho thấy địa vị mà không cần lời kể.", "Vải vóc, đồ đồng, hoa quả và nội thất nói về của cải và phong cách sống.", ["Vải dày và màu bão hòa", "Đồ vật phản sáng", "Ánh sáng từ cửa sổ định vị căn phòng"]),
      S("detail", "ÁNH SÁNG", "Ánh sáng làm bề mặt trở nên có trọng lượng.", "Gỗ bóng, kim loại, thủy tinh và vải nhận sáng khác nhau; mắt người xem đọc chất liệu qua những khác biệt ấy."),
      S("split", "KỸ THUẬT", "Lớp sơn mỏng tích lũy độ sâu.", "National Gallery mô tả cách van Eyck dùng dầu để xây các lớp men trong suốt, làm nổi hiệu ứng bề mặt và ánh sáng."),
      S("statement", "BÍ ẨN", "Căn phòng trông đúng — nhưng không khớp hoàn toàn.", "Phân tích của National Gallery lưu ý tỷ lệ không gian, đèn treo và vị trí đồ vật không hoàn toàn khả thi."),
      S("quiet", "DẤU TÊN", "“Jan van Eyck was here. 1434.”", "Dòng chữ trên tường khiến người vẽ có vẻ hiện diện ngay bên trong căn phòng."),
      S("sequence", "PHÂN TÍCH KỸ THUẬT", "Bản vẽ dưới lớp màu đổi trong lúc làm.", "Hình ảnh hồng ngoại cho thấy van Eyck chỉnh lại nhân vật và thêm một số đồ vật ở giai đoạn sau.", ["Đường nét ban đầu xác định bố cục", "Một số vật thể chưa có trong bản đầu", "Các khuôn mặt và tư thế được điều chỉnh"]),
      S("split", "NHÂN VẬT", "Tên gọi vẫn mang dấu hỏi.", "National Gallery xem Giovanni di Nicolao di Arnolfini là ứng viên có khả năng; danh tính người phụ nữ không chắc chắn."),
      S("inquiry", "CÁCH ĐỌC", "Biểu tượng nào là dữ kiện, biểu tượng nào là giả thuyết?", "Gương, chó, nến và hoa quả đều có nhiều cách đọc. Chỉ nên trình bày diễn giải khi nêu rõ mức độ chắc chắn."),
      S("archive", "ĐỜI SỐNG TÁC PHẨM", "Từ bộ sưu tập hoàng gia đến London.", "Bức tranh vào bộ sưu tập National Gallery năm 1842; bảo tàng ghi đây là tác phẩm Netherlandish đầu tiên của mình."),
      S("detail", "NHÌN GẦN", "Phản chiếu nằm trong phản chiếu.", "Bề mặt gương vừa cho thấy người ngoài khung vừa làm cong căn phòng. Cái nhìn không bao giờ chỉ đi theo một hướng."),
      S("sequence", "ĐỪNG NHẦM", "Ba dữ kiện, ba giới hạn.", "Nhãn tác phẩm và phân tích cần giữ nguyên những dấu hỏi của hồ sơ bảo tàng.", ["Ngày 1434: ghi rõ trên tranh", "Người đàn ông: có thể là Arnolfini", "Ý nghĩa nghi lễ của cảnh: vẫn được tranh luận"]),
      S("split", "PHƯƠNG PHÁP NHÌN", "Mô tả trước, suy luận sau.", "Nói điều mắt thấy — vị trí, phản chiếu, ánh sáng — rồi mới cân nhắc ý nghĩa có thể có."),
      S("statement", "GHI NHỚ", "Một căn phòng rất thật có thể là một cấu trúc được tưởng tượng.", "Chân thực ở đây là kết quả của lựa chọn, không phải bằng chứng về một khoảnh khắc được chụp lại."),
      S("closing", "MANG THEO", "Đứng ở cửa. Nhìn lại vào gương.", "Hãy để tác phẩm mở câu hỏi thay vì vội chọn một lời giải duy nhất."),
      S("sources", "NGUỒN THAM KHẢO", "National Gallery, London.", "Định danh, chất liệu, niên đại, phân tích kỹ thuật và provenance được đối chiếu với hồ sơ của National Gallery."),
    ],
  },
  {
    slug: "10-merode",
    shortTitle: "Mérode Triptych",
    title: "Đời thường mở thành nơi thiêng",
    subtitle: "The Annunciation Triptych và căn phòng cầu nguyện Flemish",
    work: "Annunciation Triptych (Merode Altarpiece)",
    maker: "Xưởng Robert Campin",
    date: "Khoảng 1427–1432",
    medium: "Sơn dầu trên gỗ sồi",
    artwork: "10-merode-triptych.jpg",
    style: "merode",
    styleName: "Triptych Hà Lan · ba cánh, gỗ ấm và xanh lam–đỏ",
    theme: {
      paper: "#eee6d9", ink: "#30302f", muted: "#726a60", accent: "#3e5c85",
      accent2: "#9d4540", deep: "#25282a", veil: "rgba(238,230,217,.93)",
      serif: "Georgia, 'Palatino Linotype', serif", sans: "'Segoe UI', Arial, sans-serif",
    },
    sources: [
      ["The Met, Annunciation Triptych (Merode Altarpiece)", "https://www.metmuseum.org/art/collection/search/470304"],
      ["The Met, Early Netherlandish Painting", "https://www.metmuseum.org/toah/hd/enet/ho_32.100.36.htm"],
    ],
    slides: [
      S("cover", "TOURNAI · KHOẢNG 1427–1432", "Đời thường mở thành nơi thiêng", "Một khung triptych đặt cảnh Annunciation vào căn phòng có bàn, sách, cửa sổ và một xưởng mộc."),
      S("thesis", "Ý CHÍNH", "Điều thiêng hiện diện trong một căn nhà quen thuộc.", "Các chi tiết đời thường khiến sự kiện tôn giáo có vẻ đang diễn ra ngay trong thế giới của chủ nhân tác phẩm."),
      S("object", "ĐỊNH DANH", "Một triptych từ xưởng Robert Campin.", "The Met định niên đại khoảng 1427–1432, ghi chất liệu sơn dầu trên gỗ sồi và nơi sản xuất là Tournai."),
      S("interlude", "BA CÁNH", "Ba phần mở ra ba vị trí nhìn.", "Trung tâm là cảnh Annunciation; cánh trái có người bảo trợ; cánh phải là Joseph trong xưởng mộc."),
      S("split", "CẢNH TRUNG TÂM", "Gabriel vừa bước vào phòng.", "Ánh sáng qua cửa và tư thế các nhân vật tạo cảm giác một sự kiện đang bắt đầu ngay lúc người xem nhìn vào."),
      S("sequence", "CÁNH TRÁI", "Người bảo trợ nhìn thấy cảnh thiêng.", "Ông cùng vợ xuất hiện qua một cánh cửa mở; một sứ giả đứng ở lối vào khu vườn.", ["Người bảo trợ quỳ", "Người vợ ở phía sau", "Sứ giả vọng lại hình ảnh Gabriel"]),
      S("detail", "CÁNH PHẢI", "Joseph làm việc bằng đôi tay.", "Trong xưởng, Joseph đang khoan tấm ván — một cảnh lao động thường ngày được đặt cạnh sự kiện thiêng."),
      S("split", "ĐỒ VẬT", "Một vật nhỏ có thể mở ra một lớp nghĩa.", "Bẫy chuột của Joseph được liên hệ với một ẩn dụ trong trước tác Augustine; The Met nói đây là cách diễn giải được cho là có thể."),
      S("statement", "ÁNH SÁNG", "Vệt sáng mang hình ảnh đi qua cửa.", "The Met mô tả một hình Christ thu nhỏ được mang theo các tia sáng vàng từ cửa sổ bên trái."),
      S("quiet", "CĂN PHÒNG", "Mỗi vật thể làm căn phòng có nhịp sống.", "Bàn, sách, dụng cụ và cửa sổ khiến khung cảnh cầu nguyện bám vào đời sống nội thất thế kỷ XV."),
      S("sequence", "CÔNG DỤNG", "Một tác phẩm được dùng để cầu nguyện riêng.", "The Met cho rằng chủ nhân có thể đã mua triptych để sử dụng trong thực hành cầu nguyện tại nhà.", ["Đóng mở ba cánh", "Đặt trong không gian gia đình", "Kết nối người bảo trợ với cảnh trung tâm"]),
      S("split", "XƯỞNG VẼ", "Tác phẩm được thực hiện qua nhiều giai đoạn.", "Phân tích kỹ thuật và phong cách gợi ý các cánh được thêm vào theo thời gian, có thể qua tay nhiều nghệ nhân."),
      S("inquiry", "THAY ĐỔI", "Một cửa sổ từng có nền vàng.", "The Met ghi nhận cửa sổ ở panel giữa ban đầu phủ vàng lá; bầu trời xanh và phù hiệu được thêm sau."),
      S("archive", "NGƯỜI BẢO TRỢ", "Một cuộc hôn nhân được đưa vào lịch sử tranh.", "The Met cho rằng chân dung người vợ và sứ giả có thể được thêm vào thập niên 1430, sau khi người bảo trợ kết hôn."),
      S("detail", "CÁCH NHÌN", "Đi từ cửa mở đến bàn làm việc.", "Ánh sáng, cửa và dụng cụ nối ba cánh thành một trường nhìn thay vì ba hình ảnh tách rời."),
      S("sequence", "ĐỌC TRIPTYCH", "Ba bước giữ câu chuyện liền mạch.", "Thử đọc tác phẩm từ trái sang phải rồi quay lại trung tâm.", ["Ai đang nhìn?", "Sự kiện diễn ra ở đâu?", "Vật thể nào lặp ý giữa các cánh?"]),
      S("split", "ĐỪNG NHẦM", "Đây không phải một bức ảnh gia đình.", "Triptych có thể dựa trên người thật và nội thất quen thuộc, nhưng vẫn là một cấu trúc cầu nguyện được thiết kế có chủ đích."),
      S("statement", "GHI NHỚ", "Ba căn phòng cùng chia sẻ một khoảnh khắc.", "Cấu trúc triptych biến kiến trúc gia đình thành nơi gặp gỡ giữa người xem và hình ảnh thiêng."),
      S("closing", "MANG THEO", "Mở cả ba cánh bằng ánh nhìn.", "Hãy nhìn chủ nhân, Gabriel và Joseph như ba phần của cùng một thế giới."),
      S("sources", "NGUỒN THAM KHẢO", "The Metropolitan Museum of Art.", "Định danh, chất liệu, niên đại, diễn giải biểu tượng và các giai đoạn thực hiện được đối chiếu với hồ sơ The Met."),
    ],
  },
];

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const css = `
  :root {
    color-scheme: light;
    --paper: #eee7d8; --ink: #2d2b28; --muted: #71685c;
    --accent: #9d4b3d; --accent2: #b59650; --deep: #211f1b;
    --veil: rgba(238,231,216,.93); --serif: Georgia, 'Palatino Linotype', serif;
    --sans: 'Segoe UI', Arial, sans-serif; --art: none;
    font-family: var(--sans); color: var(--ink); background: var(--deep);
  }
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; scroll-snap-type: y mandatory; scrollbar-color: var(--accent2) var(--deep); }
  body { margin: 0; overflow-x: hidden; background: var(--deep); }
  h1, h2, h3, p, ol, figure { margin: 0; }
  .pl-slide {
    isolation: isolate; position: relative; display: flex; width: 100vw; height: 100vh;
    min-height: 560px; overflow: hidden; scroll-snap-align: start; scroll-snap-stop: always;
    background: var(--paper); page-break-after: always;
  }
  .pl-slide::before {
    content: ""; position: absolute; inset: 0; z-index: -1;
    background-image: linear-gradient(0deg, var(--veil), var(--veil)), var(--art);
    background-size: cover; background-position: center; opacity: 1;
    transform: scale(1.035); transition: transform 1.2s cubic-bezier(.2,.75,.2,1), filter 1.2s ease;
    filter: saturate(.86);
  }
  .pl-slide.active::before { transform: scale(1); filter: saturate(1); }
  .inner {
    position: relative; width: 100%; height: 100%; padding: 86px 112px 80px;
    display: flex; flex-direction: column; justify-content: space-between; z-index: 1;
  }
  .copy { max-width: 1180px; }
  .eyebrow, .folio, .cover-meta, .source-label {
    font-size: 15px; line-height: 1.35; font-weight: 750; letter-spacing: .19em; text-transform: uppercase;
  }
  .eyebrow { color: var(--accent); margin-bottom: 24px; }
  .slide-title {
    max-width: 1160px; font-family: var(--serif); font-weight: 500;
    font-size: clamp(52px, 6.4vw, 100px); letter-spacing: -.052em; line-height: .98;
    text-wrap: balance; color: var(--ink);
  }
  .slide-body {
    max-width: 880px; margin-top: 30px; font-size: clamp(21px, 1.9vw, 29px);
    line-height: 1.48; color: var(--muted); text-wrap: pretty;
  }
  .footer { display: flex; align-items: end; justify-content: space-between; gap: 32px; color: var(--muted); }
  .folio { color: var(--accent); letter-spacing: .12em; }
  .work-meta { max-width: 60%; text-align: right; font-family: var(--serif); font-size: 17px; line-height: 1.35; }
  .points { display: flex; gap: 38px; max-width: 1160px; padding: 0; margin: 42px 0 0; list-style: none; }
  .points li { flex: 1; padding-top: 16px; border-top: 1px solid color-mix(in srgb, var(--accent) 55%, transparent); font-size: 21px; line-height: 1.42; color: var(--ink); }
  .points li::before { content: "0" counter(list-item); display: block; margin-bottom: 14px; color: var(--accent); font: 700 14px var(--sans); letter-spacing: .12em; }
  .cover-copy { max-width: 980px; color: #fff9e8; }
  .cover-copy .eyebrow, .cover-copy .slide-body { color: rgba(255,249,232,.82); }
  .cover-copy .slide-title { color: #fff9e8; font-size: clamp(72px, 8vw, 132px); }
  .cover-copy .slide-body { max-width: 750px; font-size: 28px; }
  .slide--cover .cover-copy, .slide--interlude .copy {
    position: absolute; inset: 0 auto 0 0; z-index: 2; width: 56%; max-width: none;
    padding: 86px 66px 90px 112px; display: flex; flex-direction: column; justify-content: center;
    background: var(--deep);
  }
  .slide--cover .footer, .slide--interlude .footer {
    position: absolute; z-index: 3; left: 112px; right: 46%; bottom: 45px;
    color: rgba(255,249,232,.7);
  }
  .slide--cover::before {
    inset: 0 0 0 42%; background-image: var(--art);
    background-size: cover; background-position: center; opacity: 1; filter: none;
  }
  .slide--interlude::before {
    inset: 0 0 0 42%; background-image: var(--art);
    background-size: cover; background-position: center; opacity: 1; filter: none;
  }
  .slide--interlude .slide-title, .slide--interlude .slide-body, .slide--interlude .eyebrow { color: #fff9e8; }
  .slide--interlude .slide-body { color: rgba(255,249,232,.82); }
  .slide--thesis .inner, .slide--statement .inner { justify-content: center; }
  .slide--thesis .copy, .slide--statement .copy { max-width: 1000px; }
  .slide--split .inner { display: grid; grid-template-columns: 1.2fr .8fr; gap: 64px; align-items: center; }
  .slide--split::after {
    content: ""; position: absolute; z-index: 0; top: 0; right: 0; bottom: 0; width: 39%;
    background-image: var(--art); background-size: cover; background-position: center; opacity: 1;
  }
  .slide--split .copy { position: relative; z-index: 1; }
  .slide--split .slide-body { max-width: 760px; }
  .slide--sequence .inner { justify-content: center; }
  .slide--sequence .footer { position: absolute; left: 112px; right: 112px; bottom: 56px; }
  .slide--detail .inner { justify-content: center; }
  .slide--detail .slide-title { max-width: 1300px; font-size: clamp(68px, 8vw, 126px); }
  .slide--quiet .inner { justify-content: center; }
  .slide--archive .inner { border-left: 2px solid color-mix(in srgb, var(--accent) 42%, transparent); margin-left: 6%; width: 94%; }
  .slide--inquiry .slide-title, .slide--closing .slide-title { max-width: 1070px; }
  .slide--sources .inner { justify-content: center; }
  .sources { padding: 0; margin-top: 44px; max-width: 1050px; list-style: none; }
  .sources li { padding: 18px 0; border-top: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); font: 21px/1.4 var(--serif); }
  .sources a { color: var(--ink); text-decoration-thickness: 1px; text-underline-offset: 5px; }
  .controls { position: fixed; z-index: 10; inset: auto 34px 26px; display: flex; align-items: center; gap: 12px; color: #f7f0df; }
  .progress { height: 2px; flex: 1; background: rgba(255,255,255,.22); overflow: hidden; }
  .progress-fill { height: 100%; width: 100%; background: var(--accent2); transform: scaleX(.05); transform-origin: left; transition: transform .35s ease; }
  .control-button { border: 0; background: transparent; color: inherit; cursor: pointer; padding: 8px; font: 700 18px/1 var(--sans); }
  .counter { min-width: 68px; text-align: right; font: 700 12px/1 var(--sans); letter-spacing: .14em; }
  .reveal { opacity: 1; transform: none; }
  .active .reveal { animation: rise-in .78s cubic-bezier(.2,.75,.2,1) both; }
  .active .reveal:nth-child(2) { animation-delay: 90ms; }
  .active .reveal:nth-child(3) { animation-delay: 170ms; }
  .active .reveal:nth-child(4) { animation-delay: 250ms; }
  @keyframes rise-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes image-breathe { from { transform: scale(1.055); } to { transform: scale(1); } }
  html[data-style="kells"] .inner { outline: 1px solid color-mix(in srgb, var(--accent2) 38%, transparent); outline-offset: -34px; }
  html[data-style="byzantine"] .slide--thesis .copy, html[data-style="byzantine"] .slide--statement .copy { margin-inline: auto; text-align: center; }
  html[data-style="byzantine"] .slide-title { letter-spacing: -.025em; }
  html[data-style="taull"] .slide-title { font-weight: 600; letter-spacing: -.035em; }
  html[data-style="bayeux"] .slide-title { letter-spacing: -.025em; }
  html[data-style="bayeux"] .slide--sequence .points li { border-top-style: dashed; }
  html[data-style="chartres"] .slide--detail .slide-title { color: var(--accent2); }
  html[data-style="giotto"] .slide--split::after { width: 43%; }
  html[data-style="siena"] .slide-title { font-style: italic; }
  html[data-style="tres-riches"] .inner { outline: 1px solid color-mix(in srgb, var(--accent2) 40%, transparent); outline-offset: -44px; }
  html[data-style="arnolfini"] .slide--cover::before { background-position: center right; }
  html[data-style="merode"] .slide--split::after { width: 34%; background-position: 64% center; }
  @media (max-width: 760px) {
    .inner { padding: 48px 32px 70px; }
    .slide-title { font-size: clamp(40px, 10vw, 68px); }
    .slide-body { font-size: 18px; }
    .points { flex-direction: column; gap: 18px; margin-top: 24px; }
    .points li { padding-top: 9px; font-size: 17px; }
    .slide--split .inner { display: flex; }
    .slide--split::after { width: 28%; opacity: .3; }
    .slide--sequence .footer { left: 32px; right: 32px; bottom: 50px; }
    .work-meta { font-size: 13px; }
    .cover-copy .slide-title { font-size: clamp(56px, 12vw, 86px); }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important; }
  }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; overflow: visible !important; scroll-snap-type: none !important; }
    .controls { display: none !important; }
    .pl-slide { width: 100vw; height: 100vh; min-height: 0; overflow: hidden; break-after: page; page-break-after: always; }
    .pl-slide:last-of-type { break-after: auto; page-break-after: auto; }
    .reveal, .active .reveal { opacity: 1 !important; transform: none !important; animation: none !important; }
    .pl-slide::before { display: none !important; background-image: none !important; transform: none !important; transition: none !important; filter: none !important; }
    .slide--cover::before, .slide--interlude::before {
      display: block !important; inset: 0 0 0 42% !important; background-image: var(--art) !important;
      background-size: cover !important; background-position: center !important; opacity: 1 !important;
    }
    .slide--split::after { background-image: var(--art) !important; background-size: cover !important; background-position: center !important; opacity: 1 !important; filter: none !important; }
    .slide--cover .cover-copy, .slide--interlude .copy { opacity: 1 !important; background: var(--deep) !important; }
  }
`;

function pointsMarkup(points) {
  if (!points?.length) return "";
  return `<ol class="points reveal">${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ol>`;
}

function slideMarkup(deck, slide, index) {
  const number = String(index + 1).padStart(2, "0");
  const kind = escapeHtml(slide.kind);
  const cover = slide.kind === "cover";
  const contentClass = cover ? "copy cover-copy" : "copy";
  const sources = slide.kind === "sources";
  const body = sources
    ? `<ul class="sources reveal">${deck.sources.map(([label, url]) => `<li><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></li>`).join("")}</ul>`
    : `<p class="slide-body reveal">${escapeHtml(slide.body)}</p>`;
  const endContent = sources
    ? `<p class="slide-body reveal">Artwork images are original concept illustrations, not reproductions of the historical works.</p>`
    : pointsMarkup(slide.points);
  return `<section class="pl-slide slide--${kind}" data-pl-slide data-slide-id="${deck.slug}-${number}" aria-label="Trang ${number}: ${escapeHtml(slide.title)}">
    <div class="inner">
      <div class="${contentClass}">
        <p class="eyebrow reveal">${escapeHtml(slide.kicker)}</p>
        <h1 class="slide-title reveal">${escapeHtml(slide.title)}</h1>
        ${body}
        ${endContent}
      </div>
      <footer class="footer"><span class="folio">${number} / 20</span><span class="work-meta">${escapeHtml(deck.shortTitle)} · ${escapeHtml(deck.date)}</span></footer>
    </div>
  </section>`;
}

function deckHtml(deck, artData) {
  const themeStyle = Object.entries(deck.theme).map(([key, value]) => `--${key}:${value}`).join(";");
  return `<!doctype html>
<html lang="vi" data-pl-format="16:9" data-pl-title="${escapeHtml(deck.title)}" data-pl-author="PresentLab concept project" data-pl-theme="${deck.style}" data-style="${deck.style}" style="${themeStyle};--art:url('data:image/jpeg;base64,${artData}')">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="20 trang trình chiếu về ${escapeHtml(deck.work)} theo phong cách ${escapeHtml(deck.styleName)}." />
  <meta name="theme-color" content="${deck.theme.deep}" />
  <title>${escapeHtml(deck.title)} — ${escapeHtml(deck.shortTitle)}</title>
  <style>${css}</style>
</head>
<body>
  <main aria-label="${escapeHtml(deck.title)}">
    ${deck.slides.map((slide, index) => slideMarkup(deck, slide, index)).join("\n")}
  </main>
  <nav class="controls" aria-label="Điều hướng slide">
    <button class="control-button" id="previous" aria-label="Trang trước">←</button>
    <div class="progress" aria-hidden="true"><div class="progress-fill" id="progress-fill"></div></div>
    <span class="counter" id="counter" aria-live="polite">01 / 20</span>
    <button class="control-button" id="next" aria-label="Trang tiếp">→</button>
  </nav>
  <script>
    (() => {
      const slides = [...document.querySelectorAll("[data-pl-slide]")];
      const progress = document.getElementById("progress-fill");
      const counter = document.getElementById("counter");
      let current = 0;
      const moveTo = (index) => {
        current = Math.max(0, Math.min(slides.length - 1, index));
        slides[current].scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      };
      document.getElementById("previous").addEventListener("click", () => moveTo(current - 1));
      document.getElementById("next").addEventListener("click", () => moveTo(current + 1));
      window.addEventListener("keydown", (event) => {
        if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) { event.preventDefault(); moveTo(current + 1); }
        if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); moveTo(current - 1); }
        if (event.key === "Home") moveTo(0);
        if (event.key === "End") moveTo(slides.length - 1);
      });
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          current = slides.indexOf(entry.target);
          entry.target.classList.add("active");
          progress.style.transform = "scaleX(" + ((current + 1) / slides.length) + ")";
          counter.textContent = String(current + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
        }
      }, { threshold: 0.52 });
      slides.forEach((slide, index) => { observer.observe(slide); if (index === 0) slide.classList.add("active"); });
    })();
  </script>
</body>
</html>`;
}

function projectReadme(deck) {
  const outline = deck.slides.map((slide, index) => `${String(index + 1).padStart(2, "0")}. ${slide.title}`).join("\n");
  const sources = deck.sources.map(([label, url]) => `- [${label}](${url})`).join("\n");
  return `# ${deck.shortTitle} — ${deck.title}\n\n` +
    `**Artwork:** ${deck.work}  \n**Maker:** ${deck.maker}  \n**Date:** ${deck.date}  \n**Medium:** ${deck.medium}  \n**Visual treatment:** ${deck.styleName}\n\n` +
    `Standalone animated HTML presentation with 20 slides. Open deck.html in a browser; use the arrow keys, Page Up/Down, Home/End, or the on-screen controls. The PDF export is static; transitions and reveal animations remain in the HTML.\n\n` +
    `## Slide outline\n\n${outline}\n\n## Sources\n\n${sources}\n\n` +
    `The artwork background is an original concept illustration made for the earlier PresentLab medieval-art project. It is not a reproduction or photographic record of the historical work.\n`;
}

function indexHtml(cards) {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mười bộ slide · Nghệ thuật Trung cổ</title><style>
    *{box-sizing:border-box}body{margin:0;background:#161714;color:#f0e8d8;font-family:'Segoe UI',Arial,sans-serif}main{max-width:1420px;margin:auto;padding:72px 48px 96px}.eyebrow{color:#d1ad61;font-size:13px;font-weight:800;letter-spacing:.2em;text-transform:uppercase}h1{max-width:920px;margin:18px 0 14px;font:500 clamp(48px,7vw,92px)/.98 Georgia,serif;letter-spacing:-.05em}.intro{max-width:680px;color:#beb6a5;font-size:19px;line-height:1.55}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin-top:54px;background:#4b463b;border:1px solid #4b463b}.card{min-height:235px;padding:28px 30px;background:linear-gradient(120deg,rgba(22,23,20,.97),rgba(22,23,20,.8));text-decoration:none;color:inherit;display:flex;flex-direction:column;justify-content:space-between;transition:background .35s ease,transform .35s ease}.card:hover{background:linear-gradient(120deg,rgba(40,37,30,.96),rgba(22,23,20,.78));transform:translateY(-2px)}.num{color:#d1ad61;font-size:13px;letter-spacing:.14em}.card h2{font:500 clamp(28px,3.5vw,42px)/1.05 Georgia,serif;letter-spacing:-.03em;margin:22px 0 8px}.card p{margin:0;color:#beb6a5;font-size:15px;line-height:1.45}.open{align-self:flex-end;color:#d1ad61;font-size:12px;text-transform:uppercase;letter-spacing:.15em}footer{margin-top:34px;color:#928b7c;font-size:14px}@media(max-width:760px){main{padding:40px 22px 64px}.grid{grid-template-columns:1fr}.card{min-height:195px}}
  </style></head><body><main><p class="eyebrow">PRESENTLAB · 10 PROJECTS · 20 SLIDES EACH</p><h1>Mười thế giới của nghệ thuật Trung cổ.</h1><p class="intro">Mười bộ trình chiếu độc lập, mỗi bộ theo một ngôn ngữ thị giác riêng và kể sâu hơn về một tác phẩm hoặc truyền thống. Mở HTML để xem animation; PDF là bản tĩnh để lưu và đọc.</p><section class="grid" aria-label="Mười project"><!--CARDS--></section><footer>Project files: examples/medieval-series · PDF exports: output/pdf/medieval-series</footer></main></body></html>`.replace("<!--CARDS-->", cards.join("\n"));
}

await mkdir(outputRoot, { recursive: true });
const cards = [];
for (const deck of decks) {
  if (deck.slides.length !== 20) throw new Error(`${deck.slug} has ${deck.slides.length} slides; expected 20.`);
  const sourcePath = join(sourceAssets, deck.artwork);
  const image = await readFile(sourcePath);
  const artData = image.toString("base64");
  const projectDir = join(outputRoot, deck.slug);
  await mkdir(projectDir, { recursive: true });
  await writeFile(join(projectDir, "deck.html"), deckHtml(deck, artData), "utf8");
  await writeFile(join(projectDir, "PROJECT.md"), projectReadme(deck), "utf8");
  const cardStyle = `style="--accent:${deck.theme.accent};--accent2:${deck.theme.accent2}"`;
  cards.push(`<a class="card" ${cardStyle} href="./${deck.slug}/deck.html"><div><span class="num">${deck.slug.slice(0, 2)} · 20 SLIDES</span><h2>${escapeHtml(deck.title)}</h2><p>${escapeHtml(deck.work)}<br>${escapeHtml(deck.styleName)}</p></div><span class="open">Mở project ↗</span></a>`);
}

await writeFile(join(outputRoot, "index.html"), indexHtml(cards), "utf8");
  await writeFile(join(outputRoot, "README.md"), `# Mười bộ slide: nghệ thuật Trung cổ\n\n` +
  `Mỗi thư mục con là một project độc lập: deck.html chứa 20 trang, animation và ảnh concept được nhúng trực tiếp; PROJECT.md có slide outline và nguồn tham khảo. Mở index.html để vào từng deck.\n\n` +
  `PDF tĩnh được xuất vào output/pdf/medieval-series/. Animation chỉ chạy trong HTML. Mỗi bộ giữ một phong cách riêng dựa trên bộ concept art trước đó.\n`, "utf8");

console.log(`Built ${decks.length} standalone decks (${decks.reduce((sum, deck) => sum + deck.slides.length, 0)} slides) in ${outputRoot}`);
