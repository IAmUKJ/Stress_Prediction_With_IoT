function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr) {
  if (!arr.length) return 0;

  const m = mean(arr);
  const variance =
    arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / arr.length;

  return Math.sqrt(variance);
}

// 30 second rolling mean
function rollingMean(data, windowSize = 15) {
  return data.map((_, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const slice = data.slice(start, i + 1);
    return mean(slice);
  });
}

// gradual increase over 5+ minutes
function detectBuildUp(data, points = 150) {
  if (data.length < points) return false;

  const first = data[data.length - points];
  const last = data[data.length - 1];

  return last > first + 15;
}

// spike > 2 std from recent mean
function detectSpikes(data) {
  const spikes = [];

  for (let i = 10; i < data.length; i++) {
    const recent = data.slice(i - 10, i);
    const m = mean(recent);
    const s = std(recent);

    if (data[i] > m + 2 * s) {
      spikes.push(i);
    }
  }

  return spikes;
}

// recovery after activity drops
function recoveryTime(stress, activity) {
  let endIndex = -1;

  for (let i = activity.length - 2; i >= 0; i--) {
    if (activity[i] > 0.2 && activity[i + 1] <= 0.2) {
      endIndex = i + 1;
      break;
    }
  }

  if (endIndex === -1) return null;

  const baseline = mean(
    stress.slice(Math.max(0, endIndex - 10), endIndex)
  );

  for (let j = endIndex; j < stress.length; j++) {
    if (stress[j] <= baseline) {
      return (j - endIndex) * 2;
    }
  }

  return null;
}

module.exports = {
  rollingMean,
  detectBuildUp,
  detectSpikes,
  recoveryTime,
};