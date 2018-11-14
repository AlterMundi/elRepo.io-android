import React, {Component} from 'react';
import { Appbar } from 'react-native-paper';
import { Navigation } from 'react-native-navigation';


export class AppBar extends Component {

    _goBack = () => console.log('Went back');

    _onSearch = () => console.log('Searching');

    _onMore = () => Navigation.mergeOptions("SideMenu", {
        sideMenu: {
            left: {
                visible: true
            }
        }
    });   ;

  render() {
    return (
      <Appbar.Header >
        <Appbar.Content
          title={this.props.title || 'elRepo.io'}
          subtitle={this.props.subtitle}
        />
        <Appbar.Action icon="more-vert" onPress={this._onMore} />
      </Appbar.Header>
    );
  }
}