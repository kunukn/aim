module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
  ],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.js'],
        root: ['./src'],
        alias: {
          '~': '.',
          src: './src',
        },
      },
    ],
  ],
};
