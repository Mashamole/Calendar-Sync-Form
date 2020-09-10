/*
[TODO'S]

1) Fix date range picker and time selection (update time for date picker) -> Done
2) fix refresh after form submit - all select boxes are empty 
3) update state event json with state values   -> Done
4) Sync all users calendar events
5) seperate important info into seperate files (for security)
*/

// import PropTypes from 'prop-types';
import React, { Component } from "react";
// import process from "process";
//#############################################
import { DateRangePicker } from "react-dates";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import moment from "moment";
//#############################################

// import "./src/App.css";

const formValid = (formErrors, ...rest) => {
  let valid = true;

  Object.values(formErrors).forEach((val) => val.length > 0 && (valid = false));

  Object.values(rest).forEach((val) => {
    val == null && (valid = false);
  });

  return valid;
};

var gapi = window.gapi;
/*Client Secret: XvPAaGJVZZs2aSJCoC6xMAHb */
var DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
var SCOPES = "https://www.googleapis.com/auth/calendar.events";
var CLIENT_ID = "YOUR CLIENT_ID";
var API_KEY = "YOUR API_KEY";

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventName: null,
      location: null,
      summary: null,
      startTime: "",
      startPOD: "",
      endTime: "",
      endPOD: "",
      foucused: null,
      startDate: moment(),
      endDate: moment(),
      testData: "",
      formErrors: {
        eventName: "",
        location: "",
        summary: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
      },
      dateError: {
        startDate: "",
        endDate: "",
      },
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDatesChange = this.handleDatesChange.bind(this);
    this.handleFocusChange = this.handleFocusChange.bind(this);
    // this.handleTimeChange = this.handleTimeChange.bind(this);
    this.convertTimeFormat = this.convertTimeFormat.bind(this);
  }

  handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    let formErrors = this.state.formErrors;

    switch (name) {
      case "eventName":
        formErrors.eventName =
          value.length < 3 ? "minimum 3 characters required" : "";
        break;
      case "location":
        formErrors.location =
          value.length < 2 && value.length > 0
            ? "minimum 2 characters required or n/a"
            : "";
        break;
      case "summary":
        formErrors.summary =
          value.length > 255 ? "maximum of 255 characters required" : "";
        break;
      case "startTime":
        formErrors.startTime =
          value.length < 4 && value.length > 0
            ? "invalid format (eg) 10:00am"
            : "";
        break;
      case "endTime":
        formErrors.eventTime =
          value.length < 4 && value.length > 0
            ? "invalid format, (eg) 5:00pm"
            : "";
        break;
      default:
        break;
    }

    this.setState({ formErrors, [name]: value }, () => console.log(this.state));
  };

  handleFormSubmit = (e) => {
    e.preventDefault();

    if (formValid(this.state.formErrors)) {
      console.log(`---Submitting---
        Event Name:${this.state.eventName}
        Location:${this.state.location}
        Summary:${this.state.summary}
        Start Date:${this.state.startDate}
        End Date:${this.state.endDate}
        Start Time:${this.state.startTime}
        End Time:${this.state.endTime}
      `);
    } else {
      console.error("Form Invalid - Error Unable to display");
    }
  };

  handleEvent(event, picker) {
    console.log(picker.startDate);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    gapi.load("client:auth2", () => {
      console.log("loaded client");

      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      });
      gapi.client.load("calendar", "v3", () => console.log("It works!"));
      gapi.auth2
        .getAuthInstance()
        .signIn()
        .then(() => {
          console.log("promise in effect");
          var event = {
            summary: this.state.eventName,
            location: this.state.location,
            description: this.state.summary,
            start: {
              dateTime: this.convertTimeFormat(
                this.state.startDate.toISOString(),
                this.state.startTime,
                this.state.startPOD
              ), //this.state.startDate.toISOString(), //"2020-07-28T09:00:00-07:00",
              timeZone: "America/New_York",
            },
            end: {
              // this.state.endDate.toISOString(),
              dateTime: this.convertTimeFormat(
                this.state.endDate.toISOString(),
                this.state.endTime,
                this.state.endPOD
              ),
              // dateTime: "2020-07-28T17:00:00-07:00",
              timeZone: "America/Las_Angeles", //Current Location
            },
            recurrence: ["RRULE:FREQ=DAILY;COUNT=2"],
            attendees: [],
            reminders: {
              useDefault: false,
              overrides: [
                { method: "email", minutes: 2 * 1 },
                { method: "popup", minutes: 1 },
              ],
            },
          };
          console.log(event);
          var request = gapi.client.calendar.events.insert({
            calendarId: "primary",
            resource: event,
          });

          request.execute((event) => {
            // console.log(event);
            window.open(event.htmlLink);
          });
        });
    });
  };

  handleTimeChange = (event) => {
    // event.preventDefault();
    const { name, value } = event.target;
    this.setState({ [name]: value }, () => {
      console.log(this.state.startTime); //this.state.startTime.time);
      console.log(this.state.startPOD);
      console.log(this.state.endTime);
      console.log(this.state.endPOD);
    });
  };

  handleDatesChange({ startDate, endDate }) {
    if (startDate > endDate) {
      console.log("incorrect format");
    } else {
      console.log("correct format");

      this.setState({ startDate: startDate }, () => {
        this.setState({ endDate: endDate }, () => {
          console.log(
            "this is start date " + this.state.startDate.toISOString()
          );
          console.log(this.state.startTime.time);
          console.log("this is end date " + this.state.endDate.toISOString());
          console.log(this.state.endTime.time);
          this.convertTimeFormat(
            this.state.startDate.toISOString(),
            this.state.startTime, // this.state.endTime.time,
            this.state.startPOD
          );
        });
      });
    }
  }
  handleFocusChange = (focusedInput) => {
    this.setState({ focused: focusedInput });
  };

  convertTimeFormat(time, userTime, peroidOfDay) {
    // userTime = "09:35:00.000"; //For testing time only

    if (peroidOfDay === "PM") {
      var t = userTime.split(":", 1);
      var n = Number(t);
      var userTimeSliced = userTime.slice(1);
      var i = 0;
      var iso = "";

      n = n + 12;

      for (i = 0; i < time.length; ++i) {
        if (i < 10) {
          iso += time[i];
        }
      }

      iso = iso + "T" + n + userTimeSliced + ":00-04:00"; //":05+0000"; //":00-04:00"; //":00.000Z"; // use :00.000 if error
      console.log(iso);

      return iso;
    }
    var idx = 0;
    var tsplit = userTime.split(":", 1);
    var hours = Number(tsplit);
    var setIso = "";

    console.log("hours " + tsplit);
    if (hours < 10) {
      userTime = "0" + userTime;
    }
    for (idx = 0; idx < time.length; ++idx) {
      if (idx < 10) {
        setIso += time[idx];
      }
    }
    console.log("usertime" + userTime);
    setIso = setIso + "T" + userTime + ":00-04:00"; // ":00.04:00"; // ":00.000Z"; //:05+0000
    console.log(setIso);

    return setIso;
  }

  render() {
    const { formErrors } = this.state;

    return (
      <div className="wrapper">
        <div className="form-wrapper">
          <h1>Create Calendar Event</h1>
          <form onSubmit={this.handleSubmit} noValidate>
            <div className="eventname">
              <label htmlFor="eventname">Event Name</label>
              <input
                type="text"
                className={formErrors.eventName.length > 0 ? "error" : null}
                placeholder="Event Name"
                name="eventName"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.eventName.length > 3 && (
                <span className="errorMessage"> {formErrors.eventName} </span>
              )}
            </div>
            <div className="location">
              <label htmlFor="Location">Location</label>
              <input
                type="text"
                className={formErrors.location.length > 0 ? "error" : null}
                placeholder="Location"
                name="location"
                noValidate
                onChange={this.handleChange}
              />
            </div>
            {formErrors.location.length > 2 && (
              <span className="errorMessage"> {formErrors.eventName} </span>
            )}
            <div className="summary">
              <label htmlFor="summary">Summary</label>
              <input
                // type="text"
                className="" //{formErrors.summary.length > 0 ? "error" : null}
                placeholder="Summary"
                name="summary"
                noValidate
                onChange={this.handleChange}
              />
            </div>
            {formErrors.summary.length > 255 && (
              <span className="errorMessage"> {formErrors.eventName} </span>
            )}
            <label htmlFor="Date">Date</label>

            <div className="date-range">
              {/* <SingleDatePicker
                date={this.state.date} // momentPropTypes.momentObj or null
                onDateChange={(date) => this.setState({ date })} // PropTypes.func.isRequired
                focused={this.state.focused} // PropTypes.bool
                onFocusChange={({ focused }) => this.setState({ focused })} // PropTypes.func.isRequired
                id="your_unique_id" // PropTypes.string.isRequired,
              /> */}
              <DateRangePicker
                startDate={this.state.startDate} // momentPropTypes.momentObj or null,
                startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                endDate={this.state.endDate} // momentPropTypes.momentObj or null,
                endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                onDatesChange={this.handleDatesChange} // PropTypes.func.isRequired,
                focusedInput={this.state.focused} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                onFocusChange={this.handleFocusChange} // PropTypes.func.isRequired,
                numberOfMonths={1}
                isOutsideRange={() => false}
                showClearDates={false}
                small={false}
              />
            </div>
            {/* {this.state.startDate > this.state.endDate && (
              <span className="errorMessage"> Invalid Date </span>
            )} */}

            <label htmlFor="start time">Start Time</label>
            <div className="times-align">
              <div>
                <select
                  value={this.state.startTime}
                  name="startTime"
                  onChange={this.handleTimeChange}
                >
                  <option value="12:00">12:00</option>
                  <option value="12:15">12:15</option>
                  <option value="12:30">12:30 </option>
                  <option value="1:00">1:00 </option>
                  <option value="1:15">1:15 </option>
                  <option value="1:30">1:30</option>
                  <option value="1:45">1:45</option>
                  <option value="2:00">2:00</option>
                  <option value="2:15">2:15</option>
                  <option value="2:30">2:30</option>
                  <option value="2:45">2:45</option>
                  <option value="3:00">3:00</option>
                  <option value="3:15">3:15</option>
                  <option value="3:30">3:30</option>
                  <option value="3:45">3:45</option>
                  <option value="4:00">4:00</option>
                  <option value="4:15">4:15</option>
                  <option value="4:30">4:30</option>
                  <option value="4:45">4:45</option>
                  <option value="5:00">5:00</option>
                  <option value="5:15">5:15</option>
                  <option value="5:30">5:30</option>
                  <option value="5:45">5:45</option>
                  <option value="6:00">6:00</option>
                  <option value="6:15">6:15</option>
                  <option value="6:30">6:30</option>
                  <option value="6:45">6:45</option>
                  <option value="7:00">7:00</option>
                  <option value="7:15">7:15</option>
                  <option value="7:30">7:30</option>
                  <option value="7:45">7:45</option>
                  <option value="8:00">8:00</option>
                  <option value="8:15">8:15</option>
                  <option value="8:30">8:30</option>
                  <option value="8:45">8:45</option>
                  <option value="9:00">9:00</option>
                  <option value="9:15">9:15</option>
                  <option value="9:30">9:30</option>
                  <option value="9:45">9:45</option>
                  <option value="10:00">10:00</option>
                  <option value="10:15">10:15</option>
                  <option value="10:30">10:30</option>
                  <option value="10:45">10:45</option>
                  <option value="11:00">11:00</option>
                  <option value="11:15">11:15</option>
                  <option value="11:30">11:30</option>
                  <option value="11:45">11:45</option>
                </select>
                <select name="startPOD" onChange={this.handleTimeChange}>
                  <option value="">---</option>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>

              <br />
              <label htmlFor="end time">End Time</label>

              <div>
                <select
                  className="endTimeStyle"
                  value={this.state.endTime}
                  name="endTime"
                  onChange={this.handleTimeChange}
                >
                  <option value="12:00">12:00</option>
                  <option value="12:15">12:15</option>
                  <option value="12:30">12:30 </option>
                  <option value="1:00">1:00 </option>
                  <option value="1:15">1:15 </option>
                  <option value="1:30">1:30</option>
                  <option value="1:45">1:45</option>
                  <option value="2:00">2:00</option>
                  <option value="2:15">2:15</option>
                  <option value="2:30">2:30</option>
                  <option value="2:45">2:45</option>
                  <option value="3:00">3:00</option>
                  <option value="3:15">3:15</option>
                  <option value="3:30">3:30</option>
                  <option value="3:45">3:45</option>
                  <option value="4:00">4:00</option>
                  <option value="4:15">4:15</option>
                  <option value="4:30">4:30</option>
                  <option value="4:45">4:45</option>
                  <option value="5:00">5:00</option>
                  <option value="5:15">5:15</option>
                  <option value="5:30">5:30</option>
                  <option value="5:45">5:45</option>
                  <option value="6:00">6:00</option>
                  <option value="6:15">6:15</option>
                  <option value="6:30">6:30</option>
                  <option value="6:45">6:45</option>
                  <option value="7:00">7:00</option>
                  <option value="7:15">7:15</option>
                  <option value="7:30">7:30</option>
                  <option value="7:45">7:45</option>
                  <option value="8:00">8:00</option>
                  <option value="8:15">8:15</option>
                  <option value="8:30">8:30</option>
                  <option value="8:45">8:45</option>
                  <option value="9:00">9:00</option>
                  <option value="9:15">9:15</option>
                  <option value="9:30">9:30</option>
                  <option value="9:45">9:45</option>
                  <option value="10:00">10:00</option>
                  <option value="10:15">10:15</option>
                  <option value="10:30">10:30</option>
                  <option value="10:45">10:45</option>
                  <option value="11:00">11:00</option>
                  <option value="11:15">11:15</option>
                  <option value="11:30">11:30</option>
                  <option value="11:45">11:45</option>
                </select>
                <select name="endPOD" onChange={this.handleTimeChange}>
                  <option value="">---</option>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            {/* {formErrors.endTime.length < 4 && (
              <span className="errorMessage"> {formErrors.eventName} </span>
            )} */}

            <div className="submit">
              <button type="submit">Submit</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
export default Form;
