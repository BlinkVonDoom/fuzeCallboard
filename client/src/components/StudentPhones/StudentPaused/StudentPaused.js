import React from "react";
import AgentDisplay from "../.././AgentDisplay/AgentDisplay";

export default class StudentPaused extends React.Component {
  render() {
    let studentPaused = [];
    let studentUnavailable = [];
    this.props.studentQueue.forEach(agent => {
      if (agent.agentStatus === "Paused") {
        studentPaused.push(agent);
      }
      if (agent.agentStatus === "Unavailable") {
        studentUnavailable.push(agent);
      }
    });

    return (
      <div className="cbstats stats6 agentcontainer">
        <table>
          <tbody>
            <tr>
              <td>Paused Agents: </td>
              <td id="st-calls-paused-total">{studentPaused.length} </td>
            </tr>
          </tbody>
        </table>
        <div>
          <table className="calls-paused" id="st-calls-paused">
            {studentPaused.map(agent => {
              return [
                <AgentDisplay
                  key={agent.name}
                  userId={agent.userId}
                  statusTimer={agent.statusChangeTime}
                  callsTaken={agent.callsTaken}
                  penalty={agent.penalty}
                />
              ];
            })}
          </table>
        </div>
        <div>
          <table className="calls-offline" id="st-calls-offline">
            {studentUnavailable.map(agent => {
              return [
                <AgentDisplay
                  key={agent.name}
                  userId={agent.userId}
                  statusTimer={agent.statusChangeTime}
                  callsTaken={agent.callsTaken}
                  penalty={agent.penalty}
                />
              ];
            })}
          </table>
        </div>
      </div>
    );
  }
}
