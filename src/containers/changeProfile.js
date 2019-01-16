import React from "react";
import { connect } from "react-redux"
import { ImageBackground, View } from 'react-native'
import { Button, TextInput } from 'react-native-paper';
import { ThemeWrapper } from '../components/wrapper';
import { Avatar } from "../components/avatar";

import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';

class ChangeProfileComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { name: '', image: ''}
        this.imageUpload = this.imageUpload.bind(this);
    }

    imageUpload(){
        ImagePicker.clean().then(() =>
            ImagePicker.openPicker({
                width: 100,
                height: 100,
                cropping: true,
                includeBase64: true,
                noData: true,
            }).then(image => {
                RNFS.readFile(image.path, 'base64').then(res => { 
                    this.setState({image: `data:${image.mime};base64,${res}`})
                })
            })
         ) .catch(e => console.log('ignore image',e))
    }

    componentWillMount() {
        this.setState({
            name: this.props.channelInfo.mDescription || "",
            image: this.props.channelInfo.mImage.mData !== ""? this.props.channelInfo.mImage.mData: undefined
        })
    }
    render() {
      return (
          <ThemeWrapper>
            <View style={{padding: 10}}>
            <View style={{ alignItems: 'center', margin: 20, height: 100}}>
                {
                    typeof this.state.image === 'undefined'
                        ? <Avatar id={ this.props.channelInfo.mMeta.mGroupId } onlyImage={true} big={true} round={true} style={{width: 100, height: 100}}/>
                        : <ImageBackground style={{borderRadius:  4, width: 100, height: 100}} source={{uri: this.state.image}}/>
                }

            </View>
            <TextInput label={'Nombre'} value={this.state.name} onChangeText={text => this.setState({name: text})}/>
            <Button onPress={()=> this.imageUpload()} mode='contained' dark={true} style={{marginTop: 20}}>Cambiar imagen de perfil</Button>
            <Button mode='contained' dark={true} style={{marginTop: 20}} onPress={()=>this.props.onChange(this.state)}>Guardar cambios</Button>
            </View>
        </ThemeWrapper>
      );
  }
}

export const ChangeProfile = connect(
    state => ({
        
    }),
    dispatch => ({

    })
)(ChangeProfileComponent)