const TEMPLATE_INDEX_URL = "/resources/templates/index.json";
const PALETTE_INDEX_URL = "/resources/palettes/index.json";
const REQUEST_STORAGE_KEY = "presentlab.slide-requests";
const PAGE_SIZE = 24;
const MAX_SELECTIONS = 3;
const MAX_ATTACHMENT_FILES = 10;
const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_BYTES = 4 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const LOCAL_REQUEST_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const LOCALE_STORAGE_KEY = "presentlab.locale";
const THEME_STORAGE_KEY = "presentlab.theme";
const DEFAULT_LOCALE = "vi";
const DEFAULT_THEME = "dark";
const SUPPORTED_LOCALES = ["vi", "en", "zh"];
const SUPPORTED_THEMES = ["dark", "light"];
const MOTION_SCENES = [
  { id: "catalog", index: "01", copy: "sceneLibrary" },
  { id: "templates", index: "02", copy: "sceneTemplates" },
  { id: "process", index: "03", copy: "sceneProcess" },
];

const COPY = {
  vi: {
    noscript: "Trang này cần JavaScript để tải thư viện mẫu và gửi brief.",
    brandWorkspace: "CLIENT WORKSPACE",
    brandAria: "PresentLab - về đầu trang",
    navAria: "Điều hướng chính",
    navTemplates: "Mẫu slide",
    navProcess: "Quy trình",
    navPalette: "Bảng màu",
    navRequest: "Yêu cầu của tôi",
    languageLabel: "Ngôn ngữ",
    menuOpen: "Mở menu",
    menuClose: "Đóng menu",
    heroEyebrow: "PRESENTATION PRODUCTION DESK",
    heroTitleA: "Chọn một hướng nhìn.",
    heroTitleB: "Gửi phần còn lại cho đội ngũ.",
    heroLede:
      "Duyệt các mẫu slide đã được chuẩn hóa, chọn hướng phù hợp với câu chuyện của bạn và gửi brief để đội gia công dựng thành bộ slide hoàn chỉnh.",
    heroExplore: "Khám phá thư viện mẫu",
    heroBrief: "Gửi brief trực tiếp",
    heroStatTemplates: "mẫu có sẵn",
    heroStatFormat: "chuẩn trình chiếu",
    heroStatResponse: "check và phản hồi",
    heroVisualLibrary: "LIVE LIBRARY",
    heroVisualPath: "CURATED PATH",
    heroVisualStoryKicker: "YOUR STORY",
    heroVisualStoryA: "Make the",
    heroVisualStoryB: "idea",
    heroVisualStoryC: "visible.",
    heroVisualFooter: "SELECT / BRIEF / BUILD",
    heroVisualStart: "Start with",
    heroVisualPoint: "a point of view.",
    heroVisualMood: "Mood",
    heroVisualMoodValue: "Editorial / precise",
    heroVisualFormat: "Format",
    heroVisualFormatValue: "16:9 presentation",
    heroVisualOutput: "Output",
    heroVisualOutputValue: "Ready to build",
    heroNoteMood: "Chọn theo mood",
    heroNoteBrief: "Brief đã rõ",
    catalogEyebrow: "01 / TEMPLATE LIBRARY",
    catalogTitle: "Tìm mẫu khớp với câu chuyện",
    catalogIntro: "Chọn một mẫu chính hoặc tối đa ba hướng để đội gia công tư vấn nhanh hơn.",
    filterAria: "Bộ lọc mẫu slide",
    filterLabel: "LỌC THƯ VIỆN",
    resetFilters: "Đặt lại",
    searchLabel: "Tìm kiếm mẫu",
    searchPlaceholder: "Tìm theo tên, style, mục đích...",
    familyLabel: "Hệ thống hình ảnh",
    familyAll: "Tất cả hệ thống",
    categoryLabel: "Phong cách / chuyển động",
    categoryAll: "Tất cả phong cách",
    paletteLabel: "Bảng màu",
    paletteAll: "Tất cả bảng màu",
    filterTipTitle: "Chưa biết chọn?",
    filterTipCopy: "Hãy chọn theo mục đích trước, đội ngũ sẽ tinh chỉnh màu và nhịp slide sau.",
    sourceLoading: "Đang tải thư viện mẫu...",
    sourceLoaded: "{{count}} mẫu · dữ liệu local của PresentLab",
    sourceFallback: "Đang dùng 8 mẫu nền tảng · chạy qua web server để xem toàn bộ thư viện.",
    resultsLoading: "Đang tải...",
    resultsCount: "{{count}} mẫu",
    selectionSummary: " · {{count}} mẫu đang chọn",
    sortLabel: "Sắp xếp",
    sortFeatured: "Đề xuất trước",
    sortName: "Tên A–Z",
    sortStyle: "Phong cách",
    emptyTitle: "Chưa tìm thấy mẫu phù hợp",
    emptyCopy: "Thử xóa bớt bộ lọc hoặc tìm bằng một từ khóa khác.",
    clearFilters: "Xóa bộ lọc",
    loadMore: "Tải thêm mẫu",
    remaining: "({{count}} còn lại)",
    processEyebrow: "03 / HOW IT WORKS",
    processTitle: "Từ lựa chọn đến file bàn giao",
    processIntro: "Bạn chỉ cần mô tả điều cần đạt được. Phần triển khai để chúng tôi lo.",
    processOneTitle: "Chọn hướng",
    processOneCopy: "Chọn một mẫu phù hợp hoặc gửi vài phương án để đội ngũ tư vấn.",
    processTwoTitle: "Gửi brief",
    processTwoCopy: "Cho biết mục tiêu, số slide, deadline và tài liệu đầu vào của bạn.",
    processThreeTitle: "Nhận bản dựng",
    processThreeCopy: "Đội gia công xác nhận phạm vi, dựng slide và gửi bản xem trước để duyệt.",
    footerCopy: "Chọn đúng nền tảng để ý tưởng được nhìn thấy.",
    footerStatus: "Production desk online",
    trayAria: "Các mẫu đã chọn",
    traySelectedLabel: "mẫu đã chọn",
    trayMax: "Tối đa 3 mẫu cho một brief",
    trayAction: "Tiếp tục gửi brief",
    drawerEyebrow: "03 / YOUR REQUEST",
    drawerTitle: "Gửi brief cho đội gia công",
    drawerClose: "Đóng biểu mẫu",
    drawerLede:
      "Cho chúng tôi vài thông tin để bắt đầu. Bạn có thể bổ sung tài liệu sau khi đội ngũ xác nhận.",
    noSelectionHint: "Hãy chọn ít nhất một mẫu trước khi gửi brief.",
    projectSection: "Thông tin dự án",
    projectNameLabel: "Tên dự án",
    projectNamePlaceholder: "Ví dụ: Pitch deck gọi vốn Q4",
    slideCountLabel: "Số lượng slide",
    slideCountPlaceholder: "Ví dụ: 42",
    slideCountHint: "Nhập số nguyên dương, không giới hạn.",
    deadlineLabel: "Deadline dự kiến",
    serviceLegend: "Loại hỗ trợ cần nhận",
    serviceCustomize: "Gia công theo nội dung có sẵn",
    serviceContent: "Dựng nội dung và thiết kế trọn gói",
    serviceBrand: "Chỉ tùy chỉnh mẫu / branding",
    contactSection: "Thông tin liên hệ",
    contactNameLabel: "Người liên hệ",
    contactNamePlaceholder: "Tên của bạn",
    phoneLabel: "Số điện thoại",
    phonePlaceholder: "09xx xxx xxx",
    emailLabel: "Email nhận phản hồi",
    emailPlaceholder: "you@company.com",
    notesLabel: "Điều cần đội ngũ lưu ý",
    notesPlaceholder:
      "Đối tượng xem, thông điệp chính, phong cách mong muốn, yêu cầu thương hiệu...",
    uploadTitle: "Đính kèm tài liệu đầu vào",
    uploadHint: "PPTX, PDF, DOCX, XLSX · tối đa 10 tệp / 4 MB",
    uploadButton: "Chọn tệp",
    consent:
      "Tôi đồng ý để PresentLab sử dụng thông tin này nhằm tư vấn và thực hiện yêu cầu gia công.",
    submitButton: "Gửi yêu cầu cho đội gia công",
    submitLoading: "Đang gửi brief...",
    submitNote: "Đội ngũ sẽ check brief và phản hồi trong vòng 1–2 tiếng.",
    successEyebrow: "REQUEST RECEIVED",
    successTitle: "Đã tạo brief thành công",
    successCopy: "Thông tin của bạn đã được ghi nhận.",
    requestCode: "Mã yêu cầu",
    downloadRequest: "Tải bản brief",
    newRequest: "Brief mới",
    closeButton: "Đóng",
    successFootnote: "",
    previewEyebrow: "TEMPLATE PREVIEW",
    previewTitleFallback: "Template",
    previewOpen: "Mở deck đầy đủ",
    previewClose: "Đóng xem trước",
    previewFrameTitle: "Xem trước mẫu slide",
    previewNote:
      "Đây là deck mẫu để tham khảo nhịp hình ảnh. Nội dung sẽ được thay bằng brief của bạn khi gia công.",
    categoryCore: "Hệ thống cốt lõi",
    paletteBase: "Hệ cơ sở",
    filterQuery: "Từ khóa: {{query}}",
    removeFilter: "Xóa bộ lọc {{label}}",
    removeSelection: "Bỏ chọn {{name}}",
    selectButton: "Chọn mẫu",
    selectedButton: "Đã chọn",
    previewButton: "Xem mẫu",
    defaultDescription: "Một hệ thống hình ảnh sẵn sàng để đội ngũ tùy chỉnh theo brief.",
    maxSelections: "Bạn có thể chọn tối đa 3 mẫu cho một brief.",
    noSelectionToast: "Hãy chọn ít nhất một mẫu trước khi gửi brief.",
    attachmentMaxFiles: "Bạn chỉ có thể đính kèm tối đa {{count}} tệp.",
    attachmentMaxSingle: "{{name}} vượt quá giới hạn 3 MB mỗi tệp.",
    attachmentMaxTotal: "Tổng dung lượng tài liệu không được vượt quá 4 MB khi gửi qua Vercel.",
    requestSavedError:
      "Không thể kết nối đội gia công. Brief đã được lưu cục bộ, bạn có thể thử gửi lại.",
    requestGenericError: "Không thể gửi tự động. Vui lòng thử lại hoặc liên hệ đội ngũ.",
    endpointSuccessTitle: "Đã gửi yêu cầu thành công",
    endpointSuccessCopy:
      "Brief đã được chuyển tới đội gia công. Chúng tôi sẽ phản hồi qua email của bạn sau khi xem phạm vi công việc.",
    endpointSuccessFootnote: "Bạn có thể tải lại bản brief để lưu vào hồ sơ dự án.",
    emailSuccessTitle: "Đã chuẩn bị email yêu cầu",
    emailSuccessCopy:
      "Ứng dụng email của bạn đã được mở với nội dung brief. Hãy bấm Send để hoàn tất việc gửi cho đội gia công.",
    emailSuccessFootnote: "Nếu cửa sổ email không mở, bạn có thể tải bản brief JSON bên dưới.",
    localSuccessTitle: "Đã tạo bản brief thành công",
    localSuccessCopy:
      "Chưa cấu hình endpoint nhận yêu cầu, nên brief đã được lưu trên thiết bị và tải xuống để bạn chuyển cho đội gia công.",
    localSuccessFootnote:
      "Để gửi tự động, cấu hình data-request-endpoint hoặc data-handoff-email trên thẻ html của trang.",
    themeLabel: "Chủ đề",
    themeDark: "Tối",
    themeLight: "Sáng",
    themeSwitchToLight: "Chuyển sang giao diện sáng",
    themeSwitchToDark: "Chuyển sang giao diện tối",
    signalTemplates: "770 HỆ THỐNG ĐÃ TUYỂN",
    signalMotion: "CHUYỂN ĐỘNG CÓ CHỦ ĐÍCH",
    signalBrief: "BRIEF / DỰNG / DUYỆT",
    signalOutput: "SẴN SÀNG LÊN SÂN KHẤU",
    scrollCue: "CUỘN ĐỂ KHÁM PHÁ",
    scrollToTemplates: "Lướt xuống thư viện mẫu",
    scrollToProcess: "Lướt xuống xem quy trình",
    nextSceneKicker: "03 / CHẶNG CUỐI",
    nextSceneTitle: "Lướt xuống để xem quy trình",
    nextSceneCopy: "Từ hướng nhìn đã chọn đến bản dựng hoàn chỉnh.",
    processCloseEyebrow: "03 / SẴN SÀNG DỰNG",
    processCloseTitle: "Để phần còn lại cho đội ngũ.",
    processCloseCopy:
      "Gửi brief, mục tiêu và deadline. Chúng tôi sẽ check và phản hồi trong 1–2 tiếng.",
    processCloseAction: "Gửi brief ngay",
    sceneLibrary: "KHÔNG GIAN",
    sceneTemplates: "TUYỂN HƯỚNG",
    sceneProcess: "THỰC THI",
    sceneTransition: "ĐANG CHUYỂN CẢNH",
    previewLive: "KHUNG ĐANG XEM",
    previewPrevious: "Mẫu trước",
    previewPreviousShort: "TRƯỚC",
    previewNext: "Mẫu tiếp theo",
    previewNextShort: "TIẾP",
    previewStageLabel: "PRESENTLAB / HỆ THỐNG HÌNH ẢNH",
    previewStageHint: "Dùng ← → để lướt qua các hệ thống",
    previewSystemLabel: "HỆ THỐNG HÌNH ẢNH",
    previewCategoryLabel: "Phong cách",
    previewPaletteLabel: "Bảng màu",
    previewFormatLabel: "Định dạng",
    previewSelect: "Chọn hướng này",
    previewSelected: "Đã chọn",
  },
  en: {
    noscript: "JavaScript is required to load the template library and send a brief.",
    brandWorkspace: "CLIENT WORKSPACE",
    brandAria: "PresentLab - back to top",
    navAria: "Main navigation",
    navTemplates: "Templates",
    navProcess: "Process",
    navPalette: "Palettes",
    navRequest: "My request",
    languageLabel: "Language",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    heroEyebrow: "PRESENTATION PRODUCTION DESK",
    heroTitleA: "Choose a point of view.",
    heroTitleB: "Leave the rest to the studio.",
    heroLede:
      "Browse standardized slide systems, choose a direction that fits your story, and send a brief for our production team to turn into a finished deck.",
    heroExplore: "Explore template library",
    heroBrief: "Send a brief directly",
    heroStatTemplates: "templates ready",
    heroStatFormat: "presentation standard",
    heroStatResponse: "hours to review",
    heroVisualLibrary: "LIVE LIBRARY",
    heroVisualPath: "CURATED PATH",
    heroVisualStoryKicker: "YOUR STORY",
    heroVisualStoryA: "Make the",
    heroVisualStoryB: "idea",
    heroVisualStoryC: "visible.",
    heroVisualFooter: "SELECT / BRIEF / BUILD",
    heroVisualStart: "Start with",
    heroVisualPoint: "a point of view.",
    heroVisualMood: "Mood",
    heroVisualMoodValue: "Editorial / precise",
    heroVisualFormat: "Format",
    heroVisualFormatValue: "16:9 presentation",
    heroVisualOutput: "Output",
    heroVisualOutputValue: "Ready to build",
    heroNoteMood: "Choose by mood",
    heroNoteBrief: "Brief is clear",
    catalogEyebrow: "01 / TEMPLATE LIBRARY",
    catalogTitle: "Find a visual system for your story",
    catalogIntro:
      "Choose one lead direction or up to three options for a faster production recommendation.",
    filterAria: "Slide template filters",
    filterLabel: "LIBRARY FILTERS",
    resetFilters: "Reset",
    searchLabel: "Search templates",
    searchPlaceholder: "Search by name, style, purpose...",
    familyLabel: "Visual system",
    familyAll: "All systems",
    categoryLabel: "Style / movement",
    categoryAll: "All styles",
    paletteLabel: "Color palette",
    paletteAll: "All palettes",
    filterTipTitle: "Not sure where to start?",
    filterTipCopy: "Choose by purpose first. The studio can refine color and slide rhythm later.",
    sourceLoading: "Loading template library...",
    sourceLoaded: "{{count}} templates · PresentLab local data",
    sourceFallback: "Using 8 base systems · run through a web server to browse the full library.",
    resultsLoading: "Loading...",
    resultsCount: "{{count}} templates",
    selectionSummary: " · {{count}} selected",
    sortLabel: "Sort",
    sortFeatured: "Featured first",
    sortName: "Name A–Z",
    sortStyle: "Style",
    emptyTitle: "No matching templates",
    emptyCopy: "Try removing a filter or searching with a different keyword.",
    clearFilters: "Clear filters",
    loadMore: "Load more templates",
    remaining: "({{count}} left)",
    processEyebrow: "03 / HOW IT WORKS",
    processTitle: "From direction to delivered deck",
    processIntro: "Tell us what the deck needs to achieve. We will take care of the build.",
    processOneTitle: "Choose a direction",
    processOneCopy: "Pick a fitting template or send a few options for the studio to advise on.",
    processTwoTitle: "Send a brief",
    processTwoCopy: "Share the goal, slide count, deadline, and source material.",
    processThreeTitle: "Receive the build",
    processThreeCopy:
      "The studio confirms scope, builds the deck, and sends a preview for approval.",
    footerCopy: "Choose the right system and make the idea visible.",
    footerStatus: "Production desk online",
    trayAria: "Selected templates",
    traySelectedLabel: "selected",
    trayMax: "Up to 3 templates per brief",
    trayAction: "Continue to brief",
    drawerEyebrow: "03 / YOUR REQUEST",
    drawerTitle: "Send a brief to the production team",
    drawerClose: "Close request form",
    drawerLede:
      "Give us a few details to get started. You can add source material after the team confirms scope.",
    noSelectionHint: "Choose at least one template before sending a brief.",
    projectSection: "Project details",
    projectNameLabel: "Project name",
    projectNamePlaceholder: "Example: Q4 fundraising pitch deck",
    slideCountLabel: "Slide count",
    slideCountPlaceholder: "Example: 42",
    slideCountHint: "Enter a positive whole number.",
    deadlineLabel: "Expected deadline",
    serviceLegend: "Support needed",
    serviceCustomize: "Build from existing content",
    serviceContent: "Content and design package",
    serviceBrand: "Template / branding customization",
    contactSection: "Contact details",
    contactNameLabel: "Contact person",
    contactNamePlaceholder: "Your name",
    phoneLabel: "Phone number",
    phonePlaceholder: "+84 ...",
    emailLabel: "Reply email",
    emailPlaceholder: "you@company.com",
    notesLabel: "Notes for the studio",
    notesPlaceholder: "Audience, key message, desired mood, brand requirements...",
    uploadTitle: "Attach source material",
    uploadHint: "PPTX, PDF, DOCX, XLSX · up to 10 files / 4 MB",
    uploadButton: "Choose files",
    consent:
      "I agree that PresentLab may use this information to advise on and deliver the requested work.",
    submitButton: "Send request to the studio",
    submitLoading: "Sending brief...",
    submitNote: "The studio will review and reply within 1–2 hours.",
    successEyebrow: "REQUEST RECEIVED",
    successTitle: "Brief created successfully",
    successCopy: "Your information has been recorded.",
    requestCode: "Request code",
    downloadRequest: "Download brief",
    newRequest: "New brief",
    closeButton: "Close",
    successFootnote: "",
    previewEyebrow: "TEMPLATE PREVIEW",
    previewTitleFallback: "Template",
    previewOpen: "Open full deck",
    previewClose: "Close preview",
    previewFrameTitle: "Slide template preview",
    previewNote:
      "This sample deck shows the visual rhythm. Your content will be replaced with your brief during production.",
    categoryCore: "Core systems",
    paletteBase: "Base system",
    filterQuery: "Keyword: {{query}}",
    removeFilter: "Remove filter {{label}}",
    removeSelection: "Remove {{name}}",
    selectButton: "Select",
    selectedButton: "Selected",
    previewButton: "Preview",
    defaultDescription: "A ready-made visual system the studio can tailor to your brief.",
    maxSelections: "You can select up to 3 templates for one brief.",
    noSelectionToast: "Choose at least one template before sending a brief.",
    attachmentMaxFiles: "You can attach up to {{count}} files.",
    attachmentMaxSingle: "{{name}} exceeds the 3 MB per-file limit.",
    attachmentMaxTotal: "Total attachments must stay under 4 MB when sent through Vercel.",
    requestSavedError:
      "We could not reach the studio. The brief was saved locally so you can try again.",
    requestGenericError: "Automatic delivery failed. Please try again or contact the studio.",
    endpointSuccessTitle: "Request sent successfully",
    endpointSuccessCopy:
      "Your brief was sent to the production team. We will reply by email after reviewing the scope.",
    endpointSuccessFootnote: "You can download a copy of the brief for your project records.",
    emailSuccessTitle: "Request email prepared",
    emailSuccessCopy:
      "Your email app opened with the brief. Press Send to finish delivering it to the studio.",
    emailSuccessFootnote: "If the email window did not open, download the JSON brief below.",
    localSuccessTitle: "Brief created successfully",
    localSuccessCopy:
      "No request endpoint is configured, so the brief was saved on this device and downloaded for you to share with the studio.",
    localSuccessFootnote:
      "For automatic delivery, configure data-request-endpoint or data-handoff-email on the html element.",
    themeLabel: "Theme",
    themeDark: "Dark",
    themeLight: "Light",
    themeSwitchToLight: "Switch to light mode",
    themeSwitchToDark: "Switch to dark mode",
    signalTemplates: "770 CURATED SYSTEMS",
    signalMotion: "MOTION WITH INTENT",
    signalBrief: "BRIEF / BUILD / REVIEW",
    signalOutput: "READY FOR THE ROOM",
    scrollCue: "SCROLL TO EXPLORE",
    scrollToTemplates: "Scroll to the library",
    scrollToProcess: "Scroll to the process",
    nextSceneKicker: "03 / FINAL SCENE",
    nextSceneTitle: "Scroll into the production flow",
    nextSceneCopy: "From the chosen direction to a finished deck.",
    processCloseEyebrow: "03 / READY TO BUILD",
    processCloseTitle: "Leave the rest to the studio.",
    processCloseCopy:
      "Send the brief, goal and deadline. We will check and reply within 1–2 hours.",
    processCloseAction: "Send the brief",
    sceneLibrary: "LIBRARY",
    sceneTemplates: "DIRECTIONS",
    sceneProcess: "PRODUCTION",
    sceneTransition: "MOVING TO NEXT SCENE",
    previewLive: "LIVE FRAME",
    previewPrevious: "Previous template",
    previewPreviousShort: "PREV",
    previewNext: "Next template",
    previewNextShort: "NEXT",
    previewStageLabel: "PRESENTLAB / VISUAL SYSTEM",
    previewStageHint: "Use ← → to browse the systems",
    previewSystemLabel: "VISUAL SYSTEM",
    previewCategoryLabel: "Style",
    previewPaletteLabel: "Palette",
    previewFormatLabel: "Format",
    previewSelect: "Choose this direction",
    previewSelected: "Selected",
  },
  zh: {
    noscript: "需要启用 JavaScript 才能加载模板库并提交简报。",
    brandWorkspace: "客户工作台",
    brandAria: "PresentLab - 返回顶部",
    navAria: "主导航",
    navTemplates: "幻灯片模板",
    navProcess: "流程",
    navPalette: "配色",
    navRequest: "我的需求",
    languageLabel: "语言",
    menuOpen: "打开菜单",
    menuClose: "关闭菜单",
    heroEyebrow: "演示文稿制作工作台",
    heroTitleA: "选择一种视角。",
    heroTitleB: "其余交给我们。",
    heroLede:
      "浏览经过标准化的幻灯片模板，选择适合你故事的方向，提交简报，由制作团队完成整套演示文稿。",
    heroExplore: "探索模板库",
    heroBrief: "直接提交简报",
    heroStatTemplates: "套模板可选",
    heroStatFormat: "演示文稿标准",
    heroStatResponse: "小时内检查并回复",
    heroVisualLibrary: "实时模板库",
    heroVisualPath: "精选路径",
    heroVisualStoryKicker: "你的故事",
    heroVisualStoryA: "让想法",
    heroVisualStoryB: "被看见",
    heroVisualStoryC: "。",
    heroVisualFooter: "选择 / 简报 / 制作",
    heroVisualStart: "从一个",
    heroVisualPoint: "清晰的观点开始。",
    heroVisualMood: "氛围",
    heroVisualMoodValue: "编辑感 / 精确",
    heroVisualFormat: "格式",
    heroVisualFormatValue: "16:9 演示文稿",
    heroVisualOutput: "交付",
    heroVisualOutputValue: "准备制作",
    heroNoteMood: "按氛围选择",
    heroNoteBrief: "简报已清晰",
    catalogEyebrow: "01 / 模板库",
    catalogTitle: "找到适合故事的视觉系统",
    catalogIntro: "选择一个主方向，或最多选择三个方案，让制作团队更快给出建议。",
    filterAria: "幻灯片模板筛选",
    filterLabel: "筛选模板库",
    resetFilters: "重置",
    searchLabel: "搜索模板",
    searchPlaceholder: "按名称、风格、用途搜索……",
    familyLabel: "视觉系统",
    familyAll: "全部系统",
    categoryLabel: "风格 / 动势",
    categoryAll: "全部风格",
    paletteLabel: "色彩方案",
    paletteAll: "全部配色",
    filterTipTitle: "不知道如何选择？",
    filterTipCopy: "先按用途选择，之后团队可以继续调整色彩和页面节奏。",
    sourceLoading: "正在加载模板库……",
    sourceLoaded: "{{count}} 套模板 · PresentLab 本地数据",
    sourceFallback: "正在使用 8 套基础系统 · 通过 web server 可浏览完整模板库。",
    resultsLoading: "正在加载……",
    resultsCount: "{{count}} 套模板",
    selectionSummary: " · 已选择 {{count}} 套",
    sortLabel: "排序",
    sortFeatured: "优先推荐",
    sortName: "名称 A–Z",
    sortStyle: "风格",
    emptyTitle: "没有找到匹配模板",
    emptyCopy: "可以减少筛选条件，或尝试其他关键词。",
    clearFilters: "清除筛选",
    loadMore: "加载更多模板",
    remaining: "（还剩 {{count}} 套）",
    processEyebrow: "03 / 工作流程",
    processTitle: "从选择方向到交付文件",
    processIntro: "告诉我们演示文稿要达成什么目标，制作交给我们。",
    processOneTitle: "选择方向",
    processOneCopy: "选择合适的模板，或发送几个方案让团队提供建议。",
    processTwoTitle: "提交简报",
    processTwoCopy: "说明目标、页数、截止时间和已有资料。",
    processThreeTitle: "收到初稿",
    processThreeCopy: "团队确认范围、制作页面，并发送预览供你确认。",
    footerCopy: "选择正确的视觉系统，让想法被看见。",
    footerStatus: "制作工作台在线",
    trayAria: "已选择的模板",
    traySelectedLabel: "套已选择",
    trayMax: "一次简报最多选择 3 套模板",
    trayAction: "继续提交简报",
    drawerEyebrow: "03 / 你的需求",
    drawerTitle: "向制作团队提交简报",
    drawerClose: "关闭需求表单",
    drawerLede: "提供一些信息即可开始。团队确认范围后，你还可以补充资料。",
    noSelectionHint: "提交简报前至少选择一套模板。",
    projectSection: "项目资料",
    projectNameLabel: "项目名称",
    projectNamePlaceholder: "例如：Q4 融资路演",
    slideCountLabel: "幻灯片页数",
    slideCountPlaceholder: "例如：42",
    slideCountHint: "请输入正整数。",
    deadlineLabel: "预计截止时间",
    serviceLegend: "需要的支持类型",
    serviceCustomize: "根据已有内容制作",
    serviceContent: "内容与设计一体化",
    serviceBrand: "模板 / 品牌定制",
    contactSection: "联系信息",
    contactNameLabel: "联系人",
    contactNamePlaceholder: "你的姓名",
    phoneLabel: "电话号码",
    phonePlaceholder: "+86 ...",
    emailLabel: "接收回复的邮箱",
    emailPlaceholder: "you@company.com",
    notesLabel: "希望团队注意的事项",
    notesPlaceholder: "受众、核心信息、期望风格、品牌要求……",
    uploadTitle: "附加已有资料",
    uploadHint: "PPTX、PDF、DOCX、XLSX · 最多 10 个文件 / 4 MB",
    uploadButton: "选择文件",
    consent: "我同意 PresentLab 使用这些信息来提供咨询并完成本次制作需求。",
    submitButton: "提交制作需求",
    submitLoading: "正在提交简报……",
    submitNote: "团队将在 1–2 小时内检查简报并回复。",
    successEyebrow: "已收到需求",
    successTitle: "简报创建成功",
    successCopy: "你的信息已被记录。",
    requestCode: "需求编号",
    downloadRequest: "下载简报",
    newRequest: "新建简报",
    closeButton: "关闭",
    successFootnote: "",
    previewEyebrow: "模板预览",
    previewTitleFallback: "模板",
    previewOpen: "打开完整演示文稿",
    previewClose: "关闭预览",
    previewFrameTitle: "幻灯片模板预览",
    previewNote: "这是用于参考视觉节奏的示例演示文稿，制作时会根据你的简报替换内容。",
    categoryCore: "核心系统",
    paletteBase: "基础系统",
    filterQuery: "关键词：{{query}}",
    removeFilter: "移除筛选 {{label}}",
    removeSelection: "移除 {{name}}",
    selectButton: "选择模板",
    selectedButton: "已选择",
    previewButton: "查看预览",
    defaultDescription: "可由制作团队根据简报定制的视觉系统。",
    maxSelections: "一次简报最多选择 3 套模板。",
    noSelectionToast: "提交简报前至少选择一套模板。",
    attachmentMaxFiles: "最多可以附加 {{count}} 个文件。",
    attachmentMaxSingle: "{{name}} 超过了每个文件 3 MB 的限制。",
    attachmentMaxTotal: "通过 Vercel 发送时，附件总大小不能超过 4 MB。",
    requestSavedError: "无法连接制作团队。简报已保存在本地，可以稍后重试。",
    requestGenericError: "自动发送失败，请重试或联系制作团队。",
    endpointSuccessTitle: "需求提交成功",
    endpointSuccessCopy: "简报已发送给制作团队。我们会在查看范围后通过邮箱回复。",
    endpointSuccessFootnote: "你可以下载一份简报副本保存到项目资料中。",
    emailSuccessTitle: "需求邮件已准备好",
    emailSuccessCopy: "邮件应用已打开并填入简报内容，点击发送即可完成提交。",
    emailSuccessFootnote: "如果邮件窗口没有打开，可以下载下面的 JSON 简报。",
    localSuccessTitle: "简报创建成功",
    localSuccessCopy: "当前未配置需求接收接口，简报已保存在设备并下载，可转发给制作团队。",
    localSuccessFootnote:
      "如需自动发送，请在 html 元素上配置 data-request-endpoint 或 data-handoff-email。",
    themeLabel: "主题",
    themeDark: "深色",
    themeLight: "浅色",
    themeSwitchToLight: "切换到浅色模式",
    themeSwitchToDark: "切换到深色模式",
    signalTemplates: "770 套精选系统",
    signalMotion: "有目的的动效",
    signalBrief: "简报 / 制作 / 评审",
    signalOutput: "为现场呈现准备",
    scrollCue: "滚动探索",
    scrollToTemplates: "向下浏览素材库",
    scrollToProcess: "向下查看流程",
    nextSceneKicker: "03 / 最后一幕",
    nextSceneTitle: "向下进入制作流程",
    nextSceneCopy: "从选定方向到完整演示文稿。",
    processCloseEyebrow: "03 / 准备制作",
    processCloseTitle: "剩下的交给制作团队。",
    processCloseCopy: "发送简报、目标和截止时间，我们会在 1–2 小时内确认并回复。",
    processCloseAction: "立即发送简报",
    sceneLibrary: "素材库",
    sceneTemplates: "选择方向",
    sceneProcess: "制作",
    sceneTransition: "正在切换场景",
    previewLive: "实时画面",
    previewPrevious: "上一个模板",
    previewPreviousShort: "上一个",
    previewNext: "下一个模板",
    previewNextShort: "下一个",
    previewStageLabel: "PRESENTLAB / 视觉系统",
    previewStageHint: "使用 ← → 浏览视觉系统",
    previewSystemLabel: "视觉系统",
    previewCategoryLabel: "风格",
    previewPaletteLabel: "配色",
    previewFormatLabel: "格式",
    previewSelect: "选择这个方向",
    previewSelected: "已选择",
  },
};

const FAMILY_LABELS = {
  vi: {
    aurora: "Aurora / Biên tập sáng",
    midnight: "Midnight / Điện ảnh tối",
    swiss: "Swiss / Lưới quốc tế",
    brutalist: "Brutalist / Tân thô mộc",
    organic: "Organic / Studio tự nhiên",
    datanoir: "Data Noir / Dữ liệu tối",
    luxury: "Luxury / Tối giản cao cấp",
    retrofuture: "Retro Future / Tương lai hoài niệm",
  },
  en: {
    aurora: "Aurora / Light editorial",
    midnight: "Midnight / Dark cinematic",
    swiss: "Swiss / International grid",
    brutalist: "Brutalist / Neo-brutalist",
    organic: "Organic / Studio warmth",
    datanoir: "Data Noir / Dark data",
    luxury: "Luxury / Quiet luxury",
    retrofuture: "Retro Future / Neon future",
  },
  zh: {
    aurora: "Aurora / 明亮编辑感",
    midnight: "Midnight / 深色电影感",
    swiss: "Swiss / 国际网格",
    brutalist: "Brutalist / 新粗野主义",
    organic: "Organic / 自然工作室",
    datanoir: "Data Noir / 暗色数据",
    luxury: "Luxury / 静谧奢华",
    retrofuture: "Retro Future / 霓虹未来",
  },
};

const PALETTE_LABELS = {
  vi: {
    cinematic: "Điện ảnh",
    cobalt: "Cobalt",
    coral: "Coral",
    forest: "Rừng",
    saffron: "Saffron",
    plum: "Mận",
    ocean: "Đại dương",
    mono: "Đơn sắc",
    mint: "Bạc hà",
    copper: "Đồng",
    sand: "Cát",
    violet: "Tím",
    ice: "Băng",
  },
  en: {
    cinematic: "Cinematic",
    cobalt: "Cobalt",
    coral: "Coral",
    forest: "Forest",
    saffron: "Saffron",
    plum: "Plum",
    ocean: "Ocean",
    mono: "Mono",
    mint: "Mint",
    copper: "Copper",
    sand: "Sand",
    violet: "Violet",
    ice: "Ice",
  },
  zh: {
    cinematic: "电影感",
    cobalt: "钴蓝",
    coral: "珊瑚",
    forest: "森林",
    saffron: "藏红花",
    plum: "梅紫",
    ocean: "海洋",
    mono: "单色",
    mint: "薄荷",
    copper: "铜色",
    sand: "沙色",
    violet: "紫罗兰",
    ice: "冰蓝",
  },
};

const FAMILY_DESCRIPTIONS = {
  vi: {
    aurora: "Hệ thống biên tập sáng, thoáng và có nhịp kể chuyện nhẹ nhàng.",
    midnight: "Hệ thống điện ảnh tối với điểm sáng nổi bật và tương phản rõ.",
    swiss: "Hệ thống lưới kỷ luật, sắc nét cho câu chuyện có cấu trúc.",
    brutalist: "Hệ thống mạnh, nhiều đường viền và nhấn hình học trực diện.",
    organic: "Hệ thống ấm áp với chất liệu tự nhiên và hình khối mềm.",
    datanoir: "Hệ thống dữ liệu tối cho sản phẩm, kỹ thuật và vận hành.",
    luxury: "Hệ thống tối giản cao cấp với khoảng thở và chi tiết tinh tế.",
    retrofuture: "Hệ thống tương lai hoài niệm với lưới sáng và nhịp năng lượng.",
  },
  zh: {
    aurora: "明亮通透的编辑感系统，适合平静、有节奏的叙事。",
    midnight: "深色电影感系统，以发光重点和强对比建立注意力。",
    swiss: "秩序清晰的网格系统，适合结构化表达。",
    brutalist: "大胆直接的系统，使用粗线条和鲜明几何强调重点。",
    organic: "温暖自然的系统，搭配柔和形状和工作室质感。",
    datanoir: "适合产品、工程和运营叙事的深色数据系统。",
    luxury: "克制高级的系统，强调留白、细线和精致细节。",
    retrofuture: "带有霓虹网格和能量节奏的复古未来系统。",
  },
};

function getInitialLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    return SUPPORTED_LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (SUPPORTED_THEMES.includes(saved)) return saved;
  } catch {
    // Fall back to the system preference when storage is unavailable.
  }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : DEFAULT_THEME;
}

function interpolate(value, variables = {}) {
  return String(value).replaceAll(/\{\{(\w+)\}\}/g, (_, key) => String(variables[key] ?? ""));
}

const FALLBACK_TEMPLATES = [
  {
    name: "aurora",
    title: "Aurora template",
    description:
      "Light editorial system with spacious cards, indigo accents, and calm narrative pacing.",
    family: "aurora",
    baseFamily: "aurora",
    palette: "base",
    modifier: "base",
    path: "aurora/aurora.html",
  },
  {
    name: "midnight",
    title: "Midnight template",
    description:
      "Dark cinematic system with luminous cyan highlights and contrast-led storytelling.",
    family: "midnight",
    baseFamily: "midnight",
    palette: "cinematic",
    modifier: "base",
    path: "midnight/midnight.html",
  },
  {
    name: "swiss",
    title: "Swiss template",
    description:
      "Swiss-inspired grid with hard edges, red signal color, and disciplined hierarchy.",
    family: "swiss",
    baseFamily: "swiss",
    palette: "base",
    modifier: "base",
    path: "swiss/swiss.html",
  },
  {
    name: "brutalist",
    title: "Brutalist template",
    description: "Neo-brutalist system with bold borders, offset shadows, and playful emphasis.",
    family: "brutalist",
    baseFamily: "brutalist",
    palette: "base",
    modifier: "base",
    path: "brutalist/brutalist.html",
  },
  {
    name: "organic",
    title: "Organic template",
    description: "Warm studio system with earthy colors, serif headlines, and soft geometry.",
    family: "organic",
    baseFamily: "organic",
    palette: "base",
    modifier: "base",
    path: "organic/organic.html",
  },
  {
    name: "datanoir",
    title: "Data Noir template",
    description:
      "Terminal-inspired dark system for product, engineering, and operational narratives.",
    family: "datanoir",
    baseFamily: "datanoir",
    palette: "base",
    modifier: "base",
    path: "datanoir/datanoir.html",
  },
  {
    name: "luxury",
    title: "Luxury template",
    description: "Quiet luxury system with ivory paper, hairline rules, and restrained gold.",
    family: "luxury",
    baseFamily: "luxury",
    palette: "base",
    modifier: "base",
    path: "luxury/luxury.html",
  },
  {
    name: "retrofuture",
    title: "Retro Future template",
    description: "Neon retro-future system with luminous grids and energetic pacing.",
    family: "retrofuture",
    baseFamily: "retrofuture",
    palette: "base",
    modifier: "base",
    path: "retrofuture/retrofuture.html",
  },
];

const FALLBACK_PALETTES = [
  {
    name: "cinematic",
    title: "Cinematic",
    tokens: {
      paper: "#0b1020",
      ink: "#edf4ff",
      muted: "#9aaac2",
      accent: "#55e0d0",
      accentDeep: "#1e9994",
      accentSoft: "#183d4a",
      artOne: "#173d70",
      artTwo: "#d86d49",
    },
  },
  {
    name: "cobalt",
    title: "Cobalt",
    tokens: {
      paper: "#f4f7ff",
      ink: "#14213d",
      muted: "#5c6a83",
      accent: "#315efb",
      accentDeep: "#2340b4",
      accentSoft: "#dbe5ff",
      artOne: "#b5c6ff",
      artTwo: "#ffb29c",
    },
  },
  {
    name: "coral",
    title: "Coral",
    tokens: {
      paper: "#fff7f4",
      ink: "#321c24",
      muted: "#80656d",
      accent: "#ed5d52",
      accentDeep: "#b73a34",
      accentSoft: "#ffd7d1",
      artOne: "#ffc2b8",
      artTwo: "#f5b45f",
    },
  },
  {
    name: "forest",
    title: "Forest",
    tokens: {
      paper: "#f4faf4",
      ink: "#16372c",
      muted: "#627b6b",
      accent: "#1f8a62",
      accentDeep: "#146044",
      accentSoft: "#ccebdc",
      artOne: "#9cdbb7",
      artTwo: "#e7ad5c",
    },
  },
  {
    name: "saffron",
    title: "Saffron",
    tokens: {
      paper: "#fff9e8",
      ink: "#3b2a14",
      muted: "#806d4e",
      accent: "#e3a316",
      accentDeep: "#9d6b05",
      accentSoft: "#f9e5a8",
      artOne: "#f7cf68",
      artTwo: "#e57b52",
    },
  },
  {
    name: "plum",
    title: "Plum",
    tokens: {
      paper: "#fbf4ff",
      ink: "#311a3f",
      muted: "#786481",
      accent: "#9c4fd4",
      accentDeep: "#6e2ca2",
      accentSoft: "#ead4f7",
      artOne: "#d1a7ec",
      artTwo: "#f2a4a1",
    },
  },
  {
    name: "ocean",
    title: "Ocean",
    tokens: {
      paper: "#f1f9fb",
      ink: "#12323d",
      muted: "#5b7680",
      accent: "#0f9ec7",
      accentDeep: "#0a6e8b",
      accentSoft: "#c8ebf3",
      artOne: "#8bd3e5",
      artTwo: "#f1ae67",
    },
  },
  {
    name: "mono",
    title: "Mono",
    tokens: {
      paper: "#f5f5f4",
      ink: "#222222",
      muted: "#707070",
      accent: "#2f3437",
      accentDeep: "#111111",
      accentSoft: "#ddddda",
      artOne: "#b7b7b3",
      artTwo: "#e97759",
    },
  },
  {
    name: "mint",
    title: "Mint",
    tokens: {
      paper: "#f1fbf6",
      ink: "#143a32",
      muted: "#5b7d70",
      accent: "#2eae83",
      accentDeep: "#1b7c5e",
      accentSoft: "#c8efdf",
      artOne: "#9adfc5",
      artTwo: "#f1b35c",
    },
  },
  {
    name: "copper",
    title: "Copper",
    tokens: {
      paper: "#fff8f1",
      ink: "#3a251e",
      muted: "#806b60",
      accent: "#c66b3d",
      accentDeep: "#914622",
      accentSoft: "#f2d1bd",
      artOne: "#e5a37a",
      artTwo: "#525f8d",
    },
  },
  {
    name: "sand",
    title: "Sand",
    tokens: {
      paper: "#fbf7ee",
      ink: "#3c3328",
      muted: "#817467",
      accent: "#bd7a41",
      accentDeep: "#8d522a",
      accentSoft: "#efdcc4",
      artOne: "#dfb17f",
      artTwo: "#7c9d8b",
    },
  },
  {
    name: "violet",
    title: "Violet",
    tokens: {
      paper: "#f7f4ff",
      ink: "#282044",
      muted: "#706987",
      accent: "#7657df",
      accentDeep: "#5030af",
      accentSoft: "#ddd5fb",
      artOne: "#b7a5f0",
      artTwo: "#eb8d9c",
    },
  },
  {
    name: "ice",
    title: "Ice",
    tokens: {
      paper: "#f2f8ff",
      ink: "#172e48",
      muted: "#62758a",
      accent: "#4f91d1",
      accentDeep: "#31689f",
      accentSoft: "#d4e7f8",
      artOne: "#a6cbe9",
      artTwo: "#f1b274",
    },
  },
];

const FAMILY_TOKENS = {
  aurora: {
    paper: "#f7f8fc",
    ink: "#172033",
    muted: "#647086",
    accent: "#5b6cf2",
    accentSoft: "#dfe4ff",
    artOne: "#aab8ff",
    artTwo: "#ffb18e",
  },
  midnight: {
    paper: "#0b1020",
    ink: "#edf4ff",
    muted: "#9aaac2",
    accent: "#55e0d0",
    accentSoft: "#183d4a",
    artOne: "#173d70",
    artTwo: "#d86d49",
  },
  swiss: {
    paper: "#f7f7f5",
    ink: "#202020",
    muted: "#6f6f6b",
    accent: "#e04b40",
    accentSoft: "#ece5dc",
    artOne: "#e04b40",
    artTwo: "#e3a316",
  },
  brutalist: {
    paper: "#f8dc4f",
    ink: "#251f18",
    muted: "#5e4f32",
    accent: "#e44d3d",
    accentSoft: "#f8ed9b",
    artOne: "#f1f2e8",
    artTwo: "#e44d3d",
  },
  organic: {
    paper: "#f5efe3",
    ink: "#302c26",
    muted: "#766c5b",
    accent: "#9a6250",
    accentSoft: "#e3d4b9",
    artOne: "#bf9871",
    artTwo: "#7c9d7e",
  },
  datanoir: {
    paper: "#11171b",
    ink: "#e5f1ee",
    muted: "#8ca49f",
    accent: "#77f4c9",
    accentSoft: "#1b403b",
    artOne: "#2b8f76",
    artTwo: "#e49a55",
  },
  luxury: {
    paper: "#f5f0e7",
    ink: "#27211d",
    muted: "#766a5e",
    accent: "#b48a45",
    accentSoft: "#e3d3b4",
    artOne: "#d7bf91",
    artTwo: "#72777a",
  },
  retrofuture: {
    paper: "#17102b",
    ink: "#f8f0ff",
    muted: "#b3a1cc",
    accent: "#f3a7ff",
    accentSoft: "#352052",
    artOne: "#50d5ff",
    artTwo: "#ff718c",
  },
};

const state = {
  templates: FALLBACK_TEMPLATES,
  palettes: new Map(FALLBACK_PALETTES.map((palette) => [palette.name, palette])),
  locale: getInitialLocale(),
  theme: getInitialTheme(),
  motionScene: 0,
  query: "",
  family: "all",
  category: "all",
  palette: "all",
  sort: "featured",
  visibleCount: PAGE_SIZE,
  selected: new Map(),
  libraryStatus: "loading",
  lastRequest: null,
  lastRequestResult: null,
  previewTemplate: null,
  previewRequestId: 0,
  toastTimer: null,
};

const elements = {
  grid: document.querySelector("[data-template-grid]"),
  resultsCount: document.querySelector("[data-results-count]"),
  selectionSummary: document.querySelector("[data-selection-summary]"),
  selectionCounts: document.querySelectorAll("[data-selection-count]"),
  selectionTray: document.querySelector("[data-selection-tray]"),
  traySelections: document.querySelector("[data-tray-selections]"),
  drawerSelections: document.querySelector("[data-drawer-selections]"),
  drawer: document.querySelector("[data-request-drawer]"),
  overlay: document.querySelector("[data-overlay]"),
  formView: document.querySelector("[data-form-view]"),
  successView: document.querySelector("[data-success-view]"),
  successTitle: document.querySelector("[data-success-title]"),
  successCopy: document.querySelector("[data-success-copy]"),
  successId: document.querySelector("[data-success-id]"),
  successFootnote: document.querySelector("[data-success-footnote]"),
  fileList: document.querySelector("[data-file-list]"),
  previewModal: document.querySelector("[data-preview-modal]"),
  previewViewport: document.querySelector("[data-preview-viewport]"),
  previewFrame: document.querySelector("[data-preview-frame]"),
  previewTitle: document.querySelector("[data-preview-title]"),
  openTemplate: document.querySelector("[data-open-template]"),
  previewPrevious: document.querySelector("[data-preview-previous]"),
  previewNext: document.querySelector("[data-preview-next]"),
  previewPosition: document.querySelector("[data-preview-position]"),
  previewProgress: document.querySelector("[data-preview-progress]"),
  previewFamily: document.querySelector("[data-preview-family]"),
  previewDescription: document.querySelector("[data-preview-description]"),
  previewCategory: document.querySelector("[data-preview-category]"),
  previewPalette: document.querySelector("[data-preview-palette]"),
  previewSelect: document.querySelector("[data-preview-select]"),
  emptyState: document.querySelector("[data-empty-state]"),
  loadMore: document.querySelector("[data-load-more]"),
  loadMoreCount: document.querySelector("[data-load-more-count]"),
  sourceStatus: document.querySelector("[data-source-status]"),
  toast: document.querySelector("[data-toast]"),
  menu: document.querySelector(".topnav"),
  themeToggle: document.querySelector("[data-theme-toggle]"),
  themeIcon: document.querySelector("[data-theme-icon]"),
  themeLabel: document.querySelector("[data-theme-label]"),
  scrollProgress: document.querySelector("[data-scroll-progress]"),
  parallaxStage: document.querySelector("[data-parallax-stage]"),
  hero: document.querySelector(".hero"),
  heroCopy: document.querySelector('[data-reveal="hero-copy"]'),
  catalogSection: document.querySelector('[data-motion-scene="templates"]'),
  processSection: document.querySelector('[data-motion-scene="process"]'),
  sceneRail: document.querySelector("[data-scene-rail]"),
  sceneIndex: document.querySelector("[data-scene-index]"),
  sceneLabel: document.querySelector("[data-scene-label]"),
  sceneProgress: document.querySelector("[data-scene-progress]"),
  sceneTransition: document.querySelector("[data-scene-transition]"),
  sceneTransitionIndex: document.querySelector("[data-scene-transition-index]"),
};

function t(key, variables = {}) {
  const localeCopy = COPY[state.locale] || COPY[DEFAULT_LOCALE];
  return interpolate(localeCopy[key] ?? COPY[DEFAULT_LOCALE][key] ?? key, variables);
}

function localizedFamily(name) {
  return (
    FAMILY_LABELS[state.locale]?.[name] || FAMILY_LABELS[DEFAULT_LOCALE][name] || humanize(name)
  );
}

function localizedCategory(value) {
  return value === "Core systems" ? t("categoryCore") : value;
}

function localizedPalette(name) {
  if (name === "base") return t("paletteBase");
  return PALETTE_LABELS[state.locale]?.[name] || state.palettes.get(name)?.title || humanize(name);
}

function templateDescription(template) {
  if (state.locale === "en" && template.description) return template.description;
  return (
    FAMILY_DESCRIPTIONS[state.locale]?.[templateFamily(template)] ||
    template.description ||
    t("defaultDescription")
  );
}

function applyLocale() {
  const locale = state.locale;
  document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
  document.documentElement.dataset.locale = locale;
  const localeSelect = document.querySelector("select[data-locale]");
  if (localeSelect) localeSelect.value = locale;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.setAttribute("title", t(element.dataset.i18nTitle));
  });
  applyTheme();
  updateMotionSceneChrome();
  elements.sourceStatus.textContent =
    state.libraryStatus === "loaded"
      ? t("sourceLoaded", { count: state.templates.length })
      : state.libraryStatus === "fallback"
        ? t("sourceFallback")
        : t("sourceLoading");
  renderFilterOptions();
  renderTemplates();
  updateSelectionUi();
  if (state.previewTemplate && !elements.previewModal.hidden) {
    elements.previewTitle.textContent = templateName(state.previewTemplate);
    updatePreviewMeta(state.previewTemplate);
    elements.previewFrame.srcdoc = previewDocument(state.previewTemplate);
  }
  if (state.lastRequest && state.lastRequestResult)
    showSuccess(state.lastRequest, state.lastRequestResult);
}

function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  state.locale = locale;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // The UI can still switch languages when storage is unavailable.
  }
  applyLocale();
}

function applyTheme() {
  const theme = SUPPORTED_THEMES.includes(state.theme) ? state.theme : DEFAULT_THEME;
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  if (!elements.themeToggle) return;
  elements.themeToggle.dataset.theme = theme;
  elements.themeToggle.setAttribute(
    "aria-label",
    t(theme === "dark" ? "themeSwitchToLight" : "themeSwitchToDark"),
  );
  elements.themeToggle.setAttribute("aria-pressed", String(theme === "light"));
  elements.themeIcon.textContent = theme === "dark" ? "☾" : "☀";
  elements.themeLabel.textContent = t(theme === "dark" ? "themeDark" : "themeLight");
}

function setTheme(theme) {
  if (!SUPPORTED_THEMES.includes(theme) || theme === state.theme) return;
  const commit = () => {
    state.theme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The theme still applies when storage is unavailable.
    }
    applyTheme();
  };
  if (typeof document.startViewTransition === "function" && !isReducedMotion()) {
    document.startViewTransition(commit);
    return;
  }
  document.documentElement.classList.add("theme-switching");
  window.setTimeout(() => {
    commit();
    window.setTimeout(() => document.documentElement.classList.remove("theme-switching"), 520);
  }, 24);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slug(value) {
  return String(value ?? "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function humanize(value) {
  return String(value ?? "")
    .replaceAll("-", " ")
    .replaceAll("/", " / ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function templateName(template) {
  const title = template.title || template.name;
  return title.replace(/\s+template$/i, "");
}

function templateCategory(template) {
  return template.styleCategory || "Core systems";
}

function templatePalette(template) {
  return template.palette && template.palette !== "base"
    ? template.palette
    : template.stylePalette || "base";
}

function templateFamily(template) {
  return template.baseFamily || template.family || "aurora";
}

function paletteTitle(name) {
  return localizedPalette(name);
}

function themeFor(template) {
  const familyTheme = FAMILY_TOKENS[templateFamily(template)] || FAMILY_TOKENS.aurora;
  const paletteTheme = state.palettes.get(templatePalette(template))?.tokens;
  return { ...familyTheme, ...(paletteTheme || {}) };
}

function previewMarkup(template, theme) {
  const familyClass = `family-${slug(templateFamily(template))}`;
  const safeTitle = escapeHtml(templateName(template).replace(/\s+\/\s+.*/, ""));
  const category = escapeHtml(template.styleCategory || localizedFamily(templateFamily(template)));
  return `<div class="template-visual ${familyClass}" style="--preview-paper:${escapeHtml(theme.paper)};--preview-ink:${escapeHtml(theme.ink)};--preview-muted:${escapeHtml(theme.muted)};--preview-accent:${escapeHtml(theme.accent)};--preview-art:${escapeHtml(theme.artOne)};--preview-soft:${escapeHtml(theme.accentSoft)}">
    <div class="visual-top"><span>PL / 01</span><span>${escapeHtml(paletteTitle(templatePalette(template)))}</span></div>
    <div class="visual-shape"></div>
    <div class="visual-copy"><span class="visual-kicker">${category}</span><strong class="visual-title">${safeTitle}</strong><span class="visual-lines"></span></div>
    <div class="visual-footer"><span>${escapeHtml(template.modifier || "base")}</span><span>16:9</span></div>
  </div>`;
}

function previewDocument(template) {
  return `<!doctype html>
<html lang="${state.locale === "zh" ? "zh-CN" : state.locale}">
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="/web/portal/styles.css" />
    <style>
      html, body { margin: 0; padding: 0; overflow: hidden; background: #030a12; }
      body { width: 1600px; height: 900px; }
      .template-visual { width: 1600px; height: 900px; aspect-ratio: auto; border: 0; }
    </style>
  </head>
  <body>${previewMarkup(template, themeFor(template))}</body>
</html>`;
}

function previewCandidates() {
  return filteredTemplates();
}

function updatePreviewMeta(template) {
  if (!template) return;
  const candidates = previewCandidates();
  const index = Math.max(
    0,
    candidates.findIndex((candidate) => candidate.name === template.name),
  );
  const total = Math.max(candidates.length, 1);
  elements.previewPosition.textContent = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(3, "0")}`;
  elements.previewProgress.style.width = `${((index + 1) / total) * 100}%`;
  elements.previewFamily.textContent = localizedFamily(templateFamily(template));
  elements.previewDescription.textContent = templateDescription(template);
  elements.previewCategory.textContent = localizedCategory(templateCategory(template));
  elements.previewPalette.textContent = paletteTitle(templatePalette(template));
  const selected = state.selected.has(template.name);
  elements.previewSelect.querySelector("span").textContent = t(
    selected ? "previewSelected" : "previewSelect",
  );
  elements.previewSelect.setAttribute("aria-pressed", String(selected));
  elements.previewPrevious.disabled = total < 2;
  elements.previewNext.disabled = total < 2;
}

function navigatePreview(direction) {
  const candidates = previewCandidates();
  if (candidates.length < 2 || !state.previewTemplate) return;
  const currentIndex = candidates.findIndex(
    (candidate) => candidate.name === state.previewTemplate.name,
  );
  const nextIndex = (currentIndex + direction + candidates.length) % candidates.length;
  void openPreview(candidates[nextIndex].name, { switching: true });
}

function cardMarkup(template) {
  const theme = themeFor(template);
  const selected = state.selected.has(template.name);
  const category = template.styleCategory || localizedFamily(templateFamily(template));
  const treatment = template.styleTreatment || template.modifier || "base";
  return `<article class="template-card${selected ? " is-selected" : ""}" data-template-card="${escapeHtml(template.name)}">
    <span class="card-check" aria-hidden="true">✓</span>
    ${previewMarkup(template, theme)}
    <div class="card-content">
      <div class="card-kicker"><span>${escapeHtml(category)}</span><span>${escapeHtml(paletteTitle(templatePalette(template)))}</span></div>
      <h3 title="${escapeHtml(templateName(template))}">${escapeHtml(templateName(template))}</h3>
      <p>${escapeHtml(templateDescription(template))}</p>
      <div class="card-actions">
        <button class="card-action card-action-primary" type="button" data-select-template="${escapeHtml(template.name)}">${selected ? `${escapeHtml(t("selectedButton"))} ✓` : escapeHtml(t("selectButton"))}</button>
        <button class="card-action" type="button" data-preview-template="${escapeHtml(template.name)}">${escapeHtml(t("previewButton"))}</button>
      </div>
      <span class="sr-only">${escapeHtml(humanize(treatment))}</span>
    </div>
  </article>`;
}

function filteredTemplates() {
  const query = state.query.trim().toLowerCase();
  const results = state.templates.filter((template) => {
    const haystack = [
      template.name,
      template.title,
      template.description,
      template.family,
      template.baseFamily,
      template.styleCategory,
      template.styleTreatment,
      templatePalette(template),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesFamily = state.family === "all" || templateFamily(template) === state.family;
    const matchesCategory =
      state.category === "all" || templateCategory(template) === state.category;
    const matchesPalette = state.palette === "all" || templatePalette(template) === state.palette;
    return matchesQuery && matchesFamily && matchesCategory && matchesPalette;
  });

  if (state.sort === "name") {
    return results.sort((left, right) =>
      templateName(left).localeCompare(templateName(right), state.locale),
    );
  }
  if (state.sort === "style") {
    return results.sort((left, right) =>
      templateCategory(left).localeCompare(templateCategory(right), state.locale),
    );
  }
  return results;
}

function renderTemplates() {
  const results = filteredTemplates();
  const visible = results.slice(0, state.visibleCount);
  elements.grid.innerHTML = visible.map(cardMarkup).join("");
  requestAnimationFrame(() => {
    elements.grid.querySelectorAll(".template-card").forEach((card, index) => {
      card.style.setProperty("--card-index", String(index));
      card.classList.add("is-in");
    });
    bindCardMotion();
  });
  elements.emptyState.hidden = results.length !== 0;
  elements.grid.hidden = results.length === 0;
  elements.resultsCount.textContent = t("resultsCount", { count: results.length });
  elements.loadMore.hidden = visible.length >= results.length || results.length === 0;
  elements.loadMoreCount.textContent =
    results.length > visible.length
      ? t("remaining", { count: results.length - visible.length })
      : "";
  renderActiveFilters();
  elements.grid.querySelectorAll("[data-select-template]").forEach((button) => {
    button.addEventListener("click", () => toggleSelection(button.dataset.selectTemplate));
  });
  elements.grid.querySelectorAll("[data-preview-template]").forEach((button) => {
    button.addEventListener("click", () => openPreview(button.dataset.previewTemplate));
  });
}

function bindCardMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  elements.grid.querySelectorAll(".template-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--card-rx", `${y * -2.2}deg`);
      card.style.setProperty("--card-ry", `${x * 2.8}deg`);
      card.style.setProperty("--pointer-x", `${(x + 0.5) * 100}%`);
      card.style.setProperty("--pointer-y", `${(y + 0.5) * 100}%`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--card-rx");
      card.style.removeProperty("--card-ry");
      card.style.removeProperty("--pointer-x");
      card.style.removeProperty("--pointer-y");
    });
  });
}

function bindAmbientSurfaceMotion() {
  if (isReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
  document.querySelectorAll(".process-card, .filter-panel").forEach((surface) => {
    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      surface.style.setProperty(
        "--pointer-x",
        `${((event.clientX - rect.left) / rect.width) * 100}%`,
      );
      surface.style.setProperty(
        "--pointer-y",
        `${((event.clientY - rect.top) / rect.height) * 100}%`,
      );
    });
    surface.addEventListener("pointerleave", () => {
      surface.style.removeProperty("--pointer-x");
      surface.style.removeProperty("--pointer-y");
    });
  });
}

function bindMagneticMotion() {
  if (isReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
  document
    .querySelectorAll(".hero-actions .button, [data-open-request], [data-preview-select]")
    .forEach((target) => {
      target.dataset.magnetic = "true";
      target.addEventListener("pointermove", (event) => {
        const rect = target.getBoundingClientRect();
        const intensity = target.classList.contains("button-small") ? 3 : 5;
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * intensity;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * intensity;
        target.style.setProperty("--mag-x", `${x}px`);
        target.style.setProperty("--mag-y", `${y}px`);
      });
      target.addEventListener("pointerleave", () => {
        target.style.removeProperty("--mag-x");
        target.style.removeProperty("--mag-y");
      });
    });
}

function renderActiveFilters() {
  const filters = [];
  if (state.query) filters.push({ key: "query", label: t("filterQuery", { query: state.query }) });
  if (state.family !== "all") filters.push({ key: "family", label: localizedFamily(state.family) });
  if (state.category !== "all")
    filters.push({ key: "category", label: localizedCategory(state.category) });
  if (state.palette !== "all") filters.push({ key: "palette", label: paletteTitle(state.palette) });
  const container = document.querySelector("[data-active-filters]");
  container.hidden = filters.length === 0;
  container.innerHTML = filters
    .map(
      (filter) =>
        `<span class="filter-chip">${escapeHtml(filter.label)} <button type="button" aria-label="${escapeHtml(t("removeFilter", { label: filter.label }))}" data-remove-filter="${filter.key}">×</button></span>`,
    )
    .join("");
  container.querySelectorAll("[data-remove-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.removeFilter;
      if (key === "query") {
        state.query = "";
        document.querySelector("[data-search]").value = "";
      } else {
        state[key] = "all";
        const field = document.querySelector(`[data-${key}-filter]`);
        if (field) field.value = "all";
      }
      state.visibleCount = PAGE_SIZE;
      renderTemplates();
    });
  });
}

function renderFilterOptions() {
  const familySelect = document.querySelector("[data-family-filter]");
  const categorySelect = document.querySelector("[data-category-filter]");
  const paletteSelect = document.querySelector("[data-palette-filter]");
  const families = [...new Set(state.templates.map(templateFamily))].sort((left, right) =>
    localizedFamily(left).localeCompare(localizedFamily(right), state.locale),
  );
  const categories = [...new Set(state.templates.map(templateCategory))].sort((left, right) =>
    left.localeCompare(right, state.locale),
  );
  const palettes = [...new Set(state.templates.map(templatePalette))].sort((left, right) =>
    paletteTitle(left).localeCompare(paletteTitle(right), state.locale),
  );
  familySelect.innerHTML = `<option value="all">${escapeHtml(t("familyAll"))}</option>${families.map((family) => `<option value="${escapeHtml(family)}">${escapeHtml(localizedFamily(family))}</option>`).join("")}`;
  categorySelect.innerHTML = `<option value="all">${escapeHtml(t("categoryAll"))}</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(localizedCategory(category))}</option>`).join("")}`;
  paletteSelect.innerHTML = `<option value="all">${escapeHtml(t("paletteAll"))}</option>${palettes.map((palette) => `<option value="${escapeHtml(palette)}">${escapeHtml(paletteTitle(palette))}</option>`).join("")}`;
  familySelect.value = state.family;
  categorySelect.value = state.category;
  paletteSelect.value = state.palette;
}

function updateSelectionUi() {
  const selected = [...state.selected.values()];
  elements.selectionCounts.forEach((element) => {
    element.textContent = String(selected.length);
  });
  elements.selectionSummary.textContent = t("selectionSummary", { count: selected.length });
  elements.selectionTray.hidden = selected.length === 0;
  elements.traySelections.innerHTML = selected
    .map(
      (template) =>
        `<div class="tray-chip"><span>${escapeHtml(templateName(template))}</span><button type="button" aria-label="${escapeHtml(t("removeSelection", { name: templateName(template) }))}" data-remove-selected="${escapeHtml(template.name)}">×</button></div>`,
    )
    .join("");
  elements.traySelections.querySelectorAll("[data-remove-selected]").forEach((button) => {
    button.addEventListener("click", () => toggleSelection(button.dataset.removeSelected));
  });
  elements.drawerSelections.innerHTML = selected
    .map(
      (template, index) =>
        `<div class="selected-template"><span class="selected-template-index">0${index + 1}</span><span title="${escapeHtml(templateName(template))}">${escapeHtml(templateName(template))}</span><button type="button" aria-label="${escapeHtml(t("removeSelection", { name: templateName(template) }))}" data-remove-selected="${escapeHtml(template.name)}">×</button></div>`,
    )
    .join("");
  elements.drawerSelections.querySelectorAll("[data-remove-selected]").forEach((button) => {
    button.addEventListener("click", () => toggleSelection(button.dataset.removeSelected));
  });
}

function toggleSelection(name) {
  const template = state.templates.find((candidate) => candidate.name === name);
  if (!template) return;
  if (state.selected.has(name)) {
    state.selected.delete(name);
  } else if (state.selected.size >= MAX_SELECTIONS) {
    showToast(t("maxSelections"));
    return;
  } else {
    state.selected.set(name, template);
  }
  updateSelectionUi();
  renderTemplates();
  if (state.previewTemplate && !elements.previewModal.hidden)
    updatePreviewMeta(state.previewTemplate);
}

function openDrawer() {
  if (state.selected.size === 0) {
    showToast(t("noSelectionToast"));
    document.querySelector("#templates").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  elements.drawer.classList.add("is-open");
  elements.drawer.setAttribute("aria-hidden", "false");
  elements.drawer.removeAttribute("inert");
  elements.overlay.hidden = false;
  document.body.classList.add("drawer-open");
  setTimeout(() => elements.drawer.querySelector("input")?.focus(), 80);
}

function closeDrawer() {
  elements.drawer.classList.remove("is-open");
  elements.drawer.setAttribute("aria-hidden", "true");
  elements.drawer.setAttribute("inert", "");
  elements.overlay.hidden = true;
  document.body.classList.remove("drawer-open");
}

async function templateIsAvailable(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { method: "HEAD", signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function openPreview(name, options = {}) {
  const template = state.templates.find((candidate) => candidate.name === name);
  if (!template) return;
  state.previewTemplate = template;
  const previewRequestId = ++state.previewRequestId;
  if (options.switching) {
    elements.previewModal.classList.remove("is-switching");
    void elements.previewModal.offsetWidth;
    elements.previewModal.classList.add("is-switching");
    window.setTimeout(() => elements.previewModal.classList.remove("is-switching"), 420);
  }
  const templatePath = template.path.startsWith("templates/")
    ? template.path
    : `templates/${template.path}`;
  const templateUrl = new URL(`/${templatePath}`, window.location.origin).href;
  elements.previewTitle.textContent = templateName(template);
  updatePreviewMeta(template);
  elements.openTemplate.hidden = true;
  elements.openTemplate.removeAttribute("href");
  elements.previewFrame.removeAttribute("src");
  elements.previewFrame.srcdoc = previewDocument(template);
  elements.previewModal.hidden = false;
  elements.previewModal.classList.add("is-open");
  elements.overlay.hidden = false;
  requestAnimationFrame(scalePreviewFrame);

  if (!(await templateIsAvailable(templateUrl)) || previewRequestId !== state.previewRequestId)
    return;
  elements.openTemplate.hidden = false;
  elements.openTemplate.href = templateUrl;
  elements.previewFrame.removeAttribute("srcdoc");
  elements.previewFrame.src = templateUrl;
  requestAnimationFrame(scalePreviewFrame);
}

function closePreview() {
  state.previewRequestId += 1;
  state.previewTemplate = null;
  elements.previewModal.classList.remove("is-open", "is-switching");
  elements.previewModal.hidden = true;
  elements.openTemplate.hidden = false;
  elements.openTemplate.removeAttribute("href");
  elements.previewFrame.removeAttribute("srcdoc");
  elements.previewFrame.src = "about:blank";
  if (!elements.drawer.classList.contains("is-open")) elements.overlay.hidden = true;
}

function scalePreviewFrame() {
  if (elements.previewModal.hidden) return;
  const availableWidth = Math.max(elements.previewViewport.clientWidth - 8, 260);
  const scale = Math.min(availableWidth / 1600, 1);
  elements.previewFrame.style.transform = `scale(${scale})`;
  elements.previewViewport.style.height = `${Math.max(220, 900 * scale + 8)}px`;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 3600);
}

function localDateValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function requestId() {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PL-${datePart}-${randomPart}`;
}

function attachmentFiles(form) {
  const input = form.querySelector("[data-attachments]");
  return [...(input?.files || [])];
}

function attachmentValidationError(form) {
  const files = attachmentFiles(form);
  if (files.length > MAX_ATTACHMENT_FILES) {
    return t("attachmentMaxFiles", { count: MAX_ATTACHMENT_FILES });
  }
  const oversizedFile = files.find((file) => file.size > MAX_ATTACHMENT_BYTES);
  if (oversizedFile) {
    return t("attachmentMaxSingle", { name: oversizedFile.name });
  }
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
    return t("attachmentMaxTotal");
  }
  return "";
}

function formPayload(form) {
  const data = new FormData(form);
  return {
    id: requestId(),
    createdAt: new Date().toISOString(),
    status: "new",
    source: "presentlab-client-request-portal",
    customer: {
      name: String(data.get("contactName") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
    },
    project: {
      name: String(data.get("projectName") || "").trim(),
      slideCount: Number(data.get("slideCount") || 0),
      deadline: String(data.get("deadline") || ""),
      service: String(data.get("service") || ""),
      notes: String(data.get("notes") || "").trim(),
    },
    templates: [...state.selected.values()].map((template) => ({
      name: template.name,
      title: templateName(template),
      path: template.path,
      family: templateFamily(template),
      palette: templatePalette(template),
      category: templateCategory(template),
      modifier: template.modifier || "base",
    })),
    attachments: attachmentFiles(form)
      .slice(0, MAX_ATTACHMENT_FILES)
      .map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
  };
}

function saveRequestLocally(payload) {
  try {
    const cutoff = Date.now() - LOCAL_REQUEST_TTL_MS;
    const parsed = JSON.parse(localStorage.getItem(REQUEST_STORAGE_KEY) || "[]");
    const previous = Array.isArray(parsed)
      ? parsed.filter(
          (request) =>
            request &&
            typeof request.createdAt === "string" &&
            Number.isFinite(Date.parse(request.createdAt)) &&
            Date.parse(request.createdAt) >= cutoff,
        )
      : [];
    previous.push(payload);
    localStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify(previous));
    return true;
  } catch (error) {
    console.warn("Unable to save PresentLab request locally:", error);
    return false;
  }
}

function downloadRequest(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${payload.id.toLowerCase()}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function mailtoUrl(email, payload) {
  const subject = encodeURIComponent(
    `[PresentLab] ${payload.project.name || t("drawerTitle")} — ${payload.id}`,
  );
  const body = encodeURIComponent(
    [
      `${t("requestCode")}: ${payload.id}`,
      `${t("projectNameLabel")}: ${payload.project.name}`,
      `${t("contactNameLabel")}: ${payload.customer.name}`,
      `${t("emailLabel")}: ${payload.customer.email}`,
      `${t("slideCountLabel")}: ${payload.project.slideCount}`,
      `${t("deadlineLabel")}: ${payload.project.deadline || "—"}`,
      `${t("serviceLegend")}: ${payload.project.service}`,
      `${t("navTemplates")}: ${payload.templates.map((template) => template.title).join(", ")}`,
      "",
      payload.project.notes || t("notesLabel"),
    ].join("\n"),
  );
  return `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
}

async function postRequest(endpoint, payload, files) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const hasFiles = files.length > 0;
  let body = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json" };
  if (hasFiles) {
    const multipart = new FormData();
    multipart.append("request", JSON.stringify(payload));
    files.forEach((file) => multipart.append("attachments", file, file.name));
    body = multipart;
    delete headers["Content-Type"];
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Request endpoint returned ${response.status}.`);
  } finally {
    clearTimeout(timeout);
  }
}

async function sendRequest(payload, form) {
  const endpoint = document.documentElement.dataset.requestEndpoint?.trim();
  const handoffEmail = document.documentElement.dataset.handoffEmail?.trim();
  if (endpoint) {
    await postRequest(endpoint, payload, attachmentFiles(form));
    return { mode: "endpoint" };
  }
  if (handoffEmail) {
    window.location.href = mailtoUrl(handoffEmail, payload);
    return { mode: "email" };
  }
  saveRequestLocally(payload);
  downloadRequest(payload);
  return { mode: "local" };
}

function showSuccess(payload, result) {
  state.lastRequest = payload;
  state.lastRequestResult = result;
  elements.formView.hidden = true;
  elements.successView.hidden = false;
  elements.successId.textContent = payload.id;
  if (result.mode === "endpoint") {
    elements.successTitle.textContent = t("endpointSuccessTitle");
    elements.successCopy.textContent = t("endpointSuccessCopy");
    elements.successFootnote.textContent = t("endpointSuccessFootnote");
  } else if (result.mode === "email") {
    elements.successTitle.textContent = t("emailSuccessTitle");
    elements.successCopy.textContent = t("emailSuccessCopy");
    elements.successFootnote.textContent = t("emailSuccessFootnote");
  } else {
    elements.successTitle.textContent = t("localSuccessTitle");
    elements.successCopy.textContent = t("localSuccessCopy");
    elements.successFootnote.textContent = t("localSuccessFootnote");
  }
}

function resetRequestView() {
  elements.formView.hidden = false;
  elements.successView.hidden = true;
  document.querySelector("[data-no-selection-hint]").hidden = true;
  document.querySelector("[data-request-form]").reset();
  document.querySelector("[data-file-list]").hidden = true;
  document.querySelector("[data-file-list]").innerHTML = "";
}

function handleFiles(input) {
  const files = [...input.files].slice(0, MAX_ATTACHMENT_FILES);
  elements.fileList.hidden = files.length === 0;
  elements.fileList.innerHTML = files
    .map(
      (file) =>
        `<div class="file-item"><span>${escapeHtml(file.name)}</span><span>${Math.ceil(file.size / 1024)} KB</span></div>`,
    )
    .join("");
}

function bindEvents() {
  document
    .querySelectorAll("[data-open-request]")
    .forEach((button) => button.addEventListener("click", openDrawer));
  document
    .querySelectorAll("[data-close-request]")
    .forEach((button) => button.addEventListener("click", closeDrawer));
  document.querySelector("[data-close-preview]").addEventListener("click", closePreview);
  elements.previewPrevious.addEventListener("click", () => navigatePreview(-1));
  elements.previewNext.addEventListener("click", () => navigatePreview(1));
  elements.previewSelect.addEventListener("click", () => {
    if (state.previewTemplate) toggleSelection(state.previewTemplate.name);
  });
  elements.overlay.addEventListener("click", () => {
    closePreview();
    closeDrawer();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePreview();
      closeDrawer();
    }
    if (!elements.previewModal.hidden && event.key === "ArrowLeft") navigatePreview(-1);
    if (!elements.previewModal.hidden && event.key === "ArrowRight") navigatePreview(1);
    if (
      event.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)
    ) {
      event.preventDefault();
      document.querySelector("[data-search]").focus();
    }
  });
  document.querySelector("[data-menu-toggle]").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const open = elements.menu.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", t(open ? "menuClose" : "menuOpen"));
  });
  document.querySelector("[data-locale]").addEventListener("change", (event) => {
    setLocale(event.target.value);
  });
  elements.themeToggle.addEventListener("click", () => {
    setTheme(state.theme === "dark" ? "light" : "dark");
  });
  document
    .querySelectorAll(".topnav-link")
    .forEach((link) =>
      link.addEventListener("click", () => elements.menu.classList.remove("is-open")),
    );
  document.querySelector("[data-search]").addEventListener("input", (event) => {
    state.query = event.target.value;
    state.visibleCount = PAGE_SIZE;
    renderTemplates();
  });
  document.querySelector("[data-family-filter]").addEventListener("change", (event) => {
    state.family = event.target.value;
    state.visibleCount = PAGE_SIZE;
    renderTemplates();
  });
  document.querySelector("[data-category-filter]").addEventListener("change", (event) => {
    state.category = event.target.value;
    state.visibleCount = PAGE_SIZE;
    renderTemplates();
  });
  document.querySelector("[data-palette-filter]").addEventListener("change", (event) => {
    state.palette = event.target.value;
    state.visibleCount = PAGE_SIZE;
    renderTemplates();
  });
  document.querySelector("[data-sort]").addEventListener("change", (event) => {
    state.sort = event.target.value;
    state.visibleCount = PAGE_SIZE;
    renderTemplates();
  });
  document
    .querySelectorAll("[data-clear-filters]")
    .forEach((button) => button.addEventListener("click", clearFilters));
  elements.loadMore.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderTemplates();
  });
  document.querySelector("[data-deadline]").min = localDateValue();
  document
    .querySelector("[data-attachments]")
    .addEventListener("change", (event) => handleFiles(event.target));
  document.querySelector("[data-request-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.selected.size === 0) {
      document.querySelector("[data-no-selection-hint]").hidden = false;
      return;
    }
    const form = event.currentTarget;
    const button = document.querySelector("[data-submit-request]");
    button.disabled = true;
    button.innerHTML = `${escapeHtml(t("submitLoading"))} <span>↗</span>`;
    let payload;
    try {
      const attachmentError = attachmentValidationError(form);
      if (attachmentError) {
        showToast(attachmentError);
        return;
      }
      payload = formPayload(form);
      const result = await sendRequest(payload, form);
      showSuccess(payload, result);
    } catch (error) {
      console.error(error);
      const saved = payload ? saveRequestLocally(payload) : false;
      showToast(saved ? t("requestSavedError") : t("requestGenericError"));
    } finally {
      button.disabled = false;
      button.innerHTML = `${escapeHtml(t("submitButton"))} <span>→</span>`;
    }
  });
  document.querySelector("[data-download-request]").addEventListener("click", () => {
    if (state.lastRequest) downloadRequest(state.lastRequest);
  });
  document.querySelector("[data-new-request]").addEventListener("click", resetRequestView);
}

function clearFilters() {
  state.query = "";
  state.family = "all";
  state.category = "all";
  state.palette = "all";
  state.visibleCount = PAGE_SIZE;
  document.querySelector("[data-search]").value = "";
  document.querySelector("[data-family-filter]").value = "all";
  document.querySelector("[data-category-filter]").value = "all";
  document.querySelector("[data-palette-filter]").value = "all";
  renderTemplates();
}

async function loadJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Unable to load ${url}: ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function loadLibrary() {
  try {
    const [templates, paletteIndex] = await Promise.all([
      loadJson(TEMPLATE_INDEX_URL),
      loadJson(PALETTE_INDEX_URL),
    ]);
    if (!Array.isArray(templates) || templates.length === 0)
      throw new Error("Template index is empty.");
    state.templates = templates;
    if (Array.isArray(paletteIndex.palettes))
      state.palettes = new Map(paletteIndex.palettes.map((palette) => [palette.name, palette]));
    state.libraryStatus = "loaded";
    elements.sourceStatus.textContent = t("sourceLoaded", { count: templates.length });
  } catch (error) {
    console.warn("PresentLab template library fallback:", error);
    state.libraryStatus = "fallback";
    elements.sourceStatus.textContent = t("sourceFallback");
  }
  renderFilterOptions();
  renderTemplates();
}

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function updateScrollProgress() {
  const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
  elements.scrollProgress.style.transform = `scaleX(${progress})`;
}

function clampUnit(value) {
  return Math.min(Math.max(value, 0), 1);
}

function sceneProgressFor(section) {
  if (!section) return 0;
  const rect = section.getBoundingClientRect();
  return clampUnit((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
}

function updateMotionSceneChrome(index = state.motionScene) {
  const scene = MOTION_SCENES[index] || MOTION_SCENES[0];
  if (elements.sceneIndex) elements.sceneIndex.textContent = scene.index;
  if (elements.sceneLabel) elements.sceneLabel.textContent = t(scene.copy);
  document.documentElement.dataset.motionScene = scene.id;
}

function updateMotionChoreography() {
  const heroProgress = elements.hero
    ? clampUnit(window.scrollY / Math.max(elements.hero.offsetHeight * 0.72, 1))
    : 0;
  const catalogProgress = sceneProgressFor(elements.catalogSection);
  const processProgress = sceneProgressFor(elements.processSection);
  const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const totalProgress = clampUnit(window.scrollY / scrollable);

  document.documentElement.style.setProperty("--scroll-progress", totalProgress.toFixed(4));
  elements.hero?.style.setProperty("--hero-progress", heroProgress.toFixed(4));
  elements.heroCopy?.style.setProperty("--hero-copy-shift", `${heroProgress * -58}px`);
  elements.heroCopy?.style.setProperty("--hero-copy-blur", `${heroProgress * 1.25}px`);
  elements.parallaxStage?.style.setProperty("--hero-visual-shift", `${heroProgress * 72}px`);
  elements.parallaxStage?.style.setProperty("--hero-visual-scale", `${1 - heroProgress * 0.055}`);
  elements.parallaxStage?.style.setProperty("--hero-board-y", `${heroProgress * 56}px`);
  elements.parallaxStage?.style.setProperty("--hero-board-rotate", `${heroProgress * -3.5}deg`);
  elements.parallaxStage?.style.setProperty("--hero-grid-shift", `${heroProgress * 36}px`);
  elements.catalogSection?.style.setProperty("--section-progress", catalogProgress.toFixed(4));
  elements.processSection?.style.setProperty("--section-progress", processProgress.toFixed(4));

  const sceneElements = [elements.hero, elements.catalogSection, elements.processSection].filter(
    Boolean,
  );
  const marker = window.innerHeight * 0.42;
  const activeIndex = Math.max(
    0,
    sceneElements.findIndex((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= marker && rect.bottom >= marker;
    }),
  );
  if (activeIndex !== state.motionScene) {
    state.motionScene = activeIndex;
    updateMotionSceneChrome(activeIndex);
  }
  const activeSection = sceneElements[state.motionScene] || sceneElements[0];
  const activeProgress = sceneProgressFor(activeSection);
  elements.sceneProgress?.style.setProperty(
    "transform",
    `scaleY(${Math.max(0.16, activeProgress)})`,
  );
}

let motionFrame = 0;

function requestMotionFrame() {
  if (motionFrame) return;
  motionFrame = requestAnimationFrame(() => {
    motionFrame = 0;
    updateScrollProgress();
    updateMotionChoreography();
  });
}

function bindMotionScroll() {
  requestMotionFrame();
  window.addEventListener("scroll", requestMotionFrame, { passive: true });
  window.addEventListener("resize", requestMotionFrame);
}

function scrollToMotionTarget(target, href, smooth = true) {
  target.scrollIntoView({
    behavior: smooth && !isReducedMotion() ? "smooth" : "auto",
    block: "start",
  });
  window.history.replaceState(null, "", href);
}

function playSceneTransition(target, href) {
  const scene = MOTION_SCENES.find((item) => item.id === target.id);
  if (!scene || isReducedMotion() || !elements.sceneTransition) {
    scrollToMotionTarget(target, href);
    return;
  }
  elements.sceneTransitionIndex.textContent = scene.index;
  elements.sceneTransition.classList.remove("is-active");
  void elements.sceneTransition.offsetWidth;
  document.documentElement.classList.add("is-transitioning");
  elements.sceneTransition.classList.add("is-active");
  window.setTimeout(() => scrollToMotionTarget(target, href, false), 230);
  window.setTimeout(() => {
    elements.sceneTransition.classList.remove("is-active");
    document.documentElement.classList.remove("is-transitioning");
  }, 980);
}

function bindAnchorNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      elements.menu.classList.remove("is-open");
      playSceneTransition(target, link.getAttribute("href"));
    });
  });
}

function bindSectionObserver() {
  const links = [...document.querySelectorAll('.topnav-link[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (!("IntersectionObserver" in window) || sections.length === 0) return;
  const observer = new window.IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) =>
        link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`),
      );
    },
    { rootMargin: "-28% 0px -56% 0px", threshold: [0.1, 0.35, 0.7] },
  );
  sections.forEach((section) => observer.observe(section));
}

function bindRevealMotion() {
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if (isReducedMotion() || !("IntersectionObserver" in window)) {
    revealItems.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new window.IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
  );
  revealItems.forEach((element) => observer.observe(element));
}

function bindStageParallax() {
  if (!elements.parallaxStage || isReducedMotion()) return;
  elements.parallaxStage.addEventListener("pointermove", (event) => {
    const rect = elements.parallaxStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    elements.parallaxStage.style.setProperty("--parallax-x", `${x * 16}px`);
    elements.parallaxStage.style.setProperty("--parallax-y", `${y * 12}px`);
    elements.parallaxStage.style.setProperty("--pointer-x", `${(x + 0.5) * 100}%`);
    elements.parallaxStage.style.setProperty("--pointer-y", `${(y + 0.5) * 100}%`);
  });
  elements.parallaxStage.addEventListener("pointerleave", () => {
    elements.parallaxStage.style.removeProperty("--parallax-x");
    elements.parallaxStage.style.removeProperty("--parallax-y");
    elements.parallaxStage.style.removeProperty("--pointer-x");
    elements.parallaxStage.style.removeProperty("--pointer-y");
  });
}

function setupExperience() {
  bindRevealMotion();
  bindAnchorNavigation();
  bindSectionObserver();
  bindStageParallax();
  bindAmbientSurfaceMotion();
  bindMagneticMotion();
  bindMotionScroll();
  requestAnimationFrame(() => document.documentElement.classList.add("is-ready"));
}

window.addEventListener("resize", scalePreviewFrame);

document.documentElement.classList.add("js");
bindEvents();
applyLocale();
setupExperience();
loadLibrary();
