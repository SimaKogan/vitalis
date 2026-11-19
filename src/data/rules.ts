export interface PlateSegment {
  key: 'veg' | 'protein' | 'carbs'
  label: string
  share: string
  emoji: string
  title: string
  text: string
  examples: string
}

/** The "healthy plate" model: half vegetables, a quarter protein, a quarter whole-food carbohydrate. */
export const PLATE: PlateSegment[] = [
  {
    key: 'veg',
    label: 'Vegetables and fruit',
    share: 'Half the plate',
    emoji: '🥕',
    title: 'Fill half the plate with vegetables',
    text: 'Colour is a good guide: the more different colours, the wider the range of vitamins, minerals and fibre. Cook some, eat some fresh.',
    examples: 'tomato, pepper, zucchini, pumpkin, carrot, cucumber, lettuce',
  },
  {
    key: 'protein',
    label: 'Protein',
    share: 'A quarter',
    emoji: '🐟',
    title: 'A palm-sized portion of protein each meal',
    text: 'Protein keeps you full and helps muscles recover after training. Choose fish, eggs, poultry or lean meat, or legumes if you tolerate them.',
    examples: 'eggs, cod, salmon, chicken, turkey, lean beef, lentils',
  },
  {
    key: 'carbs',
    label: 'Smart carbohydrates',
    share: 'A quarter',
    emoji: '🍠',
    title: 'Slow carbohydrates for steady energy',
    text: 'Choose starches in their whole form: they come with fibre and no additives. Eat more of them on training days.',
    examples: 'potato, sweet potato, rice, quinoa, oats, bulgur',
  },
]

export interface Rule {
  id: string
  title: string
  text: string
}

export const RULES: Rule[] = [
  {
    id: 'whole-food',
    title: 'Buy food, not formulas',
    text: 'If the ingredient list is longer than five items or you cannot picture them growing or grazing, put it back. Every recipe here uses plain ingredients only: no preservatives, colourings, flavour enhancers or ready-made sauces.',
  },
  {
    id: 'plate',
    title: 'Build the plate first, count calories second',
    text: 'Half vegetables, a quarter protein, a quarter slow carbohydrate, plus a thumb of healthy fat such as olive oil or avocado. Most people do not need to weigh food if the plate looks like this.',
  },
  {
    id: 'protein',
    title: 'Protein at every meal',
    text: 'Spreading protein over the day works better for fullness and muscle repair than one big portion in the evening. Aim for a palm-sized portion each time.',
  },
  {
    id: 'sugar',
    title: 'Sweeten with fruit',
    text: 'Whole fruit comes with fibre and water, so it fills you up. Keep honey for a spoonful, not a habit, and skip sugary drinks entirely.',
  },
  {
    id: 'water',
    title: 'Drink water first',
    text: 'Keep a bottle in sight and drink a glass with each meal and one on waking. Pale-yellow urine is a simple check.',
  },
  {
    id: 'slow',
    title: 'Eat slowly, sitting down',
    text: 'It takes about 20 minutes for fullness signals to reach the brain. Put the phone down and the pace drops by itself.',
  },
  {
    id: 'sleep',
    title: 'Protect your sleep',
    text: 'Short sleep raises hunger and cravings the next day, and slows recovery from exercise. Seven to nine hours is the target for most adults.',
  },
  {
    id: 'move',
    title: 'Move every day, lift twice a week',
    text: 'A daily brisk walk, plus two short strength sessions a week, does more for health than occasional heroic workouts. See the Fitness section.',
  },
]

export interface MineralNote {
  id: string
  heading: string
  text: string
}

/** Practical notes behind the strict gluten-free, mineral-friendly collection. */
export const MINERAL_NOTES: MineralNote[] = [
  {
    id: 'soy',
    heading: 'Soy',
    text: 'Soy contains compounds that can interfere with how the thyroid uses iodine, and it is high in phytates that bind iron. The strict collection has no soy, tofu, soy sauce or soy lecithin.',
  },
  {
    id: 'goitrogens',
    heading: 'Cabbage family and millet',
    text: 'Broccoli, cabbage, kale, cauliflower, radish and millet contain goitrogens, which can reduce iodine use when eaten in large amounts, mostly raw. Cooking reduces them, but the strict collection leaves them out to stay on the safe side.',
  },
  {
    id: 'tannins',
    heading: 'Tea, coffee and cocoa',
    text: 'Tannins and polyphenols can cut iron absorption sharply when taken with a meal. Have them an hour or two before or after eating instead.',
  },
  {
    id: 'phytates',
    heading: 'Legumes, nuts, seeds and whole grains',
    text: 'Phytates bind iron and zinc. Soaking, sprouting and long cooking reduce them, which is why these foods appear in the main healthy collection but not in the strict one.',
  },
  {
    id: 'oxalates',
    heading: 'Spinach, beet and chard',
    text: 'High in oxalates, which bind iron and calcium. They are fine for most people but are kept out of the strict collection.',
  },
  {
    id: 'helpers',
    heading: 'What helps instead',
    text: 'Eggs, cod, shrimp and other seafood supply iodine. Beef, turkey, chicken thigh and shrimp supply easily absorbed iron. Vitamin C from pepper, tomato, lemon, kiwi and strawberries helps you absorb it.',
  },
]
