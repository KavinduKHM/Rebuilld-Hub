import React from "react";
import DisasterList from "../../components/disaster/DisasterList";

const DisasterPage = () => {
  return (
    <div className="page-shell">
      <div className="container container--wide">
        <DisasterList />
      </div>
    </div>
  );
};

export default DisasterPage;