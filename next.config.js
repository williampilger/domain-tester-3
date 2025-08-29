/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Para suportar módulos nativos do Node.js
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};

module.exports = nextConfig;
