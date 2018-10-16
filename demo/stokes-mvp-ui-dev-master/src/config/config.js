export const config = {
  CLOUDANT_WAIT_TIME: 1000,
  LOCAL_BASE_URL: 'http://localhost:3000/',
  LOCAL_BASE_URL_1: 'http://ec2-18-191-139-6.us-east-2.compute.amazonaws.com:3000/',
  API_BASE_URL_1: 'http://ec2-18-191-223-251.us-east-2.compute.amazonaws.com:3000/',
  API_BASE_URL: 'http://localhost:3000/',
  API_BASE_URL_2: 'http://ec2-18-191-139-6.us-east-2.compute.amazonaws.com:3000/',
  ENDPOINT: {
    artwork: 'artwork/',
    findArtwork: 'findArtwork?',
    requestConditionReport: 'ConditionReportRequest/',
    submitConditionReport: 'ConditionReportSubmit/',
    getConditionReport: 'ConditionReport/',
    requestOwnership: 'OwnershipRequest/',
    ownershipAction: 'OwnershipAction',
    updateTransportation: 'updateTransportation',
    crossCheckCr: 'crossCheckConditionReport',
    viewArtistName: 'viewArtistName',
    viewArtImage: 'viewArtImage',
    viewArtWork: 'viewArtWork',
    artistDash: 'ArtRepDashboard',
    handlerDash: 'HandlerDashboard',
    managerDash: 'ManagerDashboard',
    transportationRequest: 'TransportationRequest/',
    transportationUpdate: 'TransportationUpdate/',
    receiveArtwork: 'ReceiveArtwork/',
    deliverArtwork: 'DeliverArtwork/',
    downloadArtwork: 'downloadArtwork/',
    transactions: 'transactions/'
  },

  STATUSES: {
    ACCEPTED: 'ACCEPTED',
    DELIVERED: 'DELIVERED',
    IN_TRANSIT: 'IN_TRANSIT',
    LOADED: 'LOADED',
    REQUEST: 'REQUEST',
    SUBMITTED: 'SUBMITTED',
    UNLOADED: 'UNLOADED'
  },
  users: {
    artist: {
      firstName: 'Alicia',
      lastName: 'Boyd',
      username: 'alicia.boyd@artist.com',
      password: 'aboyd',
      org: 'Artist Representative'
    },
    collector: {
      firstName: 'Carlton',
      lastName: 'Luna',
      username: 'carlton.luna@collector.com',
      password: 'cluna',
      org: 'Collector'
    },
    manager: {
      firstName: 'Kevin',
      lastName: 'Collins',
      username: 'kevin.collins@manager.com',
      password: 'kcollins',
      org: 'Collection Manager'
    },
    handler: {
      firstName: 'Jan',
      lastName: 'Nash',
      username: 'jan.nash@handler.com',
      password: 'jnash',
      org: 'Art Handler'
    }
  },
  artist: {
    tabs: {
      first: 'Available',
      second: 'Pending',
      third: 'Delivered'
    },
    roles: [
      'Artist Representative'
    ],
    actionButton: {
      ownershipRequest: 'Relinquish Custody',
    }
  },
  handler: {
    tabs: {
      first: 'New Request',
      second: 'In Progress',
      third: 'Complete'
    },
    roles: [
      'Art Handler'
    ],
    actionButton: {
      delivered: 'Set Transit Status to Delivered',
      in_transit: 'Set Transit Status to In Transit',
      loaded: 'Set Transit Status to Loaded',
      unloaded: 'Set Transit Status to Unloaded',
      uploadCr: 'Upload Condition Report',
      initiate: 'Initiate Transportation'
    }
  },
  collector: {
    tabs: {
      first: 'My Collection',
      second: 'In Progress',
      third: 'Available'
    },
    roles: [
      'Collector',
      'Collection Manager'
    ],
    actionButton: {
      buy: 'Request Custody',
      interested: "Place an Inquiry",
      received: "Set Transit Status to Received"
    }
  },
  dropdowns: {
    selectedYears: {
      id: 0,
      label: ""
    },
    years: [
      {id: 0, label: ""},
      {id: 2017, label: "2017"},
      {id: 2018, label: "2018"}
    ]
  },

};
