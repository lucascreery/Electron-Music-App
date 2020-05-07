import React, { Component } from 'react'
import { Button, Icon, ProgressBar, Colors } from '@blueprintjs/core'
import "@blueprintjs/core/lib/css/blueprint.css";
import coverart from './icon.png'

export default class Audio extends Component {
  constructor(props){
    super(props)
    this.state = {
      player: this.props.state,
      currentTime: 0,
      duration: null,
      hideTooltip: true,
      tipX: 100,
      tipY: 100,
      toolTip: ''
    }
    this.handleMouseOver = this.handleMouseOver.bind(this)
    this.handleMouseOut = this.handleMouseOut.bind(this)
    this.handleProgress = this.handleProgress.bind(this)
  }

  componentDidMount() {
    this.player.addEventListener("timeupdate", e => {
      this.setState({
        currentTime: e.target.currentTime,
        duration: e.target.duration
      });
    });
  }

  componentWillUnmount() {
    this.player.removeEventListener("timeupdate", () => {});
  }

  handleMouseOver(e){
    this.setState({
      hideTooltip: false,
      tipX: e.nativeEvent.clientX,
      tipY: e.nativeEvent.clientY - e.nativeEvent.offsetY - 30,
      toolTip: this.state.duration ? ((e.nativeEvent.offsetX / this.ProgressBar.clientWidth) * this.state.duration).toFixed(1) : ''
    })
  }

  handleMouseOut(e){
    this.setState({
      hideTooltip: true
    })
  }

  handleProgress(e){
    //console.log(e.nativeEvent)
    let newTime = (e.nativeEvent.offsetX / this.ProgressBar.clientWidth) * this.state.duration
    this.player.currentTime = newTime
    this.setState({
      currentTime: newTime
    })
  }

  render() {
    return (
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <img src={coverart} alt="Music" style={{maxHeight: 100, margin: 10, borderColor: Colors.GRAY1, borderStyle: 'solid', borderRadius: 10}}></img>
        <div style={{flex: 1, padding: 10}} className={this.props.className}>
          <div style={{flex: 0, display: 'flex', marginLeft: 10, alignItems: 'center'}}>
            <Button className="bp3-minimal"><Icon icon="step-backward" iconSize={30}></Icon></Button>
            {this.state.player === 'paused' && (
              <Button 
              className="bp3-minimal" 
              onClick={() => {
                if(this.props.src){
                  this.player.play()
                  this.setState({player: 'playing'})  
                }
              }}
              ><Icon icon="play" iconSize={30}></Icon></Button>
            )}
            {this.state.player === 'playing' && (
              <Button 
              className="bp3-minimal" 
              onClick={() => {
                this.player.pause()
                this.setState({player: 'paused'})
              }}
              ><Icon icon="pause" iconSize={30}></Icon></Button>
            )}
            <Button className="bp3-minimal"><Icon icon="step-forward" iconSize={30}></Icon></Button>
            <audio src={this.props.src} ref={ref => (this.player = ref)} id="player"></audio>
          </div>
          <div 
            style={{
              position: 'fixed', 
              left: this.state.tipX, 
              top: this.state.tipY, 
              backgroundColor: Colors.LIGHT_GRAY1,
              padding: (this.state.duration) ? 5 : 0,
              borderRadius: 2
            }} 
            hidden={this.state.hideTooltip}>
            {this.state.toolTip}
          </div>
          <div 
            style={{margin: 10, display: 'flex',flexDirection: 'row', alignItems: 'center'}} 
            onClick={this.handleProgress}
            onMouseMove={this.handleMouseOver}
            onMouseOut={this.handleMouseOut}
            ref={ (ProgressBar) => this.ProgressBar = ProgressBar}>
              <ProgressBar 
                intent="primary" 
                animate={false} 
                stripes={false} 
                value={this.state.currentTime / this.state.duration}
                ref={(item) => this.ProgressRef = item}>
                </ProgressBar>
          </div>
          <div style={{display: 'flex'}}>
            <span style={{marginLeft: 10, flex: 1}}>
              {this.props.name}
            </span>
            <span style={{marginRight: 10, flex: 1, textAlign: 'right'}}>
              {this.state.duration ? this.state.currentTime.toFixed(1) + "/" + this.state.duration.toFixed(1) : ''}
            </span>
          </div>
        </div>
      </div>
    )
  }
}