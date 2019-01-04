import React, { Component } from 'react';
import { Title, Card, Button } from 'react-native-paper';
import { StyleSheet, View  } from 'react-native';
import { Navigation } from 'react-native-navigation';
import ParsedText from 'react-native-parsed-text';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FileList }  from '../components/fileItem'
import apiActions from '../redux/api/actions'


const fixTh = (base) => base
  .replace('dataimage','data:image')
  .replace('base64',';base64,')

const isDefined = (obj,key='' ) => typeof obj !== 'undefined' && typeof obj[key] !== 'undefined';

const  removeHtml = (text='') =>  text
    .replace(/<script([\S\s]*?)>([\S\s]*?)<\/script>/ig)
    .replace(/<style([\S\s]*?)>([\S\s]*?)<\/style>/ig)
    .replace(/<[^>]*>/g, '')
    .replace("undefined", "")
    .replace(/\&nbsp;(\s*)?/g, '\n')
 
  class PostCardComponent extends Component  {
  
    constructor(props) {
      super(props);
      this.state = {
        asked: false
      }
      this.handleHastag = this.handleHastag.bind(this);
      this.handleDownload = this.handleDownload.bind(this);
    }
   
    handleHastag(hashtag){
      this.props.searchContent(hashtag);
      Navigation.push('App', {
        component: { name: 'elRepoIO.search' },
      })
    }

    handleDownload(file){
      this.props.fileInfo(file);
      Navigation.push(this.props.componentId, {
        component: { name: 'elRepoIO.fileInfo' }
      })
    }

    askContent(){
      this.setState({asked: true})
      this.props.loadPostData(this.props.post);
    }
  
    render() {
      const {post} = this.props;

      return isDefined(post, 'mMsgName')? (
          <Card style={styles.card}>
                { isDefined(post,'mThumbnail') && post.mThumbnail.mData !== '' && post.mThumbnail.mData.indexOf('base64') !== -1 ?(<Card.Cover source={{ uri: fixTh(post.mThumbnail.mData) }} />): false }
                <Card.Content >
                    <Title>{post.mMsgName}</Title>
                          {isDefined(post,'mMeta')?
                            <View style={{paddingBottom:10}}>
                                <ParsedText
                                  parse={[
                                    {pattern: /\B(\#[0-9a-zA-ZzáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ]+\b)(?!;)/,  style: styles.hashTag, onPress: this.handleHastag}
                                  ]}>
                                  {removeHtml(post.mMsg)}
                                </ParsedText>
                            </View>
                            : false }
                    {
                          isDefined(post, 'mFiles') && post.mFiles.length > 0
                              ? <FileList files={post.mFiles} onDownload={this.handleDownload}  />
                              : false
                      }
                </Card.Content>
                {
                  !isDefined(post,'mMeta')
                    ? <Card.Actions>
                        <Button  loading={this.state.asked} onPress={()=> !this.state.asked ? this.askContent.call(this): false }>
                          Ver
                        </Button>
                      </Card.Actions>
                    : false
                }
            </Card> )
            : false
    }
  }

const styles = StyleSheet.create({
      card: {
        minHeight: 30
      },
      hashTag: {
        color: 'blue',
        textDecorationLine: 'underline',
      }
})

   export const PostCard = connect(
     (state) => ({}),
     (dispatch) => ({
       fileInfo: bindActionCreators(apiActions.getFileInfo, dispatch),
      searchContent: bindActionCreators(apiActions.newSearch, dispatch),
      loadPostData: bindActionCreators(apiActions.loadPostData, dispatch)
     })
    )(PostCardComponent)
  