const {app, Menu, BrowserWindow}	= require('electron');

const path			= require('path');
const url			= require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let app_window = null;

const create_window = () => {
	// Create the browser window.
	app_window = new BrowserWindow({
		width: 750,
		height: 500,
		resizable: false,
		center: true,
		fullscreenable: false,
		backgroundColor: '#000002',
		titleBarStyle: 'hiddenInset'
	});

	// Load the index page
	app_window.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	// Open the DevTools.
	// app_window.webContents.openDevTools();

	// Emitted when the window is closed.
	app_window.on('closed', function() {
		app_window = null;
	});

	require('./menu');
};

app.on('ready', create_window);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function() {
	if (app_window === null) {
		create_window();
	}
});
