import React from 'react';
import { View, StyleSheet, Text, ImageBackground } from 'react-native';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { actions } from '../redux/api/actions';
import Identicon from 'identicon.js'

export const getBase64Image = (text,size) => {
    return 'data:image/png;base64,' + new Identicon(text, size || 50).toString()
}


const first = (data=[],def) => data.reduce((p,a)=> a, def)

class AvatarItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {init: false}
    }
    componentWillReceiveProps(newProps) {
        if( this.state.init === false && typeof newProps.channel(this.props.id).mDescription === 'undefined') {
            this.setState({init: true})
            this.props.getChannelExtraData(this.props.id)
        }
    }
    render() {
        const channel = this.props.channel(this.props.id);
        return (
            <View style={{display:'flex', flex:1, flexDirection:"row"}}>
                <View style={styles.avatar}>
                    {typeof channel.mImage !== "undefined" && typeof channel.mImage.mData !== ""
                        ? <ImageBackground source={{uri: channel.mImage.mData}}/>
                        : <ImageBackground  style={{width: 50, height: 50}} source={{uri: getBase64Image(this.props.id)}} />
                    }
                </View>
                <View style={{marginLeft: 10, marginTop:3}}>
                    {typeof channel.mDescription !== 'undefined' && typeof channel.mDescription !== ""
                        ? <Text style={styles.name}>{channel.mDescription}</Text>
                        :  <Text style={styles.name}>{this.props.channelName(this.props.id)}</Text>
                    }
                    {this.props.children}
                </View>
            </View>
        )
    }
}

export const Avatar = connect(
    state => ({
        channel: (id) => first(state.Api.channelsInfo.filter(x => x.mGroupId === id),{}),
        channelName: (id) => first(state.Api.channels.filter(x => x.mGroupId === id),{}).mGroupName
    }),
    dispatch => ({
        getChannelExtraData: bindActionCreators(actions.loadExtraData, dispatch)
    }))(AvatarItem)

const styles = StyleSheet.create({
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 5,
        backgroundColor: "#ccc",
        marginBottom: 5
      },
      name: {
          fontWeight: 'bold'
      }
  });
  