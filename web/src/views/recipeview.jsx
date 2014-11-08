var React = require('react/addons');
var loader = require('../lib/loader');
var Support = require('../lib/support');
var val = Support.val;
var isNumeric = Support.isNumeric;
var isFraction = Support.isFraction;
var RecipeLib = require('../js/lib/recipeParser');
var parseRecipe = RecipeLib.parseRecipe;
var stringifyRecipe = RecipeLib.stringifyRecipe;
var alertify = require('../vendor/alertify/alertify').alertify;

var Views = {};

var CrossoutCheckbox = Views.CrossoutCheckbox = React.createClass({
  getInitialState: function () {
    return {
        complete: (!!this.props.complete) || false
      };
  },
  handleChange: function(){
    this.setState({
      complete: !this.state.complete
    });
  },
  render: function(){
    var labelStyle={
      textDecoration: this.state.complete?'line-through':''
    };
    return (
      <label style={labelStyle}>
        <input
          type="checkbox"
          defaultChecked={this.state.complete}
          ref="complete"
          onChange={this.handleChange} />
        {this.props.text}
      </label>
    );
  }
});

var IngredientsListing = Views.IngredientsListing = React.createClass({
  render: function(){
    var ingredients = [];
    var textPart = function(part){
      if(part){
        return part + ' ';
      }
      return '';
    };
    (this.props.ingredients||[]).forEach(function(ingredient, index){
      var text = textPart(ingredient.amount)+
        textPart(ingredient.unit)+
        textPart(ingredient.name)+
        textPart(ingredient.prep);
      ingredients.push(<li className="recipe-ingredient" key={index}>
          <CrossoutCheckbox
            text={text}
            index={index}
            onItemCompleteChange={this.handleItemCompleteChange} />
        </li>);
    }.bind(this));
    return ingredients.length?(
      <div>
        <h2>Ingredients</h2>
        <ul className="recipe-ingredients-list">
          {ingredients}
        </ul>
      </div>
    ):<span />;
  }
});

var DirectionsListing = Views.DirectionsListing = React.createClass({
  render: function(){
    var steps = [];
    (this.props.steps||[]).forEach(function(step, index){
      steps.push(
        <p key={index}>
          <CrossoutCheckbox text={step.directions} index={index} />
        </p>
      );
    }.bind(this));
    return steps.length?(
      <div>
        <h2>Directions</h2>
        {steps}
      </div>
    ):<span />;
  }
});

var RecipeEditButton = Views.RecipeEditButton = React.createClass({
  getInitialState: function () {
    return {
        id: this.props.recipeId
      };
  },
  editRecipe: function(){
    window.location.href = '#recipes/edit/'+this.state.id;
  },
  render: function(){
    return (
      <button onClick={this.editRecipe}>Edit</button>
    );
  }
});

var RecipeView = Views.RecipeView = React.createClass({
  getInitialState: function () {
    return {
        recipe: this.props.recipe||this.props.data||{}
      };
  },
  render: function(){
    var description = [];
    var editButton = this.props.noEdit?'':<RecipeEditButton recipeId={this.state.recipe._id}/>;
    (this.props.data.description||'').split('\n').forEach(function(line, index){
      description.push(<p key={index}>{line}</p>);
    });
    return (
      <div>
        <h1>{this.props.data.name}{editButton}</h1>
        {description}
        <IngredientsListing
          ingredients={this.props.data.ingredients}
        />
        <DirectionsListing
          steps={this.props.data.steps}
        />
      </div>
    );
  }
});

var RecipeEditor = Views.RecipeEditor = React.createClass({
  getInitialState: function () {
    var sizingEditor = document.createElement('textarea');
    document.body.appendChild(sizingEditor);
    return {
        id: (this.props.recipe||this.props.data||{})._id,
        recipe: this.props.recipe||this.props.data||{},
        sizingEditor: sizingEditor
      };
  },
  resizeEditor: function(){
    var editor = this.refs.recipeSource.getDOMNode();
    var t = this.state.sizingEditor;
    t.style.width = editor.style.width;
    t.value = editor.value;
    setTimeout(function(){
      t.style.width = (editor.clientWidth-10)+'px';
      var offset= !window.opera ? (t.offsetHeight - t.clientHeight) : (t.offsetHeight + parseInt(window.getComputedStyle(t, null).getPropertyValue('border-top-width')));
      editor.style.height = t.scrollHeight + 'px';
    }, 10);
  },
  recipeUpdate: function(e){
    e.preventDefault();
    var recipe = parseRecipe(val(e.target));
    this.resizeEditor();
    this.setState({
      recipe: recipe
    });
  },
  refreshPreview: function(e){
    e.preventDefault();
    var recipe = parseRecipe(val(this.refs.recipeSource.getDOMNode()));
    this.setState({
      recipe: recipe
    });
  },
  saveRecipe: function(e){
    e.preventDefault();
    var self = this;
    var recipe = this.state.recipe;
    var hasId = this.state.id||isNumeric(this.state.id);
    var uri = hasId?'/api/v1/recipe/'+this.state.id:'/api/v1/recipe';
    loader.post(uri, {data: recipe}, function(err, response){
      if(err){
        if(err.errors){
          return alertify.error('Too little information provided, please complete a basic recipe');
        }
        return alertify.error(err.error||err);
      }
      if(!hasId){
        self.setState({
          recipe: response,
          id: response._id
        });
      }
      return alertify.success(hasId?'Updated':'Created');
    });
  },
  componentDidMount: function(){
    var editor = this.refs.recipeSource.getDOMNode();
    var sizingEditor = this.state.sizingEditor;
    sizingEditor.style = editor.style;
    sizingEditor.style.height = 'auto';
    sizingEditor.style.position = 'absolute';
    sizingEditor.style.left = '-9999px';
    sizingEditor.style.top = 0;
    sizingEditor.style.height = 'auto';
    this.resizeEditor();
  },
  render: function(){
    var recipeSource = this.state.recipe?stringifyRecipe(this.state.recipe):'';
    return (
      <form className="recipe-editor">
        <fieldset className="flex toggle">
          <legend><label htmlFor="show_sample" title="Click to open/close">Sample</label></legend>
          <input id="show_sample" type="checkbox" className="offscreen" />
          <div>Recipe Title<br />
Author: Some Person<br />
From: Some Website<br />
<br />
This is where the description of the recipe goes, you can make it as long or short as you want.  The description ends when the word ingredients is seen on its own on one line.<br />
<br />
Ingredients<br />
<br />
1 1/2 cups white sugar<br />
1/2 cup cocoa powder<br />
1/4 cup rice flour<br />
<br />
Directions<br />
<br />
Here is where your directions go.  They start when the word directions is seen on a line of its own.<br />
<br />
Each block is divided by a blank line.</div>
        </fieldset>
        <div className="flex">
          <fieldset className="flex-60">
            <legend>Recipe</legend>
            <textarea ref="recipeSource" onChange={this.recipeUpdate} className="width-100 autoheight" defaultValue={recipeSource} placeholder="Enter your recipe here..." />
            <button onClick={this.refreshPreview}>Refresh Preview</button>
            <button onClick={this.saveRecipe}>Save</button>
          </fieldset>
          <fieldset className="flex-40">
            <legend>Preview</legend>
            <RecipeView data={this.state.recipe} noEdit={true} />
          </fieldset>
        </div>
      </form>
    );
  }
});

module.exports = Views;
