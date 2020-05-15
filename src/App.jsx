import React, { Component } from 'react'
import { Button, Navbar, Alignment, Icon, 
				Popover, Position, Menu, MenuItem, 
				Overlay, Card, HTMLTable, InputGroup, Label } from '@blueprintjs/core'
import "@blueprintjs/core/lib/css/blueprint.css";
import Audio from './components/audio'
import axios from 'axios'
import logo from './logo.svg'
const download = require('downloadjs')
const path = require('path')

const { BrowserWindow } = window.require('electron').remote;

class App extends Component {
	constructor(props){
		super(props)
		this.state = {
			selectedFile: '',
			showUpload: false,
			showEdit: false,
			playing: {},
			songList: [],
			selected: [],
			contextX: 0,
			contextY: 0,
			contextVisible: 'hidden',
			lastSelected: {}
		}
		this.window = BrowserWindow.getFocusedWindow()
		this.onChangeFile = this.onChangeFile.bind(this)
		this.onUpload = this.onUpload.bind(this)
		this.handleSongSelect = this.handleSongSelect.bind(this)
		this.handleTempSelect = this.handleTempSelect.bind(this)
		this.handleClick = this.handleClick.bind(this)
		this.handleRightClick = this.handleRightClick.bind(this)
		this.onDownload = this.onDownload.bind(this)
		this.onDelete = this.onDelete.bind(this)
		this.onEdit = this.onEdit.bind(this)
	}

	componentDidMount(){
		axios.get("http://localhost:8080/music/list/").then((result) => {
			let sel = []
			for(let i in result.data){
				sel.push(false)
			}
			this.setState({
				songList: result.data,
				selected: sel
			})
		})
		document.addEventListener('click', this.handleClick, false)
		document.addEventListener('contextmenu', this.handleRightClick, false)
	}

	componentWillUnmount(){
		document.removeEventListener('click', this.handleClick, false)
		document.removeEventListener('contextmenu', this.handleRightClick, false)
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
			this.setState({
				playing: result.data.data.filename
			})
			axios.get("http://localhost:8080/music/list/").then((getresult) => {
				let sel = []
				for(let i in getresult.data){
					sel.push(false)
				}
				this.setState({
					songList: getresult.data,
					selected: sel
				})
			})
		}).catch((err) => {
			console.log(err)
		})
		this.setState({selectedFile: '', showUpload: false})
	}

	handleTempSelect(e){
		let sel = [];
		for(let i in this.state.selected){
			if(i === e.currentTarget.id){
				sel.push(true)
			}else{
				if(e.ctrlKey){
					sel.push(this.state.selected[i])
				}else{
					sel.push(false)
				}
			}
		}
		this.setState({
			selected: sel
		})
	}

	handleClick(e){
		if(!this.songTable.contains(e.target)){
			let sel = []
			for(let i in this.state.selected){
				sel.push(false)
			}
			this.setState({
				selected: sel
			})
		}
		this.setState({contextVisible: 'hidden'})
	}

	handleRightClick(e){
		e.preventDefault()
		if(this.songTable.contains(e.target)){
			this.setState({
				contextVisible: 'visible', 
				contextX: e.clientX, 
				contextY: e.clientY
			})
			let sel = [];
			for(let i in this.state.selected){
				if(i === e.target.parentElement.id){
					sel.push(true)
				}else{
					sel.push(this.state.selected[i])
				}
			}
			this.setState({
				lastSelected: this.state.songList[e.target.parentElement.id],
				selected: sel,
			})
			}
	}

	onDownload = async (e) => {
		let downloadName = '';
		let selection = this.state.selected
		for(let i in this.state.songList){
			if(selection[i]){
				downloadName = this.state.songList[i].filename
				let filename = downloadName.split('\\').pop().split('/').pop();
				const res = await fetch('http://localhost:8080/music/download/' + filename)
				const blob = await res.blob()
				let ext = path.extname(filename)
				await download(blob, this.state.songList[i].title + ext, 'audio/*')
			}
		}
	}

	onDelete(){
		let deleteName = '';
		let selection = this.state.selected
		for(let i in this.state.songList){
			if(selection[i]){
				deleteName = this.state.songList[i].filename
				let filename = deleteName.split('\\').pop().split('/').pop();
				axios.get('http://localhost:8080/music/delete/' + filename).then((result) => {
					let sel = []
					for(let i in result.data){
						sel.push(false)
					}
					this.setState({
						songList: result.data,
						selected: sel
					})
				}).catch((err) => {
					console.log(err)
				})
			}
		}
	}

	onEdit(e){
		e.preventDefault()
		var newSong = this.state.lastSelected
		newSong.title = document.getElementById('newTitle').value
		newSong.album = document.getElementById('newAlbum').value
		newSong.artist = document.getElementById('newArtist').value
		axios.post('http://localhost:8080/music/edit/' + newSong._id, newSong).then((result) => {
			let sel = []
			for(let i in result.data){
				sel.push(false)
			}
			this.setState({
				songList: result.data,
				selected: sel,
				showEdit: false
			})
		}).catch((err) => {
			console.log(err)
		})
	}

	render() {
		return (
			<div 
				className="App" 
				style={{
					flex: 1, 
					display: 'flex', 
					flexDirection: 'column', 
					height:'100vh', 
					borderRadius: 10,
					minWidth: 800,
					minHeight: 600
				}}>
				<Navbar style={{WebkitAppRegion: 'drag', height: 30, margin: 0, padding: 0}}>
						<Navbar.Group align={Alignment.LEFT} style={{WebkitAppRegion: 'no-drag', height: 30, marginLeft: 10}}>
								<Navbar.Heading>
									<img src={logo} alt="Icon" style={{width: 20, marginTop: 4}} />
								</Navbar.Heading>
								<Popover 
									content={
										<Menu>
											<MenuItem text="Upload" onClick={() => this.setState({showUpload: true})} icon="cloud-upload" />
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
				<div style={{flex: 1, overflow: 'auto'}}>
					<div ref={table => this.songTable = table}>
						<HTMLTable 
							style={{
								width: '100%', 
								borderStyle: 'solid', 
								borderWidth: 1
							}} 
							interactive 
							condensed 
							striped
						>
							<thead>
								<tr>
									<th
										onClick={() => {
											let sel = []
											for(let i in this.state.songList){
												sel.push(false)
											}
											this.setState({
												songList: this.state.songList.sort((a, b) => {
													let aTitle = a.title.toUpperCase()
													let bTitle = b.title.toUpperCase()
													let comp = 0
													if(aTitle > bTitle){
														comp = 1
													} else if(aTitle < bTitle){
														comp = -1
													}
													return comp
												}),
												selected: sel
											})
										}
									}>Title</th>
									<th
										onClick={() => {
											let sel = []
											for(let i in this.state.songList){
												sel.push(false)
											}
											this.setState({
												songList: this.state.songList.sort((a, b) => {
													let comp = 0
													var aAlbum
													var bAlbum
													if(a.album) {
														aAlbum = a.album.toUpperCase()
													}else{
														aAlbum = 'z'
													}
													if(b.album) {
														bAlbum = b.album.toUpperCase()
													} else {
														bAlbum = 'z'
													}
													if(aAlbum > bAlbum){
														comp = 1
													} else if(aAlbum < bAlbum){
														comp = -1
													}
													return comp
												}),
												selected: sel
											})
										}
									}>Album</th>
									<th
										onClick={() => {
											let sel = []
											for(let i in this.state.songList){
												sel.push(false)
											}
											this.setState({
												songList: this.state.songList.sort((a, b) => {
													let comp = 0
													var aArtist
													var bArtist
													if(a.artist) {
														aArtist = a.artist.toUpperCase()
													}else{
														aArtist = 'z'
													}
													if(b.artist) {
														bArtist = b.artist.toUpperCase()
													} else {
														bArtist = 'z'
													}
													if(aArtist > bArtist){
														comp = 1
													} else if(aArtist < bArtist){
														comp = -1
													}
													return comp
												}),
												selected: sel
											})
										}
									}>Artist</th>
								</tr>
							</thead>
							<tbody>
								{this.state.songList.map((member, index) => 
									<tr 
										key={index} 
										id={index} 
										onClick={this.handleTempSelect} 
										onDoubleClick={() => this.handleSongSelect(member)}
										style={{
											backgroundColor: (this.state.selected[index]) && '#999999'
										}}
									>
										<td>{member.title}</td>
										<td>{member.album}</td>
										<td>{member.artist}</td>
									</tr>
								)}
							</tbody>
						</HTMLTable>
					</div>
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
					<Card style={{position: "fixed", left: "50%", top: "50vh", transform: 'translate(-50%, -50%)'}}>
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
				<Overlay 
					isOpen={this.state.showEdit} 
					onClose={() => this.setState({showEdit: false})}
					usePortal={true}>
					<Card style={{position: "fixed", left: "50%", top: "50vh", transform: 'translate(-50%, -50%)'}}>
						<form onSubmit={this.onEdit} style={{display: 'flex', flexDirection: 'column'}}>
							<Label>
								Title
								<InputGroup id="newTitle" defaultValue={this.state.lastSelected.title} style={{marginBottom: 10}} fill />
							</Label>
							<Label>
								Album
								<InputGroup id="newAlbum" defaultValue={this.state.lastSelected.album} style={{marginBottom: 10}} fill />
							</Label>
							<Label>
								Artist
								<InputGroup id="newArtist" defaultValue={this.state.lastSelected.artist} style={{marginBottom: 10}} fill />
							</Label>
							<Button type="submit" className="bp3-minimal" icon="tick" intent="success">Apply Changes</Button>
						</form>
					</Card>
				</Overlay>
				<Menu 
					style={{
						position: 'absolute', 
						left: this.state.contextX, 
						top: this.state.contextY, 
						visibility: this.state.contextVisible,
						boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.2)'
					}}>
					<MenuItem text="Download" onClick={this.onDownload} icon="cloud-download" />
					<MenuItem text="Edit" onClick={() => this.setState({showEdit: true})} icon="edit" />
					<MenuItem text="Delete" onClick={this.onDelete} icon="remove" intent="danger" />
				</Menu>
			</div>
		)
	}
}

export default App
