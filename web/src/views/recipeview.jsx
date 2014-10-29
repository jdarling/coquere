var React = require('react/addons');

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
    this.props.ingredients.forEach(function(ingredient, index){
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
    this.props.steps.forEach(function(step, index){
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
    )
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
    )
  }
});

var RecipeEditor = Views.RecipeEditor = React.createClass({
  render: function(){
    return (
      <form className="recipe-editor">
        <fieldset>
          <legend>General</legend>
          <ol>
            <li><label>Name:<span className="flex"><input type="text" /></span></label></li>
            <li><label>Description:<span className="flex"><textarea /></span></label></li>
          </ol>
        </fieldset>
        <fieldset>
          <legend>Ingredients</legend>
          <ol>
            <li className="flexButton"><input type="text" /><button>-</button></li>
            <li><button>+ Add Ingredient</button></li>
          </ol>
        </fieldset>
        <fieldset>
          <legend>Directions</legend>
          <ol>
            <li className="flexButton"><input type="text" /><button>-</button></li>
            <li><button>+ Add Step</button></li>
          </ol>
        </fieldset>
        <button className="large">Add Recipe</button>
      </form>
    )
  }
});

module.exports = Views;
