import { useEffect, useState } from "react";
import { loadJson } from "../lib/dataLoader";
import { normalize } from "../lib/utils";

function ResourcesPage() {
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [rows, setRows] = useState([]);
  const [stateId, setStateId] = useState("0");
  const [categoryId, setCategoryId] = useState("0");
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    let alive = true;

    loadJson("/assets/data/resources.json")
      .then((payload) => {
        if (!alive) return;
        setStates(payload.states || []);
        setCategories(payload.resourceCategories || []);
        setResources(payload.resources || []);
        setRows(payload.resources || []);
      })
      .catch((error) => {
        console.error("Unable to load resources data.", error);
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

    if (categoryId === "0") {
      window.alert("Please select Category");
      return;
    }

    const stateLabel = (states.find((item) => String(item.id) === stateId) || {}).item || "";
    const categoryLabel = (categories.find((item) => String(item.id) === categoryId) || {}).item || "";

    const filtered = resources.filter((row) => {
      return normalize(row.state) === normalize(stateLabel) && normalize(row.category) === normalize(categoryLabel);
    });

    setRows(filtered);
  };

  const handleReset = () => {
    setStateId("0");
    setCategoryId("0");
    setRows(resources);
  };

  return (
    <div className="container-fluid inner-page-wrap">
      <div className="container mt-0 pt-2">
        <div className="white-panel">
          <p className="mb-1">This page is a repository of acts, policies, guidelines and other relevant documents.</p>
          <p className="mb-2">BOCW discussion members can upload relevant document and browse and review already uploaded documents.</p>

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
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                <option value="0">Select Here</option>
                {categories.map((item) => (
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
            <table className="data-table" id="tblResources">
              <thead>
                <tr>
                  <th>View</th>
                  <th>Doc Id</th>
                  <th>State</th>
                  <th>Doc Name</th>
                  <th>Category</th>
                  <th>Upload By</th>
                  <th>Update Date</th>
                </tr>
              </thead>
              <tbody>
                {!rows.length ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No data found
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td className="text-center">
                        <button type="button" className="btn btn-sm view-btn" onClick={() => setSelectedResource(row)}>
                          <i className="fa fa-eye" aria-hidden="true" />
                          <span className="visually-hidden">View</span>
                        </button>
                      </td>
                      <td>{row.docId}</td>
                      <td>{row.state}</td>
                      <td>{row.docName}</td>
                      <td>{row.category}</td>
                      <td>{row.uploadBy}</td>
                      <td>{row.updateDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedResource && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setSelectedResource(null)} />
          <div className="modal fade show d-block" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-scrollable modal-wide">
              <div className="modal-content">
                <div className="card mb-0">
                  <div className="card-header pb-3 pt-3 d-flex justify-content-between align-items-center">
                    <h5 className="modal-title mb-0">{selectedResource.docName}</h5>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedResource(null)}>
                      Close
                    </button>
                  </div>
                  <div className="card-body pt-2 pb-2">
                    <iframe className="doc-frame" src={selectedResource.iframeUrl} title={selectedResource.docName} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ResourcesPage;
