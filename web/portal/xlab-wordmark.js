export const XLAB_LOCKUP = Object.freeze({
  glyphWidth: 3.6,
  glyphHeight: 3.8,
  stroke: 1,
  textGap: 0.5,
  letterGap: 0.35,
});

function drawX(context, left, top) {
  const { glyphWidth, glyphHeight, stroke } = XLAB_LOCKUP;
  context.save();
  context.beginPath();
  context.rect(left, top, glyphWidth, glyphHeight);
  context.clip();
  context.strokeStyle = "#fff";
  context.lineWidth = stroke;
  context.lineCap = "butt";
  context.lineJoin = "miter";
  context.beginPath();
  context.moveTo(left, top);
  context.lineTo(left + glyphWidth, top + glyphHeight);
  context.moveTo(left + glyphWidth, top);
  context.lineTo(left, top + glyphHeight);
  context.stroke();
  context.restore();
}

function drawA(context, left, top) {
  const { glyphWidth, glyphHeight, stroke } = XLAB_LOCKUP;
  context.save();
  context.beginPath();
  context.rect(left, top, glyphWidth, glyphHeight);
  context.clip();
  context.strokeStyle = "#fff";
  context.lineWidth = stroke;
  context.lineCap = "butt";
  context.lineJoin = "miter";
  context.beginPath();
  context.moveTo(left, top + glyphHeight);
  context.lineTo(left + glyphWidth * 0.5, top);
  context.lineTo(left + glyphWidth, top + glyphHeight);
  context.stroke();
  context.fillStyle = "#fff";
  context.fillRect(
    left + stroke * 0.5,
    top + glyphHeight * 0.5 - stroke * 0.5,
    glyphWidth - stroke,
    stroke,
  );
  context.restore();
}

function drawB(context, left, top) {
  const { glyphWidth, glyphHeight, stroke } = XLAB_LOCKUP;
  const counterTop = top + (glyphHeight - stroke) * 0.5;
  const counterBottom = counterTop + stroke;
  context.fillStyle = "#fff";
  context.fillRect(left, top, stroke, glyphHeight);
  context.fillRect(left + stroke, top, glyphWidth - stroke, stroke);
  context.fillRect(
    left + glyphWidth - stroke,
    top + stroke,
    stroke,
    counterTop - top - stroke,
  );
  context.fillRect(left + stroke, counterTop, glyphWidth - stroke, stroke);
  context.fillRect(
    left + glyphWidth - stroke,
    counterBottom,
    stroke,
    top + glyphHeight - stroke - counterBottom,
  );
  context.fillRect(
    left + stroke,
    top + glyphHeight - stroke,
    glyphWidth - stroke,
    stroke,
  );
}

export function drawXlabLetters(context, xLeft, aLeft, bLeft, top) {
  drawX(context, xLeft, top);
  drawA(context, aLeft, top);
  drawB(context, bLeft, top);
}
