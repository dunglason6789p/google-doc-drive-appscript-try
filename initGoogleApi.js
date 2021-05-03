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

/**@typedef {{
  signIn: function():void,
  isSignedIn: any,
  currentUser: {get: function(): {getAuthResponse: function(boolean): {access_token: string}}}
}} AuthInstance*/

/** Init client.
 * @param {{discoveryDocs: string[], scope: string}} initData
 * @param {function({authInstance:AuthInstance}):void} onSuccess
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
      const authInstance = gapi.auth2.getAuthInstance();
      const isSignedIn = authInstance.isSignedIn.get();
      if (isSignedIn) {
        onSuccess({authInstance});
      } else {
        let isOnSuccessExecuted = false;
        authInstance.isSignedIn.listen(isUserSignedIn => {
          if (isUserSignedIn) {
            if (!isOnSuccessExecuted) {
              isOnSuccessExecuted = true;
              onSuccess({authInstance});
            }
          }
        });
        authInstance.signIn();
        //onError(new Error('[NTS:ERROR] Error: User not signed in!'));
      }
    }, function(error) {
      onError(error);
    });
  });
}
