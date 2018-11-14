import React, {Component} from 'react';
import { View, StyleSheet } from "react-native";
import { Appbar, Searchbar, DefaultTheme } from 'react-native-paper';
import { Navigation } from 'react-native-navigation';


export class AppBar extends Component {
    constructor(props) {
      super(props)
      this.state = {
        showSearch: false,
        searchText: undefined
      };
      this._onMore = this._onMore.bind(this);
      this._onSearch = this._onSearch.bind(this);
      this._onIconPress = this._onIconPress.bind(this);
      this._onChangeText = this._onChangeText.bind(this);
    }

    _onIconPress() {
      this._onSearch();
    }

    _onChangeText(text) {
      this.setState({searchText: text})
      this.props.onSearchTextChange ? this.props.onSearchTextChange(text): false;
    }

    _onSearch() {
      this.props.onSearch? this.props.onSearch(this.state.searchText): false;
      this.setState({showSearch: !this.state.showSearch, searchText: undefined})
    }

    _onMore() {
      Navigation.mergeOptions("SideMenu", {
        sideMenu: {
            left: {
                visible: true
            }
          }
      })
    }

  render() {
    const searchTheme = {...DefaultTheme, colors: {...DefaultTheme.colors, text: '#fff', placeholder: "rgba(255,255,255,0.7)",backgroundColor: DefaultTheme.colors.primary}};
    console.log(searchTheme)
    return (
      <View>
        <Appbar.Header >
          <Appbar.Content
            title={this.props.title || 'elRepo.io'}
            subtitle={this.props.subtitle}
          >
          </Appbar.Content>
          {this.props.searchIcon?<Appbar.Action icon="search" onPress={this._onSearch} />: false }
          <Appbar.Action icon="more-vert" onPress={this._onMore} />
        </Appbar.Header>
        { this.state.showSearch === true
          ? <Searchbar
            ref={searchComponent => searchComponent !== null ? searchComponent.focus(): false } 
            style={style.search}
            theme={searchTheme}
            onIconPress={this._onIconPress}
            placeholder={"Buscar..."} 
            value={this.state.searchText}
            onChangeText={this.props._onChangeText}/>
          : false }
      </View>
    );
  }
}

const style = StyleSheet.create({
  search: {
    borderRadius: 0,
    backgroundColor: DefaultTheme.colors.primary
  }
})