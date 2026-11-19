# Vitalis

Whole-food recipes, a strict **gluten-free, soy-free and mineral-friendly** collection, healthy eating rules and home workouts with a built-in timer.

Built with **React 19, TypeScript and Vite**. No UI framework: all styling is hand-written CSS with light and dark themes.

## Features

- **Three languages: English, Русский, עברית.** Full right-to-left layout for Hebrew, correct plural forms for Russian, and the choice is remembered. Every recipe, rule, workout and lab note is translated, and a test fails if a key is missing.
- **16 recipes** in two collections. Amounts are exact and calories and macros are calculated from an ingredient catalogue, not typed in by hand.
- **Strict gluten-free collection.** No gluten, no soy, and no foods that can interfere with iodine or iron (raw cruciferous vegetables and millet, high-phytate legumes, nuts, seeds and whole grains, high-oxalate greens, tea, coffee and cocoa). These rules are enforced by a unit test, so a forbidden ingredient cannot slip into that collection.
- **No additives anywhere.** Every ingredient is a plain whole food. A test fails if any recipe uses an ingredient flagged as processed.
- **Calorie and macro calculator.** Mifflin-St Jeor energy needs, activity level, and goals for fat loss, staying in shape or building muscle, with protein, carbs, fat, fibre and water targets.
- **Body analysis.** BMI, body-fat estimate (US Navy tape method, or a BMI-based estimate), lean and fat mass, waist-to-height ratio and a healthy weight range.
- **Weekly menu.** Seven days of breakfast, lunch, dinner and a snack, with portions scaled to your calories and chosen to meet your protein target. Optionally gluten-free only. One tap adds the whole week to the shopping list.
- **Lab results analyzer.** Upload a blood test PDF (English, Russian or Hebrew) or type values by hand. 18 markers (blood count, iron, thyroid, vitamins, blood sugar, cholesterol) are compared with the report's own reference range, or typical adult ranges with unit conversion. The PDF is read in the browser with pdf.js and never uploaded. Scans without a text layer are detected and the manual form is offered instead.
- **Iodine and iron highlights.** Recipes are tagged automatically when they contain iodine sources, or an iron source together with vitamin C.
- **Interactive healthy plate**, eating rules, and an explanation of why each food group is left out of the strict collection.
- **Workouts and interval timer.** Six routines plus a custom work/rest/rounds timer with a progress ring and optional sound.
- **Shopping list** that scales with servings, merges duplicate ingredients and is saved in the browser.
- Light and dark themes, responsive layout, keyboard focus styles, reduced-motion support.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (Vitest)
npm run build      # type-check and production build into dist/
```

## How the diet rules work

`src/data/ingredients.ts` lists every ingredient with nutrition per 100 g and flags such as `gluten`, `soy`, `goitrogen`, `phytate`, `oxalate`, `tannin` and `processed`.
`src/lib/diet.ts` derives everything else (badges, nutrition, strictness) from those flags, and `src/lib/diet.test.ts` asserts that every recipe in the `gluten-free` collection passes the strict list.

To add a recipe, add it to `src/data/recipes.ts` using ingredient ids from the catalogue, add its Russian and Hebrew text in `src/i18n/content.ru.ts` and `content.he.ts`, and run `npm test`.

## Lab analyzer notes

`src/data/markers.ts` lists each marker with names in three languages, unit conversions and default ranges. `src/lib/labs.ts` finds markers line by line, reads the value, unit and the report's own range, and handles right-to-left Hebrew text that PDFs store in visual order. Results are a comparison with reference ranges only, never a diagnosis.

## Project structure

```
src/
  data/        ingredients, recipes, rules, workouts, lab markers
  i18n/        UI dictionaries (en/ru/he), translated content, language provider
  lib/         diet rules, calculator, menu planner, lab parser, PDF reader, timer steps (+ tests)
  hooks/       localStorage, theme, profile, shopping context
  components/  Header, Plate, RecipeCard, IntervalTimer
  pages/       Home, Recipes, RecipeDetail, Rules, Fitness, Calculator, Menu, Labs, Shopping
```

## Deploy to GitHub Pages

The repository includes `.github/workflows/deploy.yml`. In your repository go to **Settings → Pages → Source: GitHub Actions**, then push to `main`. The app uses hash routing and relative asset paths, so it works from any sub-path.

## Disclaimer

General information about food and exercise, not medical advice. Nutrition values and calculator results are estimates, and the lab analyzer only compares numbers with reference ranges. If you have celiac disease, a thyroid condition or iron deficiency, follow your doctor's guidance.

## License

MIT
