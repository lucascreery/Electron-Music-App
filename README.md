# Electron-Music-App

This is a minimal music streamer created with a full MERN stack (MongoDB, ExpressJS, React and Node.js) running on an Electron Application

# Start

Install dependencies

```
npm install
```
Build react

```
npm start build
```
Start the App

```
npm start
```
Customize the application and build for multiplatform systems

```
npm run build_osx
npm run build_win
npm run build_linux
```

Run backend

```
cd backend
node index
```

# Notes

Before running, create a `music` folder inside the `backend`.

Be sure to change the location for the database inside of the `mongoose.connect` function in `backend/index.js` from `mongodb://localhost/test` to match the location of your MongoDB database