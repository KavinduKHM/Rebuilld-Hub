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
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>All Disasters</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {disasters.map(d => <DisasterCard key={d._id} disaster={d} />)}
      </div>
    </div>
  );
};

export default DisasterList;