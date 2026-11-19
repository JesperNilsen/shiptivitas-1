import React from 'react';
import Dragula from 'dragula';
import 'dragula/dist/dragula.css';
import Swimlane from './Swimlane';
import { LANES, initialLanes, moveClient } from './boardState';
import './Board.css';

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clients: initialLanes(this.getClients()),
    };
    this.swimlanes = {};
    LANES.forEach(lane => { this.swimlanes[lane.key] = React.createRef(); });
  }

  componentDidMount() {
    this.drake = Dragula(LANES.map(lane => this.swimlanes[lane.key].current));
    this.drake.on('drop', (el, target, source, sibling) => this.handleDrop(el, target, sibling));
  }

  componentWillUnmount() {
    this.drake.destroy();
  }

  // Dragula has already moved the DOM node. Read where it landed, put the DOM back
  // with cancel(true), then let React re-render from state, so React stays the only
  // owner of the DOM. Order matters: setState outside a React event renders
  // synchronously, and it must not run against Dragula's moved nodes.
  handleDrop(el, target, sibling) {
    const lane = LANES.find(l => this.swimlanes[l.key].current === target);
    const clientId = el.dataset.id;
    const beforeId = sibling ? sibling.dataset.id : null;
    this.drake.cancel(true);
    if (!lane) return;
    this.setState(state => ({
      clients: moveClient(state.clients, clientId, lane.key, beforeId),
    }));
  }

  getClients() {
    return [
      ['1','Stark, White and Abbott','Cloned Optimal Architecture', 'in-progress'],
      ['2','Wiza LLC','Exclusive Bandwidth-Monitored Implementation', 'complete'],
      ['3','Nolan LLC','Vision-Oriented 4Thgeneration Graphicaluserinterface', 'backlog'],
      ['4','Thompson PLC','Streamlined Regional Knowledgeuser', 'in-progress'],
      ['5','Walker-Williamson','Team-Oriented 6Thgeneration Matrix', 'in-progress'],
      ['6','Boehm and Sons','Automated Systematic Paradigm', 'backlog'],
      ['7','Runolfsson, Hegmann and Block','Integrated Transitional Strategy', 'backlog'],
      ['8','Schumm-Labadie','Operative Heuristic Challenge', 'backlog'],
      ['9','Kohler Group','Re-Contextualized Multi-Tasking Attitude', 'backlog'],
      ['10','Romaguera Inc','Managed Foreground Toolset', 'backlog'],
      ['11','Reilly-King','Future-Proofed Interactive Toolset', 'complete'],
      ['12','Emard, Champlin and Runolfsdottir','Devolved Needs-Based Capability', 'backlog'],
      ['13','Fritsch, Cronin and Wolff','Open-Source 3Rdgeneration Website', 'complete'],
      ['14','Borer LLC','Profit-Focused Incremental Orchestration', 'backlog'],
      ['15','Emmerich-Ankunding','User-Centric Stable Extranet', 'in-progress'],
      ['16','Willms-Abbott','Progressive Bandwidth-Monitored Access', 'in-progress'],
      ['17','Brekke PLC','Intuitive User-Facing Customerloyalty', 'complete'],
      ['18','Bins, Toy and Klocko','Integrated Assymetric Software', 'backlog'],
      ['19','Hodkiewicz-Hayes','Programmable Systematic Securedline', 'backlog'],
      ['20','Murphy, Lang and Ferry','Organized Explicit Access', 'backlog'],
    ].map(companyDetails => ({
      id: companyDetails[0],
      name: companyDetails[1],
      description: companyDetails[2],
      status: companyDetails[3],
    }));
  }
  renderSwimlane(name, clients, ref) {
    return (
      <Swimlane name={name} clients={clients} dragulaRef={ref}/>
    );
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            {LANES.map(lane => (
              <div className="col-md-4" key={lane.key}>
                {this.renderSwimlane(lane.title, this.state.clients[lane.key], this.swimlanes[lane.key])}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
