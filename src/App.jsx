import React, { Component } from 'react'
import { Button, Navbar, Alignment, Icon, 
				Popover, Position, Menu, MenuItem, 
				Overlay, Card, HTMLTable } from '@blueprintjs/core'
import "@blueprintjs/core/lib/css/blueprint.css";
import Audio from './components/audio'
import axios from 'axios'

const { BrowserWindow } = window.require('electron').remote;

class App extends Component {
	constructor(props){
		super(props)
		this.state = {
			selectedFile: '',
			showUpload: false,
			playing: {},
			songList: []
		}
		this.window = BrowserWindow.getFocusedWindow()
		this.onChangeFile = this.onChangeFile.bind(this)
		this.onUpload = this.onUpload.bind(this)
		this.handleSongSelect = this.handleSongSelect.bind(this)
	}

	componentDidMount(){
		axios.get("http://localhost:8080/music/list/").then((result) => {
			console.log(result.data)
			this.setState({
				songList: result.data
			})
		})
	}

	onChangeFile(e){
		this.setState({
			selectedFile: e.target.files[0]
		})
	}

	handleSongSelect(song){
		this.setState({playing: {
			loc: song.filename,
			name: song.title,
		}})
		this.player.player.load()
		this.player.player.oncanplay = () => {
			this.player.player.play()
			this.player.setState({
				player: 'playing'
			})
		}

	}

	onUpload(e){
		e.preventDefault();
		let title = 'null'
		let artist = 'null'
		let album = 'null'
		let formData = new FormData()

		formData.append('title', title)
		formData.append('artist', artist)
		formData.append('album', album)
		formData.append('song', this.state.selectedFile)

		axios.post('http://localhost:8080/music/add', formData).then((result) => {
			console.log(result.data.data.filename)
			this.setState({
				playing: result.data.data.filename
			})
			axios.get("http://localhost:8080/music/list/").then((getresult) => {
				console.log(getresult.data)
				this.setState({
					songList: getresult.data
				})
			})
		}).catch((err) => {
			console.log(err)
		})
		this.setState({showUpload: false})
		
	}

	render() {
		return (
			<div className="App" style={{flex: 1, display: 'flex', flexDirection: 'column', height:'100vh', borderRadius: 10}}>
				<Navbar style={{WebkitAppRegion: 'drag', height: 30, margin: 0, padding: 0}}>
						<Navbar.Group align={Alignment.LEFT} style={{WebkitAppRegion: 'no-drag', height: 30, marginLeft: 10}}>
								<Navbar.Heading><Icon icon="music" /></Navbar.Heading>
								<Popover 
									content={
										<Menu>
											<MenuItem text="Upload" onClick={() => this.setState({showUpload: true})} />
										</Menu>
									}
									position={Position.BOTTOM_LEFT}
									minimal>
									<Button className="bp3-minimal" text="File" />
								</Popover>
						</Navbar.Group>
						<Navbar.Group align={Alignment.RIGHT} style={{WebkitAppRegion: 'no-drag', height: 30}}>
							<Button className="bp3-minimal" icon="minus" onClick={() => this.window.minimize()}></Button>
							<Button 
								className="bp3-minimal" 
								icon="plus" 
								onClick={() => {if(this.window.isMaximized()){this.window.unmaximize()}else{this.window.maximize()}}}
								></Button>
							<Button className="bp3-minimal" icon="cross" onClick={() => this.window.close()}></Button>
						</Navbar.Group>
				</Navbar>
				<div style={{flex: 1}}>
					<HTMLTable style={{width: '100%'}} interactive>
						<thead>
							<tr>
								<th>Title</th>
								<th>Album</th>
								<th>Artist</th>
							</tr>
						</thead>
						<tbody>
							{this.state.songList.map((member, index) => 
								<tr key={index} onDoubleClick={() => this.handleSongSelect(member)}>
									<td>{member.title}</td>
									<td>{member.album}</td>
									<td>{member.artist}</td>
								</tr>
							)}
						</tbody>
					</HTMLTable>
				</div>
				<Audio 
					ref={player => this.player = player} 
					src={this.state.playing.loc && 'http://localhost:8080/' + this.state.playing.loc} 
					name={this.state.playing.name} 
					state="paused"></Audio>
				<Overlay 
					isOpen={this.state.showUpload} 
					onClose={() => this.setState({showUpload: false})}
					usePortal={true}>
					<Card style={{position: "absolute", left: "50%", top: "50vh", transform: 'translate(-50%, -50%)'}}>
						<form onSubmit={this.onUpload} style={{display: 'flex', flexDirection: 'column'}}>
							<input 
								type="file" 
								name="song" 
								onChange={this.onChangeFile} 
								onDrop={this.onChangeFile} 
								style={{
									zIndex: -5,
									position: 'absolute',
									width: '0',
									height: '0',
									top: 0,
									left: 0,
									opacity: 0
								}}
								ref={input => this.fileInput = input}
								accept="audio/*"
							/>
							{this.state.selectedFile && <div style={{textAlign: 'center'}}>
								<Icon icon="music" style={{paddingRight: 5}} />
								<span>{this.state.selectedFile.name}</span>
							</div>}
							<Button 
								className="bp3-button" 
								style={{flex: 0, margin: 10}} 
								intent="success"
								onClick={() => this.fileInput.click()}
							>Choose File</Button>
							<Button type="submit" className="bp3-minimal" icon="cloud-upload">Upload</Button>
						</form>
					</Card>
				</Overlay>
			</div>
		)
	}
}

export default App
