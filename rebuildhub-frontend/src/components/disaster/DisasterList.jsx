import React, { useEffect, useState } from "react";
import { getDisasters } from "../../services/disasterService";
import DisasterCard from "./DisasterCard";
import Loader from "../common/Loader";

const DisasterList = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const res = await getDisasters();
      setDisasters(res.data);
    } catch (err) {
      setError("Failed to load disasters");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="empty-state">{error}</p>;

  return (
    <div className="detail-stack">
      <div className="page-card" style={{ gridColumn: "1 / -1" }}>
        <h2 style={{ marginBottom: 0 }}>All Disasters</h2>
      </div>
      <div className="page-grid page-grid--cards">
        {disasters.map(d => <DisasterCard key={d._id} disaster={d} />)}
      </div>
    </div>
  );
};

export default DisasterList;