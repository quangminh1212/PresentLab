/**
 * Cấu hình khởi động Chromium cho các script kiểm tra PresentLab.
 *
 * MẶC ĐỊNH: dùng GPU thật (NVIDIA GTX 1060). Nhanh hơn và khởi động nhanh hơn
 * đáng kể so với render bằng phần mềm:
 *   - GPU thật  : ~11.9s khởi động
 *   - SwiftShader: ~18-25s khởi động, và ép CPU lên 100% suốt thời gian chạy
 *
 * LƯU Ý QUAN TRỌNG: Playwright mặc định vẫn chọn SwiftShader (render bằng CPU)
 * ngay cả khi không truyền cờ. Phải ép "--use-angle=d3d11" mới thực sự dùng card.
 *
 * Khi nào cần quay lại SwiftShader:
 *   Đặt biến môi trường PRESENTLAB_SOFTWARE_GL=1
 *   Render bằng phần mềm cho kết quả khung hình ổn định, lặp lại được, không phụ
 *   thuộc driver GPU. Các phép đo opacity/thời gian scroll đã thực hiện trước đây
 *   đều dùng chế độ này; nếu cần đối chiếu với số liệu cũ thì phải bật lại.
 */
const useSoftware = process.env.PRESENTLAB_SOFTWARE_GL === "1";

export const launchArgs = useSoftware
  ? ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  : [
      "--use-gl=angle",
      "--use-angle=d3d11",
      "--ignore-gpu-blocklist",
      "--enable-gpu-rasterization",
    ];

export const launchOptions = { args: launchArgs };

/** Ghi ra đang dùng chế độ render nào, để log không gây nhầm lẫn. */
export function logRendererMode() {
  const mode = useSoftware ? "SwiftShader (CPU)" : "GPU (d3d11)";
  console.log(`[render] che do: ${mode}`);
  if (useSoftware) {
    console.log("[render] CANH BAO: render bang CPU, se ngon 100% CPU trong luc chay.");
  }
}
