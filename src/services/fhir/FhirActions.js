import 'whatwg-fetch'
import { getURL } from '../smart_setup';


// get observations
export const FETCH_OBSERVATIONS_REQUEST = 'FETCH_OBSERVATIONS_REQUEST';
export const FETCH_OBSERVATIONS_SUCCESS = 'FETCH_OBSERVATIONS_SUCCESS';
export const FETCH_OBSERVATIONS_FAILURE = 'FETCH_OBSERVATIONS_FAILURE';

export const requestAllObservations = patientID => ({
  type: FETCH_OBSERVATIONS_REQUEST,
  patientID
});

export const receiveAllObservations = (patientID, json) => ({
  type: FETCH_OBSERVATIONS_SUCCESS,
  patientID,
  obs: json,
  receivedAt: Date.now()
});

export const failAllObservations = patientID => ({
  type: FETCH_OBSERVATIONS_FAILURE,
  patientID,
  error: 'oops'
});

// http://fhirtest.uhn.ca/baseDstu3/Observation?patient=140570
export function fetchAllObservations(patientID) {
  return (dispatch) => {
    dispatch(requestAllObservations(patientID));
    const baseUrl = getURL();

    return fetch(baseUrl + '/Observation?patient=' + patientID)
      .then(
        response => response.json(),
        error => console.error('An error occured.', error)
      )
      .then(json =>
        dispatch(receiveAllObservations(patientID, json))
      );
  };
}

// get patient data

export const FETCH_PATIENT_REQUEST = 'FETCH_PATIENT_REQUEST';
export const FETCH_PATIENT_SUCCESS = 'FETCH_PATIENT_SUCCESS';
export const FETCH_PATIENT_FAILURE = 'FETCH_PATIENT_FAILURE';

export const requestAllPatientData = patientID => ({
  type: FETCH_PATIENT_REQUEST,
  patientID
});

export const receiveAllPatientData = (patientID, json) => ({
  type: FETCH_PATIENT_SUCCESS,
  patientID,
  ptData: json.entry[0].resource,
  receivedAt: Date.now()
});

export const failAllPatientData = patientID => ({
  type: FETCH_PATIENT_FAILURE,
  patientID,
  error: 'oops'
});

// http://fhirtest.uhn.ca/baseDstu3/Patient
export function fetchAllPatientData(patientID) {
  return (dispatch) => {
    dispatch(requestAllPatientData(patientID));
    const baseUrl = getURL();

    return fetch(baseUrl + '/Patient?_id=' + patientID)
      .then(
        response => response.json(),
        error => console.error('An error occured.', error)
      )
      .then(json =>
        dispatch(receiveAllPatientData(patientID, json))
      );
  };
}

function shouldFetchAllPatientData(state, patientID) {
  const data = state.fhirPatientData.ptData;
  // console.log('from shouldFetchAllPatientData, ', data);
  if (!data) {
    return true;
  } else if (state.fhirPatientData.isFetchingAllPatientData) {
    return false;
  } else {
    // return posts.didInvalidate
  }
}

export function fetchAllPatientDataIfNeeded(patientID) {
  return (dispatch, getState) => {
    if (shouldFetchAllPatientData(getState(), patientID)) {
      // Dispatch a thunk from thunk!
      return dispatch(fetchAllPatientData(patientID));
    }
    // console.log('Didn\'t have to get the data twice');
    // Let the calling code know there's nothing to wait for.
    return Promise.resolve();
  };
}

// get most recent encounter information
export const FETCH_RECENT_ENCOUNTER_REQUEST = 'FETCH_RECENT_ENCOUNTER_REQUEST';
export const FETCH_RECENT_ENCOUNTER_SUCCESS = 'FETCH_RECENT_ENCOUNTER_SUCCESS';
export const FETCH_RECENT_ENCOUNTER_FAILURE = 'FETCH_RECENT_ENCOUNTER_FAILURE';

export const requestMostRecentEcounterData = patientID => ({
  type: FETCH_RECENT_ENCOUNTER_REQUEST,
  patientID
});

export const receiveMostRecentEncounterData = (patientID, json) => ({
  type: FETCH_RECENT_ENCOUNTER_SUCCESS,
  patientID,
  lastVisit: json.entry[0].resource.period.end,
  receivedAt: Date.now()
});

export const failMostRecentEncounterData = patientID => ({
  type: FETCH_RECENT_ENCOUNTER_FAILURE,
  patientID,
  error: 'oops'
});

// https://fhirtest.uhn.ca/baseDstu3/Encounter?subject=182296&_count=1&_sort=date
export function fetchMostRecentEncounterData(patientID) {
  return (dispatch) => {
    dispatch(requestMostRecentEcounterData(patientID));
    const baseUrl = getURL();

    return fetch(baseUrl + '/Encounter?subject=' + patientID + '&_count=1&_sort=date')
      .then(
        response => response.json(),
        error => console.error('An error occured.', error)
      )
      .then(json =>
        dispatch(receiveMostRecentEncounterData(patientID, json))
      );
  };
}


//get observations data

//get most recent observations by code

// https://fhirtest.uhn.ca/baseDstu3/Observation?subject=182296&_count=1&_sort=date&code=2085-9
export const FETCH_RECENT_OBSERVATION_REQUEST = 'FETCH_RECENT_OBSERVATION_REQUEST';
export const FETCH_RECENT_OBSERVATION_SUCCESS = 'FETCH_RECENT_OBSERVATION_SUCCESS';


export const requestMostRecentObsByCode = (patientID, code) => ({
  type: FETCH_RECENT_OBSERVATION_REQUEST,
  patientID,
  code
});

export const receiveMostRecentObsByCode = (patientID, code, data) => ({
  type: FETCH_RECENT_OBSERVATION_SUCCESS,
  patientID,
  code,
  recent_obs: data,
  receivedAt: Date.now()
});

export function fetchMostRecentObsByCode(patientID, code, subcode = null) {
  return (dispatch) => {
    dispatch(requestMostRecentObsByCode(patientID));
    const baseUrl = getURL();
    let url = baseUrl + '/Observation?subject=' + patientID + '&code=' + code + '&_count=1&_sort=date';
    console.log("gettign the call!2", url);
    return fetch(baseUrl + '/Observation?subject=' + patientID + '&code=' + code + '&_count=1&_sort=date')
      .then(
        response => response.json(),
        error => console.error('An error occured.', error)
      )
      .then(function(json){
          console.log("gettign the call!", json);

          let data = {};
          if(json){
            if(json.entry) {
              if(json.entry[0].resource.component){
                
                console.log("in data", json);
                data = json.entry[0].resource.component[0].valueQuantity;
              }
              else
                data = json.entry[0].resource.valueQuantity;
            }
            else
              data = {"unit": "N/A","value": 0};
          } else {
            data = {};
          }
          dispatch(receiveMostRecentObsByCode(patientID, code, data));
        } 
      );
  };
}
