const fs = require("fs");
const path = require("path");

function safeMean(arr) {
  if (!arr.length) return NaN;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function safeStd(arr) {
  if (!arr.length) return 0;
  const mean = safeMean(arr);
  const variance = arr.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

function safeSlope(arr) {
  if (arr.length < 2) return 0;
  const n = arr.length;
  const xMean = (n - 1) / 2;
  const yMean = safeMean(arr);

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (arr[i] - yMean);
    den += Math.pow(i - xMean, 2);
  }
  return den === 0 ? 0 : num / den;
}

function buildFeaturesFromLiveBuffer(bufferRows) {
  const hr = bufferRows.map(r => Number(r.heartRate ?? 0));
  const hrv = bufferRows.map(r => Number(r.hrv ?? 0));
  const ax = bufferRows.map(r => Number(r.accelX ?? 0));
  const ay = bufferRows.map(r => Number(r.accelY ?? 0));
  const act = bufferRows.map(r => Number(r.activity ?? 0));
  const spo2 = bufferRows.map(r => Number(r.spo2 ?? 97));

  return [
    safeMean(hr),
    safeStd(hr),
    safeSlope(hr),

    safeMean(hrv),

    safeMean(ax),
    safeStd(ax),

    safeMean(ay),
    safeStd(ay),

    safeMean(act),
    safeStd(act),
    safeSlope(act),

    safeMean(spo2),
  ];
}

module.exports = { buildFeaturesFromLiveBuffer };