var ing = require('ingredientparser');
var inflect = require('i');

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
      var key = parts.shift()||'';
      key = key.substr(0, 1).toLowerCase()+key.substr(1).replace(/[_\-\W]([a-z])/gi, function(match, char){
        return char.toUpperCase();
      });
      props[key]=parts.join(':');
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
        return ' ';
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
  var lines = (block||'').split(/(\n|\r\n|\n\r)/);
  recipe.ingredients = recipe.ingredients || [];
  return parseIngredientList(recipe, lines);
};

var parseDirections = function(recipe, block){
  var dirs = getDescription((block||'').split(/(\n|\r\n|\n\r)/));
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

var ingredientToString = function(ing){
  var str = '';
  str = str+(ing.amount||'')+' ';
  str = (str+(ing.unit||'')).trim()+' ';
  if(ing.byWeight){
    str += 'by weight ';
  }
  str = str+ing.name+' ';
  if(ing.prep){
    str += '('+ing.prep+') ';
  }
  if(ing.optional){
    str += '(optional) ';
  }
  return str.trim();
};

var stringifyRecipe = function(recipe){
  if((!recipe)||(Object.keys(recipe).length===0)){
    return '';
  }
  var res = recipe.name+'\n\n';
  if(recipe.properties){
    Object.keys(recipe.properties).forEach(function(key){
      res = res + key + ': ' + recipe.properties[key] + '\n';
    });
    res = res + '\n';
  }
  if(recipe.description){
    res = res + recipe.description.split('\n').join('\n\n')+'\n\n';
  }
  if(recipe.ingredients){
    res = res + 'ingredients\n\n';
    recipe.ingredients.forEach(function(ing){
      res = res + ingredientToString(ing) + '\n';
    });
    res = res + '\n';
  }
  if(recipe.steps){
    res = res + 'directions\n\n';
    recipe.steps.forEach(function(step){
      res = res + step.directions + '\n\n';
    });
  }
  return res;
};

module.exports = {
  parseRecipe: parseRecipe,
  stringifyRecipe: stringifyRecipe
};
