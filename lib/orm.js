var ORM = require('prodio-orm');

var Substitution = new ORM('substitution', {
  name: ORM.String(),
  amount: ORM.String(),
  unit: ORM.String(),
  prep: ORM.Optional(ORM.String()),
}, true);

var Ingredient = new ORM('ingredient', {
  section: ORM.Optional(ORM.String()),
  name: ORM.String(),
  amount: ORM.String(),
  unit: ORM.Optional(ORM.String()),
  prep: ORM.Optional(ORM.String()),
  optional: ORM.Default(false, ORM.Boolean()),
  substitutions: ORM.Optional(ORM.Array(Substitution))
}, true);

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
  steps: ORM.Array(RecipeStep),
  source: ORM.Optional(ORM.String()),
  properties: ORM.Optional(ORM.Object({}, true))
});

var User = new ORM('user', {
  username: ORM.String(),
  password: ORM.String(),
  email: ORM.String()
});

var Login = new ORM('login', {
  username: ORM.String(),
  password: ORM.String(),
  destination: ORM.Optional(ORM.String())
});

module.exports = {
  Recipe: Recipe,
  Ingredient: Ingredient,
  Substitution: Substitution,
  RecipeStep: RecipeStep,
  User: User,
  Login: Login,
};
