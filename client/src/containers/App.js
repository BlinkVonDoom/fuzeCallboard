import React, { Component } from "react";
import "./App.css";

import StudentPhones from ".././components/StudentPhones/StudentPhones";
import AdminPhones from ".././components/AdminPhones/AdminPhones";

require("dotenv").config();
const axios = require("axios");

class App extends Component {
  constructor() {
    super();
    this.state = {
      agents: [],
      adminQueue: [],
      adminCallsWaiting: 0,
      adminWaitTime: 0,
      adminActiveAgents: 0,
      adminCallsCompleted: 0,
      adminCallsAbandoned: 0,
      adminSLA: 0,
      studentQueue: [],
      studentCallsWaiting: 0,
      studentWaitTime: 0,
      studentActiveAgents: 0,
      studentCallsCompleted: 0,
      studentCallsAbandoned: 0,
      studentSLA: 0
    };
  }

  // makes api calls to server, where data is stored
  getAgents = async () => {
    const res = await axios.get("/api/getAgents");
    const response = res.data;
    this.setState({ agents: response.agentEvents });
  };

  getAdminQueue = async () => {
    const res = await axios.get("/api/adminQueue");
    const response = res.data;
    let adminWaitTime = response.maxWaiting;
    let temp = response.members;

    let adminQueue = [...this.state.adminQueue];

    temp.forEach(el => {
      let name = el.name.substr(4);
      el.name = name;
      el.status = this.getStatus(el);
    });

    temp.forEach(agent => {
      let admin = adminQueue.find(el => {
        return el.name === agent.name;
      });

      if (!admin) {
        let statusTime = Math.round(new Date().getTime() / 1000);
        agent.statusChangeTime = statusTime;
        if (agent.callsTaken === 0) {
          agent.statusTimer = "—   ";
        }
        adminQueue.push(agent);
      }

      if (admin) {
        if (admin.status !== agent.status) {
          let statusTime = Math.round(new Date().getTime() / 1000);
          admin.statusChangeTime = statusTime;
          admin.status = agent.status;
          if (admin.callsTaken === 0) {
            admin.statusTimer = "—   ";
          }
        }
      }
    });

    this.setState({
      adminQueue: adminQueue,
      adminCallsWaiting: response.callsWaiting,
      adminWaitTime: response.maxWaiting,
      adminCallsCompleted: response.numCompleted,
      adminCallsAbandoned: response.numAbandoned,
      adminSLA: response.serviceLevelPerf
    });
  };

  getStudentQueue = async () => {
    const res = await axios.get("/api/studentQueue");
    const response = res.data;
    let studentWaitTime = response.maxWaiting;
    let temp = response.members;

    let studentQueue = [...this.state.studentQueue];

    temp.forEach(el => {
      let name = el.name.substr(4);
      el.name = name;
      el.status = this.getStatus(el);
    });

    temp.forEach(agent => {
      let student = studentQueue.find(el => {
        return el.name === agent.name;
      });

      if (!student) {
        let statusTime = Math.round(new Date().getTime() / 1000);
        agent.statusChangeTime = statusTime;
        if (agent.callsTaken === 0) {
          agent.statusTimer = "—   ";
        }
        studentQueue.push(agent);
      }

      if (student) {
        if (student.status !== agent.status) {
          let statusTime = Math.round(new Date().getTime() / 1000);
          student.statusChangeTime = statusTime;
          student.status = agent.status;
          if (student.callsTaken === 0) {
            student.statusTimer = "—   ";
          }
        }
      }
    });
    this.setState({
      studentQueue: studentQueue,
      studentCallsWaiting: response.callsWaiting,
      studentWaitTime: response.maxWaiting,
      studentCallsCompleted: response.numCompleted,
      studentCallsAbandoned: response.numAbandoned,
      studentSLA: response.serviceLevelPerf
    });
  };

  replaceNames = () => {
    // replaces names from admin/ student q with less crap ones
    this.state.agents.forEach(agent => {
      let peerName = agent.peerName;
      let toChange = "";
      if (agent.userId.includes(".instru")) {
        toChange = agent.userId.replace(".instru", "");
      } else if (agent.userId.includes("@instructure")) {
        toChange = agent.userId.replace("@instructure.com", "");
      } else {
        toChange = agent.userId;
      }

      this.state.adminQueue.forEach(admin => {
        let agentName = admin.name;
        if (peerName === agentName) {
          return (admin.userId = toChange);
        }
      });
      this.state.studentQueue.forEach(student => {
        let agentName = student.name;
        if (peerName === agentName) {
          return (student.userId = toChange);
        }
      });
    });
  };

  getStatus(agent) {
    // status codes
    // 1: "Available";
    // 2: "On a Call";
    // 3: "Busy";
    // 4: "Invalid";
    // 5: "Unavailable";
    // 6: "Ringing";
    // 7: "Ringing";
    // 8: "On Hold";

    // paused status comes from paused param
    // paused param is a boolean

    if (agent.status === 1 && agent.paused === false) {
      return (agent.status = "Available");
    }
    if (agent.status === 2 && agent.paused === false) {
      return (agent.status = "On a Call");
    }

    if (agent.paused === true && agent.status !== 5) {
      return (agent.status = "Paused");
    }
    if (agent.status === 5) {
      return (agent.status = "Unavailable");
    }
  }

  componentDidMount() {
    let getStats = () => {
      this.getAgents();
      this.getAdminQueue();
      this.getStudentQueue();
    };

    setInterval(() => getStats(), 5000);
  }

  render() {
    this.replaceNames();
    return (
      <div className="grid-container">
        <StudentPhones
          studentCallsWaiting={this.state.studentCallsWaiting}
          studentWaitTime={this.state.studentWaitTime}
          studentCallsCompleted={this.state.studentCallsCompleted}
          studentSLA={this.state.studentSLA}
          studentQueue={this.state.studentQueue}
        />

        <AdminPhones
          adminCallsWaiting={this.state.adminCallsWaiting}
          adminWaitTime={this.state.adminWaitTime}
          adminCallsCompleted={this.state.adminCallsCompleted}
          adminSLA={this.state.adminSLA}
          adminQueue={this.state.adminQueue}
        />
        <div className="item3">
          {" "}
          <div className="row-title">Chats</div>
          <div className="stats">
            <div className="cbstats stats1">
              Queued <div className="queuestats" id="at-queuedchats" />
            </div>
            <div className="cbstats stats2">
              Wait Time <div className="queuestats" id="at-chat-waittime" />
            </div>
            <div className="cbstats stats3">
              Active Chats <div className="queuestats" id="at-activechats" />
            </div>
            <div className="cbstats stats4">
              SLA <div className="queuestats" id="at-chat-sla" />
            </div>
            <div className="cbstats stats5 agentcontainer">
              <table>
                <tbody>
                  <tr>
                    <td>Available:</td>
                    <td id="st-chats-available-total" />
                  </tr>
                </tbody>
              </table>
              <div>
                <table className="chats-active" id="st-chats-available">
                  <tbody>
                    <tr>
                      <td>Test Agent</td>
                      <td>10:15</td>
                      <td>32</td>
                    </tr>
                    <tr>
                      <td>Test Agent</td>
                      <td>10:15</td>
                      <td>32</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="cbstats stats6 agentcontainer">
              <table>
                <tbody>
                  <tr>
                    <td>Paused:</td>
                    <td id="st-chats-paused-total" />
                  </tr>
                </tbody>
              </table>
              <div>
                <table className="chats-paused" id="st-chats-paused">
                  <tbody>
                    <tr>
                      <td>Test Agent</td>
                      <td>10:15</td>
                      <td>32</td>
                    </tr>
                    <tr>
                      <td>Test Agent</td>
                      <td>10:15</td>
                      <td>32</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
