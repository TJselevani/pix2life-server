const formatBytes = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const formatMemoryUsage = (memoryUsage) => {
  return `Memory Usage:
      - RSS: ${formatBytes(memoryUsage.rss)}
      - Heap Total: ${formatBytes(memoryUsage.heapTotal)}
      - Heap Used: ${formatBytes(memoryUsage.heapUsed)}
      - External: ${formatBytes(memoryUsage.external)}
      - Array Buffers: ${formatBytes(memoryUsage.arrayBuffers)}`;
};

module.exports = { formatMemoryUsage };
