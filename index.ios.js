/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * https://www.smashingmagazine.com/2016/04/the-beauty-of-react-native-building-your-first-ios-app-with-javascript-part-1/
 * @flow
 */
'use strict';
import {
    AlertIOS,
    ActivityIndicator,
    AppRegistry,
    CameraRoll,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    View
} from 'react-native';
import NetworkImage from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import RandManager from './RandManager';
import Utils from './Utils';
import React, { Component } from 'react';
import Swiper from 'react-native-swiper';
import ProgressHUD from './ProgressHUD.js';
import ShakeEvent from 'react-native-shake-event-ios';


const { width, height } = Dimensions.get('window');
const NUM_WALLPAPERS = 5;
const DOUBLE_TAP_DELAY = 300; // milliseconds
const DOUBLE_TAP_RADIUS = 20;

class SplashWalls extends Component {

    constructor(props) {
        super(props);

        this.state = {
          wallsJSON: [],
          isLoading: true,
          isHudVisible: false
        };

        this.imagePanResponder = {};
        this.prevTouchInfo = {
            prevTouchX: 0,
            prevTouchY: 0,
            prevTouchTimeStamp: 0
        };
        this.currentWallIndex = 0;
        this.handlePanResponderGrant = this.handlePanResponderGrant.bind(this);
        this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this);
    }

    componentDidMount() {
        this.fetchWallsJSON();
    }

    componentWillMount() {
        this.imagePanResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
            onPanResponderGrant: this.handlePanResponderGrant,
            onPanResponderRelease: this.handlePanResponderEnd,
            onPanResponderTerminate: this.handlePanResponderEnd
        });

        // Fetch new wallpapers on shake
        ShakeEvent.addEventListener('shake', () => {
            this.initialize();
            this.fetchWallsJSON();
        });
    }

    initialize() {
        this.setState({
            wallsJSON: [],
            isLoading: true,
            isHudVisible: false
        });

        this.currentWallIndex = 0;
    }

    onMomentumScrollEnd(e, state, context) {
        this.currentWallIndex = state.index;
    }

    isDoubleTap(currentTouchTimeStamp, {x0, y0}) {
        var {prevTouchX, prevTouchY, prevTouchTimeStamp} = this.prevTouchInfo;
        var dt = currentTouchTimeStamp - prevTouchTimeStamp;
        return (dt < DOUBLE_TAP_DELAY && Utils.distance(prevTouchX, prevTouchY, x0, y0) < DOUBLE_TAP_RADIUS);
    }

    saveCurrentWallpaperToCameraRoll() {
        this.setState({isHudVisible: true});

        var {wallsJSON} = this.state;
        var currentWall = wallsJSON[this.currentWallIndex];
        var currentWallURL = `https://unsplash.it/${currentWall.width}/${currentWall.height}?image=${currentWall.id}`;

        CameraRoll.saveToCameraRoll(currentWallURL, 'photo',).then((result) => {
            this.setState({isHudVisible: false});
            AlertIOS.alert(
                'Saved',
                'Wallpaper successfully saved to Camera Roll',
                [
                    {text: 'High 5!', onPress: () => console.log('OK Pressed!')}
                ]
            );
        }, function(err) {
            console.log('Error saving to camera roll', err);
        });
    }

    handleStartShouldSetPanResponder(e, gestureState) {
        return true;
    }

    handlePanResponderGrant(e, gestureState) {

        var currentTouchTimeStamp = Date.now();

        if( this.isDoubleTap(currentTouchTimeStamp, gestureState) )
            this.saveCurrentWallpaperToCameraRoll();

        this.prevTouchInfo = {
            prevTouchX: gestureState.x0,
            prevTouchY: gestureState.y0,
            prevTouchTimeStamp: currentTouchTimeStamp
        };
    }

    handlePanResponderEnd(e, gestureState) {
        // console.log('Finger pulled up from the image');
    }

    fetchWallsJSON() {
        var url = 'https://unsplash.it/list';
        fetch(url)
          .then( response => response.json() )
          .then( jsonData => {
            var randomIds = RandManager.uniqueRandomNumbers(NUM_WALLPAPERS, 0, jsonData.length);
            var walls = [];
            randomIds.forEach(randomId => {
              walls.push(jsonData[randomId]);
            });

            this.setState({
              isLoading: false,
              wallsJSON: [].concat(walls)
            });
          })
          .catch( error => console.log('JSON Fetch error : ' + error) );
    }

    renderLoadingMessage() {
        return (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#F5FCFF',
            }}>
                <ActivityIndicator
                  animating={true}
                  color={'#999'}
                  size={'small'}
                  style={{margin: 15}} />
                  <Text style={{color: '#fff'}}>Contacting Unsplash</Text>
            </View>
        );
    }

    renderResults() {
        var { wallsJSON, isLoading, isHudVisible } = this.state;
        if (!isLoading) {
            return (
                <View>
                    <Swiper onMomentumScrollEnd={this.onMomentumScrollEnd}
                        index={this.currentWallIndex}
                        dot={<View style={{backgroundColor:'rgba(255,255,255,.4)', width: 8, height: 8,borderRadius: 10, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                        activeDot={<View style={{backgroundColor: '#fff', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 7}} />}>
                        {wallsJSON.map((wallpaper, index) => {
                            return(
                                <View key={index}>
                                    <NetworkImage
                                        source={{uri: `https://unsplash.it/${wallpaper.width}/${wallpaper.height}?image=${wallpaper.id}`}}
                                        indicator={Progress.Circle}
                                        style={styles.wallpaperImage}
                                        indicatorProps={{
                                            color: 'rgba(255, 255, 255)',
                                            size: 60,
                                            thickness: 7
                                        }}
                                        {...this.imagePanResponder.panHandlers}>
                                        <Text style={styles.label}>Photo by</Text>
                                        <Text style={styles.label_authorName}>{wallpaper.author}</Text>
                                    </NetworkImage>
                                </View>
                            );
                        })}
                    </Swiper>
                    <ProgressHUD width={width} height={height} isVisible={isHudVisible}/>
                </View>
            );
        }
    }

    render() {
        var { isLoading } = this.state;
        if (isLoading)
            return this.renderLoadingMessage();
        else
            return this.renderResults();
    }
}

var styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    wallpaperImage: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: '#000'
    },
    label: {
        position: 'absolute',
        color: '#fff',
        fontSize: 13,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 2,
        paddingLeft: 5,
        top: 20,
        left: 20,
        width: width/2
    },
    label_authorName: {
        position: 'absolute',
        color: '#fff',
        fontSize: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 2,
        paddingLeft: 5,
        top: 41,
        left: 20,
        fontWeight: 'bold',
        width: width/2
    }
});

AppRegistry.registerComponent('SplashWalls', () => SplashWalls);
