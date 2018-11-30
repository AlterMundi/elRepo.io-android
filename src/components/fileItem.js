import React from 'react';
import {  List } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import filesize from "filesize"

export const FileList = ({files, icon, onDownload, onPress}) => (
    <View>
      {files.map(file => (
          <List.Item
            key={file.mHash}
            style={styles.list}
            title={file.mName}
            description={filesize(file.mSize)}
            onPress={()=> (typeof onPress === 'function') ? onPress(file): onDownload(file)}
            left={props => <List.Icon mode="text" icon={icon || "file-download"}/>}
            />
      ))}
    </View>)

const styles = StyleSheet.create({
    list: {
        marginLeft: -4,
        marginRight: -4,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: "#f3f3f3",
        borderRadius: 2
      }
  });
  