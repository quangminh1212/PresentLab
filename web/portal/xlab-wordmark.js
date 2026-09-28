export const XLAB_LOCKUP = Object.freeze({
  xWidth: 3.6,
  aWidth: 3,
  bWidth: 3.1,
  glyphHeight: 3.8,
  stroke: 1,
  textGap: 0.5,
  letterGap: 0.35,
});

function drawX(context, left, top) {
  const { xWidth, glyphHeight, stroke } = XLAB_LOCKUP;
  context.save();
  context.beginPath();
  context.rect(left, top, xWidth, glyphHeight);
  context.clip();
  context.strokeStyle = "#fff";
  context.lineWidth = stroke;
  context.lineCap = "butt";
  context.lineJoin = "miter";
  context.beginPath();
  context.moveTo(left, top);
  context.lineTo(left + xWidth, top + glyphHeight);
  context.moveTo(left + xWidth, top);
  context.lineTo(left, top + glyphHeight);
  context.stroke();
  context.restore();
}

function drawA(context, left, top) {
  const { aWidth, glyphHeight, stroke } = XLAB_LOCKUP;
  context.save();
  context.beginPath();
  context.rect(left, top, aWidth, glyphHeight);
  context.clip();
  context.strokeStyle = "#fff";
  context.lineWidth = stroke;
  context.lineCap = "butt";
  context.lineJoin = "miter";
  context.beginPath();
  context.moveTo(left, top + glyphHeight);
  context.lineTo(left + aWidth * 0.5, top);
  context.lineTo(left + aWidth, top + glyphHeight);
  context.stroke();
  context.fillStyle = "#fff";
  const crossbarWidth = aWidth * 0.58;
  context.fillRect(
    left + (aWidth - crossbarWidth) * 0.5,
    top + glyphHeight * 0.58 - stroke * 0.5,
    crossbarWidth,
    stroke,
  );
  context.restore();
}

function drawB(context, left, top) {
  const { bWidth, glyphHeight, stroke } = XLAB_LOCKUP;
  const edgeWidth = stroke * 0.8;
  const crossbarHeight = stroke * 0.7;
  const upperWidth = bWidth - 0.2;
  const counterHeight = (glyphHeight - stroke * 1.6 - crossbarHeight) * 0.5;
  const upperCounterTop = top + stroke * 0.8;
  const middleTop = upperCounterTop + counterHeight;
  const lowerCounterTop = middleTop + crossbarHeight;
  const bottomTop = top + glyphHeight - stroke * 0.8;

  context.fillStyle = "#fff";
  context.fillRect(left, top, stroke, glyphHeight);
  context.fillRect(left + stroke, top, upperWidth - stroke, stroke * 0.8);
  context.fillRect(
    left + upperWidth - edgeWidth,
    upperCounterTop,
    edgeWidth,
    counterHeight,
  );
  context.fillRect(
    left + stroke,
    middleTop,
    bWidth - stroke,
    crossbarHeight,
  );
  context.fillRect(
    left + bWidth - edgeWidth,
    lowerCounterTop,
    edgeWidth,
    counterHeight,
  );
  context.fillRect(
    left + stroke,
    bottomTop,
    bWidth - stroke,
    stroke * 0.8,
  );
}

export function drawXlabLetters(context, xLeft, aLeft, bLeft, top) {
  drawX(context, xLeft, top);
  drawA(context, aLeft, top);
  drawB(context, bLeft, top);
}
