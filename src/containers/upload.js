import React, { Component } from "react";
import { View , ScrollView, StyleSheet, ImageBackground } from "react-native";
import { connect } from "react-redux"
import { TextInput, Button , Text} from 'react-native-paper';
import { AppBar  } from "../components/appbar";
import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"
import { fileUploader } from '../helpers/fileUploader'
import { Navigation } from "react-native-navigation";
import { ThemeWrapper } from '../components/wrapper'
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
class UploadContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: undefined,
            description: undefined,
            image: undefined,
            files: [],
            uploading: false,
        }
        this.publish = this.publish.bind(this);
        this.selectFiles = this.selectFiles.bind(this);
        this.imageUpload = this.imageUpload.bind(this);
    }

  static options (passProps) {
      return {
          topBar: {
              visible: false,
              height: 0
          }
      }
    }
  
    imageUpload(){
        ImagePicker.clean().then(() =>
            ImagePicker.openPicker({
                width: 400,
                height: 230,
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

    publish() {
        this.props.publish({
            title: this.state.title || '',
            description: this.state.description || '',
            image: this.state.image || '',
            files: this.state.files || []
        })

    //Fake loading status
        this.setState({uploading: !this.state.uploading})
        setTimeout(()=>{
            this.setState({uploading: !this.state.uploading});
            Navigation.push('App', {
                component: { name: 'elRepoIO.home' },
              })
        }, 3000)
    }

    selectFiles() {
        fileUploader.openDialog()
            .then((selected) => fileUploader.shareFiles({files: selected.files, destination: this.props.sharedFolder}))
            .then(filesInfo => this.setState({files: [...filesInfo, ...this.state.files]}))
    }

  render() {
    return (
          <ThemeWrapper  style={styles.container}>
              <AppBar title={'elRepo.io'} subtitle={'Publicar contenido'} />
                {this.state.uploading
                ? (
                    <View style={styles.loading}>
                        <Text>Publicando contenido</Text>
                        <Button icon="" loading></Button>
                    </View>
                )
                 : (<ScrollView style={styles.scrollView}>
                    <View style={styles.content}>
                        <TextInput
                                onChangeText={(title)=>this.setState({title})}
                                value={this.state.title}
                                style={styles.input}
                                label='Título'
                            />
                        <TextInput
                            onChangeText={(description)=>this.setState({description})}
                            value={this.state.description}
                            style={styles.input}
                            label='Descripción'
                            numberOfLines={4}
                        />
                        
                        {this.state.image? (
                            <View>
                                <Text>Imágen destacada</Text>
                                <ImageBackground source={{uri:this.state.image}} style={{marginBottom: 15, height:115, resizeMode: 'contain'}} />
                            </View>
                        ): false}

                        <Button 
                            style={styles.input}
                            icon="file-upload"
                            mode="contained"
                            dark={true}
                            onPress={this.imageUpload}>
                                Seleccionar imagen destacada
                        </Button>
                        
                        <Button 
                            style={styles.input}
                            icon="file-upload"
                            mode="contained"
                            dark={true}
                            onPress={() => console.log('Pressed')}>
                                Agregar archivos
                        </Button>

                        <Button 
                            mode={"text"}
                            icon="share"
                            onPress={this.publish}>
                                Publicar
                        </Button>
                    </View>
                 </ScrollView>) }
            </ThemeWrapper>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    scrollView: {
        flex: 1,
        flexDirection: 'column',
    },
    content: {
      padding: 16,
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    input: {
      marginBottom: 16,
    },
  });
  
export const Upload = connect(
    state => ({
        sharedFolder: state.Api.folder.filename,
    }),
    dispatch => ({
        publish: bindActionCreators(apiActions.createPost, dispatch)
    })
  
)(UploadContainer)