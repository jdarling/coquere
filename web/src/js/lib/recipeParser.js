var ing = require('ingredientparser');

var getLine = function(lines){
  var line = (lines.shift()||'').trim();
  if((!line)&&lines.length){
    return getLine(lines);
  }
  return line||false;
};

var getProperties = function(lines, properties){
  var props = properties||{};
  var line = getLine(lines);
  if(line){
    var parts = line.split(':');
    if(parts.length>1){
      props[parts.shift()]=parts.join(':');
      return getProperties(lines, props);
    }
    lines.unshift(line);
  }
  return props;
};

var getDescription = function(lines, description){
  var desc = description||'';
  var line = lines.shift();
  var setDescription = function(){
    return desc.replace(/\n+/g, function(fullMatch){
      if(fullMatch.length===1){
        return '';
      }
      return '\n';
    }).trim();
  };
  if((!line)&&lines.length){
    desc = desc+'\n';
    line = getLine(lines);
    if(line){
      lines.unshift(line);
      return getDescription(lines, desc);
    }
    return setDescription();
  }
  if((!line)&&(!lines.length)){
    return setDescription();
  }
  return getDescription(lines, desc + line);
};

var parseHeader = function(source){
  var lines = source.split(/(\n|\r\n|\n\r)/);
  var result = {};
  result.name = getLine(lines);
  result.properties = getProperties(lines, {});
  result.description = getDescription(lines);
  return result;
};

var parseIngredientList = function(recipe, lines){
  var line = getLine(lines);
  if(line===false){
    return recipe;
  }
  if(line){
    recipe.ingredients.push(ing.parse(line));
  }
  return parseIngredientList(recipe, lines);
};

var parseIngredients = function(recipe, block){
  var lines = block.split(/(\n|\r\n|\n\r)/);
  recipe.ingredients = recipe.ingredients || [];
  return parseIngredientList(recipe, lines);
};

var parseDirections = function(recipe, block){
  var dirs = getDescription(block.split(/(\n|\r\n|\n\r)/));
  dirs = dirs.split('\n');
  recipe.steps = recipe.steps || [];
  dirs.forEach(function(dir){
    recipe.steps.push({directions: dir});
  });
  return recipe;
};

var parseSections = function(recipe, parts){
  var section = getLine(parts);
  if(section){
    section = section.toLowerCase();
    if(section === 'ingredient' || section === 'ingredients'){
      return parseSections(parseIngredients(recipe, getLine(parts)), parts);
    }
    if(section === 'directions'){
      return parseSections(parseDirections(recipe, getLine(parts)), parts);
    }
  }
  return recipe;
};

var parseRecipe = function(source){
  var parts = source.split(/^(ingredient|ingredients|directions)$/mi);
  var recipe = parseHeader(parts.shift());
  parseSections(recipe, parts);
  return recipe;
};

module.exports = parseRecipe;
