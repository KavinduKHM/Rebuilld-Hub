import React from "react";
import DisasterList from "../../components/disaster/DisasterList";
import { Link } from "react-router-dom";

const DisasterPage = () => {
  return (
    <div>
      <Link to="/disasters/new"><button>Report New Disaster</button></Link>
      <DisasterList />
    </div>
  );
};

export default DisasterPage;