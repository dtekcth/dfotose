import { observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const TagSearchBar = observer(() => {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');

  function onSearch(event) {
    event.preventDefault();

    navigate(`/image/search/${searchInput}`);
  }

  return (
    <form onSubmit={onSearch} className="tag-search-bar">
      <input
        type="text"
        placeholder="sök efter taggar"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <button type="submit">Sök</button>
    </form>
  );
});

export default TagSearchBar;
