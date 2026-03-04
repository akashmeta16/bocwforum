import { useEffect, useState } from "react";
import { loadJson } from "../lib/dataLoader";
import { normalize } from "../lib/utils";

function OfficersPage() {
  const [states, setStates] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [rows, setRows] = useState([]);
  const [stateId, setStateId] = useState("0");
  const [designationId, setDesignationId] = useState("0");

  useEffect(() => {
    let alive = true;

    loadJson("/assets/data/officers.json")
      .then((payload) => {
        if (!alive) return;
        setStates(payload.states || []);
        setDesignations(payload.designations || []);
        setOfficers(payload.officers || []);
        setRows(payload.officers || []);
      })
      .catch((error) => {
        console.error("Unable to load officers data.", error);
      });

    return () => {
      alive = false;
    };
  }, []);

  const handleSearch = () => {
    if (stateId === "0") {
      window.alert("Please select State");
      return;
    }

    if (designationId === "0") {
      window.alert("Please select Designation");
      return;
    }

    const stateLabel = (states.find((item) => String(item.id) === stateId) || {}).item || "";
    const designationLabel = (designations.find((item) => String(item.id) === designationId) || {}).item || "";

    const filtered = officers.filter((row) => {
      return normalize(row.state) === normalize(stateLabel) && normalize(row.designation) === normalize(designationLabel);
    });

    setRows(filtered);
  };

  const handleReset = () => {
    setStateId("0");
    setDesignationId("0");
    setRows(officers);
  };

  return (
    <div className="container-fluid inner-page-wrap">
      <div className="container mt-1 pt-2">
        <div className="white-panel">
          <h5 className="section-title">&nbsp;&nbsp;&nbsp;State Level officer details:</h5>

          <div className="row filter-row">
            <div className="col-md-3 mb-2">
              <select className="form-select form-select-sm" value={stateId} onChange={(event) => setStateId(event.target.value)}>
                <option value="0">Select Here</option>
                {states.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.item}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3 mb-2">
              <select
                className="form-select form-select-sm"
                value={designationId}
                onChange={(event) => setDesignationId(event.target.value)}
              >
                <option value="0">Select Here</option>
                {designations.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.item}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-1 mb-2">
              <button type="button" className="btn btn-sm btn-find w-100" onClick={handleSearch}>
                <i className="fa fa-search" aria-hidden="true" />
                &nbsp;Find
              </button>
            </div>

            <div className="col-md-2 mb-2">
              <button type="button" className="btn btn-sm btn-reset" onClick={handleReset}>
                <i className="fa fa-undo" aria-hidden="true" />
                &nbsp;Reset
              </button>
            </div>
          </div>

          <div className="table-shell">
            <table className="data-table" id="tblofficers">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Office Name</th>
                  <th>Designation</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email Id</th>
                </tr>
              </thead>
              <tbody>
                {!rows.length ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No data found
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={`${row.state}-${row.designation}-${index}`}>
                      <td>{row.state}</td>
                      <td>{row.officeName}</td>
                      <td>{row.designation}</td>
                      <td>{row.name}</td>
                      <td>{row.phone}</td>
                      <td>{row.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficersPage;
