var ORM = require('prodio-orm');

var Substitution = new ORM('substitution', {
  name: ORM.String(),
  amount: ORM.String(),
  unit: ORM.String(),
  prep: ORM.Optional(ORM.String()),
});

var Ingredient = new ORM('ingredient', {
  section: ORM.Optional(ORM.String()),
  name: ORM.String(),
  amount: ORM.Number(),
  unit: ORM.String(),
  prep: ORM.Optional(ORM.String()),
  optional: ORM.Default(false, ORM.Boolean()),
  substitutions: ORM.Optional(ORM.Array(Substitution))
});

var RecipeStep = new ORM('recipeStep', {
  section: ORM.Optional(ORM.String()),
  directions: ORM.String()
});

var Servings = new ORM('servings', {
  count: ORM.Number(),
  size: ORM.Optional(ORM.String())
});

var Recipe = new ORM('recipe', {
  name: ORM.String(),
  tags: ORM.Optional(ORM.Array(ORM.String())),
  servings: ORM.Optional(Servings),
  description: ORM.Optional(ORM.String()),
  ingredients: ORM.Array(Ingredient),
  steps: ORM.Array(RecipeStep)
});

module.exports = {
  Recipe: Recipe,
  Ingredient: Ingredient,
  Substitution: Substitution,
  RecipeStep: RecipeStep
};
