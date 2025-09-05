import React from "react";
import {Sticky} from "react-sticky";

export default class StickyHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isVisible: false
    }
  }

  onStickyChange() {
    this.setState({isVisible: !this.state.isVisible});
  }

  render() {
    const isVisible = this.state.isVisible;
    
    return (
      <Sticky onStickyStateChange={ this.onStickyChange.bind(this) } topOffset={ 200 }
              className={ isVisible ? 'visible' : 'hidden' }>
        {() => (
          <div className="sticky-header"/>
        )}
      </Sticky>
    )
  }
}