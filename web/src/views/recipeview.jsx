var React = require('react/addons');
var Support = require('../lib/support');
var val = Support.val;
var isNumeric = Support.isNumeric;
var isFraction = Support.isFraction;
var parseRecipe = require('../js/lib/recipeParser');

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
      'text-decoration': this.state.complete?'line-through':''
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
    (this.props.ingredients||[]).forEach(function(ingredient, index){
      var text = ingredient.amount+' '+
        ingredient.unit+' '+
        ingredient.name+' '+
        (ingredient.prep||'');
      ingredients.push(<li className="recipe-ingredient" key={index}>
          <CrossoutCheckbox
            text={text}
            index={index}
            onItemCompleteChange={this.handleItemCompleteChange} />
        </li>);
    }.bind(this));
    return (
      <ul className="recipe-ingredients-list">
        {ingredients}
      </ul>
    );
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
    return (
      <div>
        {steps}
      </div>
    );
  }
});

var RecipeView = Views.RecipeView = React.createClass({
  render: function(){
    return (
      <div>
        <h1>{this.props.data.name}</h1>
        <p>{this.props.data.description}</p>
        <h2>Ingredients</h2>
        <IngredientsListing
          ingredients={this.props.data.ingredients}
        />
        <h2>Directions</h2>
        <DirectionsListing
          steps={this.props.data.steps}
        />
      </div>
    );
  }
});

var RecipeEditor = Views.RecipeEditor = React.createClass({
  getInitialState: function () {
    return {
        recipe: this.props.recipe||{}
      };
  },
  recipeUpdate: function(e){
    console.log('Parsing recipe');
    var recipe = parseRecipe(val(e.target));
    this.setState({
      recipe: recipe
    });
  },
  render: function(){
    //var recipe = this.props.recipe||{name: "Foo", description: "Something about foo"};
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
            <textarea onChange={this.recipeUpdate} className="width-100 height-500px" />
          </fieldset>
          <fieldset className="flex-40">
            <legend>Preview</legend>
            <RecipeView data={this.state.recipe} />
          </fieldset>
        </div>
      </form>
    );
  }
});

module.exports = Views;
