// Tailwind CSS v4 moved its PostCSS plugin into a separate package.
// See the official installation guide for details: the new plugin is
// provided by `@tailwindcss/postcss`【867660085509250†L289-L301】.  Using
// the old `tailwindcss` key here will result in a runtime error
// complaining that you're trying to use Tailwind directly as a PostCSS
// plugin.  To fix that, we import `@tailwindcss/postcss` instead.
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
