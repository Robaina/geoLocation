
initializeGame() {
};


openIntro() {
  openFullscreen();
  requestGeolocationPermision();
  displayAboutContainer(){
    typeElementText();
  }; // in 3s
}

startGame() {
  setTimeout() { // 0.5 s
    initializeMap();
    buildTextGrid();
    rememberVisitedPlaces();
    updateVisitedPlaces();
  }
}

exitGame(save=true) {
  if (!save) {
    forgetVisitedPlaces();
  }
   initializeGame();
}
