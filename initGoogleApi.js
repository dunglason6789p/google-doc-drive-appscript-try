try {
  gapi;
} catch (e) {
  throw new Error(`[NTS:ERROR] Error: Please include/import library file: apis.google.com/js/api.js`);
}

try {
  SECRET;
} catch (e) {
  throw new Error(`[NTS:ERROR] Error: Please specify your secret file! The file must have structure like this:
  SECRET = {
    CLIENT_ID: '...',
    CLIENT_SECRET: '...',
    API_KEY: '...',
  }`);
}

// Client ID and API key from the Developer Console
const CLIENT_ID = SECRET.CLIENT_ID;
const API_KEY = SECRET.API_KEY;

/** Init client.
 * @param {{discoveryDocs: string[], scope: string}} initData
 * @param {any} onSuccess
 * @param {function(Error):void} onError*/
function initGoogleApi(initData, onSuccess, onError) {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: initData.discoveryDocs,
      scope: initData.scope,
    }).then(function () {
      // Handle the initial sign-in state.
      const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
      if (isSignedIn) {
        onSuccess();
      } else {
        let isOnSuccessExecuted = false;
        gapi.auth2.getAuthInstance().isSignedIn.listen(isUserSignedIn => {
          if (isUserSignedIn) {
            if (!isOnSuccessExecuted) {
              isOnSuccessExecuted = true;
              onSuccess();
            }
          }
        });
        gapi.auth2.getAuthInstance().signIn();
        //onError(new Error('[NTS:ERROR] Error: User not signed in!'));
      }
    }, function(error) {
      onError(error);
    });
  });
}
