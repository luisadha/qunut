//-----------------------------------------------------------------------------

// ### PWA Bunga! UX

//     This js file is used to register the PWA service worker  
//     and provides functions to improve the user experience

//     Documentation of pwabunga.js
//     ----------------------------
//     https://pwabunga.com/documentation/pwa/js.html

//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------

// ### PWA Register

//-----------------------------------------------------------------------------

// @doc https://pwabunga.com/documentation/pwa/register.html

const pwaRegister = async (file = 'serviceworker.js') => {

  // -- If the browser supports the serviceWorker
  if ("serviceWorker" in navigator) {
    try {
      // -- We try to register the service worker
      const registration = await navigator.serviceWorker.register(file)
      if (registration.installing) {
        console.log("Service worker installing")
      } else if (registration.waiting) {
        console.log("Service worker installed")
      } else if (registration.active) {
        console.log("Service worker active")
      }
    } 
    catch (error) {
      console.error(`Registration failed with ${error}`)
    }
  }

}

//-----------------------------------------------------------------------------

// ### PWA UX/UI 

//-----------------------------------------------------------------------------

//--------------------------------------------------------------------
// ## PWA Install
//--------------------------------------------------------------------

// @doc https://pwabunga.com/documentation/pwa/install.html

const pwaInstall = async () => {

  // # Selection of dom elements
  //----------------------------

  const pwaInstallPromotion      = document.querySelector('.pwa-install-promotion')
  const pwaInstallPromotionClose = document.querySelector('.pwa-install-promotion-close')
  const pwaInstallBtn            = document.querySelector('.pwa-install-btn')
  const pwaInstallConfirm        = document.querySelector('.pwa-install-confirm')
  const pwaInstallConfirmClose   = document.querySelector('.pwa-install-confirm-close')
  const pwaInstallLoader         = document.querySelector('.pwa-loader')

  // # Show PWA Install Button and promotion bar
  //--------------------------------------------

  // -- Initialize deferredPrompt for use later to show browser install prompt
  let deferredPrompt

  // -- If the installation has not already been done
  window.addEventListener('beforeinstallprompt', (e) => {
    // - Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // - Stash the event so it can be triggered later.
    deferredPrompt = e
    // - Show PWA promotion bar
    pwaInstallPromotion.classList.add('is-visible')
    // - Show PWA install btn
    pwaInstallBtn.classList.add('is-visible')
  })

  // # PWA Install Button
  //---------------------

  pwaInstallBtn.addEventListener('click', async () => {
    // -- Show the install prompt
    deferredPrompt.prompt()
    // Find out whether the user confirmed the installation or not
    const { outcome } = await deferredPrompt.userChoice
    // -- We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null
    // -- Act on the user's choice
    if (outcome === 'accepted') {
      // - Hide PWA install btn
      pwaInstallBtn.classList.remove('is-visible')
    }
  })

  // # PWA Install Confirm
  //----------------------

  // -- When the app is installed
  window.addEventListener("appinstalled", () => {
    // - Hide PWA Install Promotion bar
    pwaInstallPromotion.classList.remove('is-visible')
    // - Show PWA loader
    pwaInstallLoader.classList.add('is-visible')
    // - We simulate the loading time by putting a delay of 2.5s
    setTimeout(() => {
      // Show PWA Install Confirm bar
      pwaInstallConfirm.classList.add('is-visible')
      // Hide PWA loader
      pwaInstallLoader.classList.remove('is-visible')
    }, 2500)
  })

  // # PWA close Install Promotion
  //------------------------------

  pwaInstallPromotionClose.addEventListener('click', () => {
    // -- Hide PWA Install Promotion bar
    pwaInstallPromotion.classList.remove('is-visible')
  })

  // # PWA close Install confirm
  //----------------------------

  pwaInstallConfirmClose.addEventListener('click', () => {
    // -- Hide PWA Install confirm bar
    pwaInstallConfirm.classList.remove('is-visible')
  })

}

//--------------------------------------------------------------------
// ## PWA Update
//--------------------------------------------------------------------

// @doc https://pwabunga.com/documentation/pwa/update.html

const pwaUpdate = async () => {

  // # Selection of dom elements
  //----------------------------

  const pwaUpdateBar    = document.querySelector('.pwa-update')
  const pwaUpdateBtn    = document.querySelector('.pwa-update-btn')
  const pwaUpdateClose  = document.querySelector('.pwa-update-close')
  const pwaUpdateLoader = document.querySelector('.pwa-loader')

  // # Service Worker
  //-----------------

  // -- Get the Service Worker instance
  const registration = await navigator.serviceWorker.getRegistration()

  // # PWA Update found
  //-------------------

  registration.addEventListener("updatefound", async () => {
    // -- If a service worker is registered
    if (registration.installing) {
      // - Wait until the new Service worker is actually installed (ready to take over)
      registration.installing.addEventListener('statechange', async () => {
        if (registration.waiting) {
          // if there's an existing controller (previous Service Worker)
          if (navigator.serviceWorker.controller) {
            // Show update bar
            pwaUpdateBar.classList.add('is-visible')
          }
        }
      })
    }
  })

  // # PWA Update button
  //--------------------

  pwaUpdateBtn.addEventListener('click', async () => {
    // -- Hide Update bar
    pwaUpdateBar.classList.remove('is-visible')
    // -- Show loader
    pwaUpdateLoader.classList.add('is-visible')
    // -- We send a message to the serviceworker which will be used to update the latter when he receives it
    registration.waiting.postMessage('SKIP_WAITING')
  })

  // # PWA Refresh
  //--------------

  // -- When the service worker updated after receiving the message 
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // - We refresh all the tabs of the open app
    window.location.reload()
  })

  // # Update bar
  //-------------

  // -- Show the update bar if it was skipped
  if (registration.waiting) {
    // -- Show Update bar
    pwaUpdateBar.classList.add('is-visible')
  }

  // # PWA close Promotion confirm
  //------------------------------

  pwaUpdateClose.addEventListener('click', () => {
      // -- Hide PWA promotion confirm bar
      pwaUpdateBar.classList.remove('is-visible')
  })

}

//--------------------------------------------------------------------
// ## PWA Share
//--------------------------------------------------------------------

// @doc https://pwabunga.com/documentation/pwa/share.html

const pwaShare = async (options = {}) => {

  try {

    // # Selection of dom elements
    //----------------------------

    const pwaShareBtn = document.querySelector('.pwa-share-btn')

    // # PWA Webmanifest data
    //-----------------------

    // -- Fetches the PWA web manifest and stores the response in a variable
    const webmanifestResponse = await fetch(new Request(document.querySelector('link[rel="manifest"]').href))
    // -- Converts the response from JSON to a JavaScript object and stores it in a variable
    const webmanifest = await webmanifestResponse.json()

    // # Attribute data for the share API
    //-----------------------------------

    // -- Define the sharing title with parameter to the function, or with name property in the webmanifest, or with title meta tag of the document
    const title = options.title || webmanifest.name || document.title
    // -- Define the sharing text with parameter to the function, or with description property in the webmanifest, or empty
    const text  = options.text || webmanifest.description || ''
    // -- Define the sharing URL with parameter to the function, or with the URL of the page
    const url   = options.url || location.origin + location.pathname

    // # PWA Show Share button
    //------------------------

    // --  Checks whether the PWA is running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    // --  Checks whether the PWA is running in fullscreen mode
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches
    // --  Checks whether the PWA is running in standalone mode on iOS 
    const isStandaloneIOS = window.navigator.standalone

    // -- If the application is in fullscreen or standalone
    if (isStandalone || isFullscreen || isStandaloneIOS) {
      // - Show PWA Share Button
      pwaShareBtn.classList.add('is-visible')
    }

    // # PWA Share button
    //-------------------

    // -- Adds a click event listener to the PWA share button that triggers the share functionality
    pwaShareBtn.addEventListener('click', async () => {
      // - Checks if the Web Share API is supported by the browser
      if ('share' in navigator) {
        // - Defines an object called data that contains the title, text, and url of the page to be shared
        let data = { title, text, url }
        try {
          // Opens the device's native sharing module with the data to be shared
          await navigator.share(data)
        } catch (error) {
          // If there is an error, an error message is logged to the console
          console.error('Error sharing:', error)
        }
      // - If the Web Share API is not supported by the browser
      } else {
        // An warn message is logged to the console
        console.warn('Share API not supported')
        // The user is redirected to a WhatsApp API with the shared content as a text message
        location.href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(text + ' - ') + url
      }
    })

  } catch (error) {
    // -- An error message is logged to the console
    console.error('Error initializing pwaShare:', error)
  }

}

//--------------------------------------------------------------------
// ## PWA Parameters
//--------------------------------------------------------------------

// @doc https://pwabunga.com/documentation/pwa/params.html

const pwaParams = async (
  version = true, 
  notifications = true, 
  geolocation = true
) => {

  // # Selection of dom elements
  //----------------------------

  const pwaParams                       = document.querySelector('.pwa-params')
  const pwaParamsButton                 = document.querySelector('.pwa-params-btn')
  const pwaParamsButtonClose            = document.querySelector('.pwa-params-close-btn')
  const pwaParamsVersion                = document.querySelector('.pwa-params-version')
  const pwaParamsPermission             = document.querySelector('.pwa-params-permission')
  const pwaParamsPermissionNotification = document.querySelector('.pwa-params-permission-notification')
  const pwaParamsPermissionGeolocation  = document.querySelector('.pwa-params-permission-geolocation')
  const pwaAddName                      = document.querySelector('.pwa-name')
  const pwaAddVersion                   = document.querySelector('.pwa-version')

  // # Service Worker
  //-----------------

  // -- Get the Service Worker instance
  const registration = await navigator.serviceWorker.getRegistration()

  // # PWA Webmanifest data
  //-----------------------

  // -- Fetches the PWA web manifest and stores the response in a variable
  const webmanifestResponse = await fetch(new Request(document.querySelector('link[rel="manifest"]').href))
  // -- Converts the response from JSON to a JavaScript object and stores it in a variable
  const webmanifest = await webmanifestResponse.json()

  // # PWA Show Params button
  //-------------------------

  // -- Retrieves the value of the 'utm_source' parameter from the URL query string of the current page
  const utm_source = new URLSearchParams(window.location.search).get('utm_source')
  
  // -- If the utm_source parameter in the URL equals to 'homescreen'
  if(utm_source == 'homescreen') {
    // - Show PWA Params button
    pwaParamsButton.classList.add('is-visible')
  }

  // # PWA Version
  //--------------

  const pwaVersion = async () => {
    // Send a message to the active Service Worker requesting the PWA versio
    registration.active.postMessage('GET_VERSION')
    // Listen for incoming messages from the Service Worker
    navigator.serviceWorker.addEventListener('message', function(event) {
      // Check if the message contains any data
      if (event.data) {
        // Update a DOM element to display the PWA version contained in the message
        pwaAddVersion.innerText = event.data
      }
    })
  }

  // # PWA Params Version
  //---------------------

  // -- If the 'version' parameter of the function has a value of true
  if(version) {
    // - Show PWA Version
    pwaParamsVersion.classList.add('is-visible')
    // - Set the name of the PWA based on the data in the Web manifest file
    pwaAddName.innerText = webmanifest.name

    // - Set the version of the PWA based on the data in the Service worker file
    pwaVersion()
  } 

  // # PWA Params Permissions
  //-------------------------

  // -- If both the 'notifications' and 'geolocation' parameters of the function have their value set to false
  if (!(notifications) && !(geolocation)) {
    // - Hide Params permission block 
    pwaParamsPermission.classList.remove('is-visible')
  } else {
    // - Show Params permission block 
    pwaParamsPermission.classList.add('is-visible')
  }

  // # PWA Params Permissions Notifications
  //---------------------------------------

  // -- If the 'notifications' parameter of the function has a value of true
  if (notifications) {
    // - Show Params permission Notifications block
    pwaParamsPermissionNotification.classList.add('is-visible')
    // - Invoke the function pwaNotifications()
    pwaNotifications()
  }

  // # PWA Params Permissions Geolocation
  //-------------------------------------

  // -- If the 'geolocation' parameter of the function has a value of true
  if (geolocation) {
    // - Show Params permission geolocation block
    pwaParamsPermissionGeolocation.classList.add('is-visible')
    // - Invoke the function pwaGeolocation()
    pwaGeolocation()
  }

  // # PWA Params button
  //--------------------

  // -- Adds a click event listener to the PWA params button
  pwaParamsButton.addEventListener('click', () => {
    // - Show PWA Params Block
    pwaParams.classList.add('is-visible')
  })

  // # PWA Params Close button
  //--------------------------

  // -- Adds a click event listener to the PWA params close button
  pwaParamsButtonClose.addEventListener('click', () => {
    // - Hide PWA Params Block
    pwaParams.classList.remove('is-visible')
  })

}

//-----------------------------------------------------------------------------

// ### PWA Permissions

//-----------------------------------------------------------------------------

//--------------------------------------------------------------------
// ## PWA Notifications
//--------------------------------------------------------------------

// @doc https://pwabunga.com/documentation/pwa/notification.html

const pwaNotifications = async () => {

  // # Selection of dom element
  //---------------------------

  const pwaPermissionNotificationsBtn = document.querySelector('.pwa-permission-notifications-btn')
  const pwaPermissionRemove           = document.querySelector('.pwa-permission-remove')

  // # PWA Actual state of the noiifications permission
  //---------------------------------------------------

  // -- If the user has already granted permission for notifications
  if (Notification.permission === 'granted') { 
    // - Add the 'is-active' class to the button to show that notifications are enabled
    pwaPermissionNotificationsBtn.classList.add('is-active')
  } else {
    // - Remove the 'is-active' class from the button to show that notifications are disabled
    pwaPermissionNotificationsBtn.classList.remove('is-active')
  }

  // # PWA Notifications authorisation Ask function
  //-----------------------------------------------

  const pwaNotificationsPermission = async () => {
    // -- If the user is not denying notifications
    if (Notification.permission !== 'denied') { 
      // - The user is asked the right to send him notifications
      const permission = await Notification.requestPermission()
      // If he accepted
      if(permission == "granted"){ 
        // Add the 'is-active' class to the button to show that notifications are enabled
        pwaPermissionNotificationsBtn.classList.add('is-active')
      } 
    } 
  }

  // # PWA Notifications permission button
  //--------------------------------------

  pwaPermissionNotificationsBtn.addEventListener('click', async () => {
    // -- Checks if the button has the 'is-active' class
    if(pwaPermissionNotificationsBtn.classList.contains('is-active')) {
      // - Show the alert box indicating how to remove the notification permission
      pwaPermissionRemove.classList.add('is-visible')
    } else {
      // - Requests notification permission
      pwaNotificationsPermission()
    }
  })

  // # PWA Remove permission alert close
  //------------------------------------

  // -- When the alert box is clicked
  pwaPermissionRemove.addEventListener('click', () => {
    // - Removes the alert box indicating how to remove the notification permission
    pwaPermissionRemove.classList.remove('is-visible')
  })

}

//--------------------------------------------------------------------
// ## PWA Geolocation
//--------------------------------------------------------------------

// @doc https://pwabunga.com/documentation/pwa/geolocation.html

const pwaGeolocation = async () => {

  // # Selection of dom element
  //---------------------------

  const pwaPermissionGeolocationBtn = document.querySelector('.pwa-permission-geolocation-btn')
  const pwaPermissionRemove         = document.querySelector('.pwa-permission-remove')

  // # PWA Geolocation Get current position
  //---------------------------------------

  const pwaGeolocationCurrentPosition = () => {
    // -- Use the geolocation API to get the user's position
    navigator.geolocation.getCurrentPosition(function(position) {
      // - Log the user's latitude to the console
      console.log('Latitude:' + position.coords.latitude)
      // - Log the user's longitude to the console
      console.log('Longitude:' + position.coords.longitude)
      // - Add the 'is-active' class to the button to show that geolocation are enabled
      pwaPermissionGeolocationBtn.classList.add('is-active')
    })
  }

  // # PWA Actual state of the geolocation permission
  //-------------------------------------------------

  // Check if the user has already granted permission for geolocation
  const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })

  if (permissionStatus.state === "granted") {
    // - Add the 'is-active' class to the button to show that geolocation are enabled
    pwaGeolocationCurrentPosition()
  }

  // # PWA Notifications permission button
  //------------------------------------------------

  pwaPermissionGeolocationBtn.addEventListener('click', () => {
    // -- Checks if the button has the 'is-active' class
    if(pwaPermissionGeolocationBtn.classList.contains('is-active')) {
      // - Show the alert box indicating how to remove the geolocation permission
      pwaPermissionRemove.classList.add('is-visible')
    } else {
      // - Requests geolocation permission with pwaGeolocationCurrentPosition() function
      pwaGeolocationCurrentPosition()
    }
  })

  // # PWA Remove permission alert close
  //------------------------------------

  // -- When the alert box is clicked
  pwaPermissionRemove.addEventListener('click', () => {
    // - Removes the alert box indicating how to remove the geolocation permission
    pwaPermissionRemove.classList.remove('is-visible')
  })

}

//-----------------------------------------------------------------------------

// ### PWA Init

//-----------------------------------------------------------------------------

pwaRegister()
pwaInstall()
pwaUpdate()
pwaShare()
pwaParams()