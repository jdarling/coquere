var React = require('react/addons');

var Views = {};

var RecipeNameRow = Views.RecipeNameRow = React.createClass({
  render: function(){
    return (
        <div className="recipe-name"><a href={'#recipes/'+this.props.recipe._id}>{this.props.recipe.name}</a></div>
    );
  }
});

var RecipeDescriptionRow = Views.RecipeDescriptionRow = React.createClass({
  render: function(){
    return (
      <div className="recipe-description">{this.props.recipe.description}</div>
    );
  }
});

var RecipeTable = Views.RecipeTable = React.createClass({
  render: function() {
    var rows = [];
    var reIsMatch = new RegExp(this.props.filterText, 'i');
    this.props.recipes.forEach(function(recipe) {
      if(this.props.titleOnly && !reIsMatch.exec(recipe.name)){
        return;
      }
      if((!reIsMatch.exec(recipe.name)) && (recipe.description && !reIsMatch.exec(recipe.description))){
        return;
      }
      rows.push(<RecipeNameRow recipe={recipe} key={recipe._id+'-name'} />);
      rows.push(<RecipeDescriptionRow recipe={recipe} key={recipe._id+'-description'} />);
    }.bind(this));
    return (
      <div className={this.props.className||'recipe-table'}>
        {rows}
      </div>
    );
  }
});

var SearchBar = Views.SearchBar = React.createClass({
  handleChange: function(){
    this.props.onUserInput(
      this.refs.filterTextInput.getDOMNode().value,
      this.refs.titleOnly.getDOMNode().checked
    );
  },
  render: function(){
    var style = {width: '100%'};
    return (
      <form className={this.props.className||'search-bar'}>
        <input
          type="text"
          placeholder="Search..."
          value={this.props.filterText}
          ref="filterTextInput"
          style={style}
          onChange={this.handleChange}
        />
        <label>
          <input
            type="checkbox"
            value={this.props.titleOnly}
            ref="titleOnly"
            onChange={this.handleChange}
          />
          Search title only
        </label>
      </form>
    );
  }
});

var FilterableRecipeTable = Views.FilterableRecipeTable = React.createClass({
  getInitialState: function(){
    return {
      filterText: '',
      titleOnly: false
    };
  },
  handleUserInput: function(filterText, titleOnly){
    this.setState({
      filterText: filterText,
      titleOnly: titleOnly
    });
  },
  render: function(){
    return (
      <div className={this.props.className||'filterable-recipe-table'}>
        <SearchBar
          filterText={this.state.filterText}
          titleOnly={this.state.titleOnly}
          onUserInput={this.handleUserInput}
        />
        <RecipeTable
          recipes={this.props.data.items}
          filterText={this.state.filterText}
          titleOnly={this.state.titleOnly}
        />
      </div>
    );
  }
});


module.exports = Views;
