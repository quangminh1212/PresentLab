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
  const bowlStroke = stroke * 0.75;
  const stemX = left + stroke * 0.5;
  const bowlX = left + stroke * 1.1;
  const upperRightX = left + bWidth - bowlStroke * 0.5 - stroke * 0.18;
  const lowerRightX = left + bWidth - bowlStroke * 0.5;
  const topY = top + bowlStroke * 0.5;
  const middleY = top + glyphHeight * 0.5;
  const bottomY = top + glyphHeight - bowlStroke * 0.5;

  context.save();
  context.strokeStyle = "#fff";
  context.lineWidth = stroke;
  context.lineCap = "butt";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(stemX, bottomY);
  context.lineTo(stemX, topY);
  context.stroke();

  context.lineWidth = bowlStroke;
  context.beginPath();
  context.moveTo(stemX, topY);
  context.lineTo(bowlX, topY);
  context.bezierCurveTo(
    upperRightX,
    topY,
    upperRightX,
    middleY,
    bowlX,
    middleY,
  );
  context.lineTo(stemX, middleY);
  context.stroke();

  context.beginPath();
  context.moveTo(stemX, middleY);
  context.lineTo(bowlX, middleY);
  context.bezierCurveTo(
    lowerRightX,
    middleY,
    lowerRightX,
    bottomY,
    bowlX,
    bottomY,
  );
  context.lineTo(stemX, bottomY);
  context.stroke();
  context.restore();
}

export function drawXlabLetters(context, xLeft, aLeft, bLeft, top) {
  drawX(context, xLeft, top);
  drawA(context, aLeft, top);
  drawB(context, bLeft, top);
}
