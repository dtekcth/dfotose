import React from 'react';
import { observer } from 'mobx-react';

@observer
class TagSearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = { searchInput: '' };
  }

  onSearch(event) {
    event.preventDefault();

    this.props.history.push(`/image/search/${this.state.searchInput}`);
  }

  onSearchInputChange(event) {
    this.setState({ searchInput: event.target.value });
  }

  render() {
    return (
      <form onSubmit={this.onSearch.bind(this)} className="tag-search-bar">
        <input
          type="text"
          placeholder="sök efter taggar"
          value={this.state.searchInput}
          onChange={this.onSearchInputChange.bind(this)}
        />
        <button type="submit">Sök</button>
      </form>
    );
  }
}

export default TagSearchBar;
