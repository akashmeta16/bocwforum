import { useEffect, useMemo, useState } from "react";
import { loadRemoteTopicDetails, saveDiscussionComment } from "../firebase";
import { loadJson } from "../lib/dataLoader";
import { formatDate, normalize, parseDate } from "../lib/utils";

function normalizeTopicDetails(raw) {
  const details = {};

  Object.keys(raw || {}).forEach((topicId) => {
    const topic = raw[topicId] || {};
    const comments = Array.isArray(topic.comments) ? topic.comments : [];

    details[String(topicId)] = {
      comments: comments
        .map((comment) => {
          if (!comment || typeof comment !== "object") return null;

          const name = String(comment.name || "").trim();
          const text = String(comment.text || "").trim();
          if (!name || !text) return null;

          const createdAt = Number.isFinite(Number(comment.createdAt))
            ? Number(comment.createdAt)
            : parseDate(comment.date) || Date.now();

          return {
            name,
            text,
            date: String(comment.date || formatDate(createdAt)),
            createdAt
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.createdAt - b.createdAt)
    };
  });

  return details;
}

function applyDiscussionFilter(rows, states, categories, stateId, categoryId) {
  const stateLabel = (states.find((item) => String(item.id) === stateId) || {}).item || "";
  const categoryLabel = (categories.find((item) => String(item.id) === categoryId) || {}).item || "";

  return rows.filter((row) => {
    return normalize(row.state) === normalize(stateLabel) && normalize(row.category) === normalize(categoryLabel);
  });
}

function DiscussionPage() {
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicDetails, setTopicDetails] = useState({});
  const [rows, setRows] = useState([]);
  const [stateId, setStateId] = useState("0");
  const [categoryId, setCategoryId] = useState("0");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [addedBy, setAddedBy] = useState("");

  useEffect(() => {
    let alive = true;

    loadJson("/assets/data/discussion.json")
      .then((payload) => {
        if (!alive) return;

        setStates(payload.states || []);
        setCategories(payload.topicCategories || []);
        setTopics(payload.topics || []);
        setTopicDetails(normalizeTopicDetails(payload.topicDetails || {}));
      })
      .catch((error) => {
        console.error("Unable to load discussion data.", error);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    loadRemoteTopicDetails()
      .then((remoteDetails) => {
        if (!alive) return;

        setTopicDetails((prev) => ({
          ...prev,
          ...remoteDetails
        }));
      })
      .catch((error) => {
        console.error("Unable to load discussion comments from Firebase.", error);
      });

    return () => {
      alive = false;
    };
  }, []);

  const topicSummaries = useMemo(() => {
    return topics.map((topic) => {
      const comments = (topicDetails[String(topic.id)] || {}).comments || [];
      const lastComment = comments.length ? comments[comments.length - 1] : null;

      return {
        ...topic,
        noOfComments: String(comments.length),
        lastCommentDate: lastComment ? String(lastComment.date) : ""
      };
    });
  }, [topics, topicDetails]);

  useEffect(() => {
    if (!topicSummaries.length) {
      setRows([]);
      return;
    }

    if (filtersApplied && stateId !== "0" && categoryId !== "0") {
      setRows(applyDiscussionFilter(topicSummaries, states, categories, stateId, categoryId));
      return;
    }

    setRows(topicSummaries);
  }, [topicSummaries, filtersApplied, stateId, categoryId, states, categories]);

  const activeTopic = useMemo(() => {
    if (!showTopicModal || activeTopicId === null) return null;
    return topicSummaries.find((row) => Number(row.id) === Number(activeTopicId)) || null;
  }, [showTopicModal, activeTopicId, topicSummaries]);

  const activeComments = activeTopic ? (topicDetails[String(activeTopic.id)] || {}).comments || [] : [];

  const openTopicModal = (topicId) => {
    setActiveTopicId(Number(topicId));
    setCommentText("");
    setAddedBy("");
    setShowTopicModal(true);
  };

  const closeTopicModal = () => {
    setShowTopicModal(false);
    setActiveTopicId(null);
    setCommentText("");
    setAddedBy("");
  };

  const handleSearch = () => {
    if (stateId === "0") {
      window.alert("Please select State");
      return;
    }

    if (categoryId === "0") {
      window.alert("Please select Category");
      return;
    }

    setFiltersApplied(true);
  };

  const handleReset = () => {
    setStateId("0");
    setCategoryId("0");
    setFiltersApplied(false);
  };

  const handleAddComment = async () => {
    if (!activeTopic) return;

    const author = addedBy.trim();
    const text = commentText.trim();

    if (!author) {
      window.alert("Please Enter your name");
      return;
    }

    if (!text) {
      window.alert("Please Enter your Comments");
      return;
    }

    const now = new Date();
    const comment = {
      name: author,
      text,
      date: formatDate(now),
      createdAt: now.getTime()
    };

    const topicKey = String(activeTopic.id);

    setTopicDetails((prev) => {
      const current = (prev[topicKey] || {}).comments || [];
      return {
        ...prev,
        [topicKey]: {
          comments: [...current, comment]
        }
      };
    });

    setCommentText("");
    setAddedBy("");

    try {
      await saveDiscussionComment(activeTopic.id, comment);
    } catch (error) {
      console.error("Unable to save comment to Firebase.", error);

      setTopicDetails((prev) => {
        const current = (prev[topicKey] || {}).comments || [];
        return {
          ...prev,
          [topicKey]: {
            comments: current.filter((item) => item.createdAt !== comment.createdAt)
          }
        };
      });

      window.alert("Unable to save comment right now. Please try again.");
    }
  };

  return (
    <div className="container-fluid inner-page-wrap">
      <div className="container mt-0 pt-2">
        <div className="white-panel">
          <h5 className="section-title">&nbsp;&nbsp;&nbsp;Discussion</h5>

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
            <table className="data-table" id="tblDiscussion">
              <thead>
                <tr>
                  <th>Topic No</th>
                  <th>State</th>
                  <th>Topic Name</th>
                  <th>Category</th>
                  <th>Created By</th>
                  <th>Created Date</th>
                  <th>No of Comments</th>
                  <th>Last Comment date</th>
                </tr>
              </thead>
              <tbody>
                {!rows.length ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No data found
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.topicNo}</td>
                      <td>{row.state}</td>
                      <td>
                        <button type="button" className="topic-link" onClick={() => openTopicModal(row.id)}>
                          {row.topicName}
                        </button>
                      </td>
                      <td>{row.category}</td>
                      <td>{row.createdBy}</td>
                      <td className="text-center">{row.createdDate}</td>
                      <td className="text-center">{row.noOfComments}</td>
                      <td className="text-center">{row.lastCommentDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showTopicModal && activeTopic && (
        <>
          <div className="modal-backdrop fade show" onClick={closeTopicModal} />
          <div className="modal fade show d-block" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-scrollable modal-wide">
              <div className="modal-content">
                <div className="container-fluid px-0 mb-0 mt-1">
                  <div className="container mt-0 pt-0 pb-2">
                    <div className="row justify-content-start topic-modal-inner">
                      <div className="row mb-2">
                        <div className="col-12 d-flex justify-content-between align-items-center">
                          <label className="control-label mb-1 topic-modal-label">Topic Name</label>
                          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={closeTopicModal}>
                            Close
                          </button>
                        </div>
                        <div className="col-12">
                          <input className="form-control" type="text" readOnly value={activeTopic.topicName} />
                        </div>
                      </div>

                      <div className="row mb-2">
                        <div className="col-md-4">
                          <label className="control-label mb-1 topic-modal-label">Category</label>
                          <input className="form-control" type="text" readOnly value={activeTopic.category} />
                        </div>
                        <div className="col-md-4">
                          <label className="control-label mb-1 topic-modal-label">AddedBy</label>
                          <input className="form-control" type="text" readOnly value={activeTopic.createdBy} />
                        </div>
                        <div className="col-md-4">
                          <label className="control-label mb-1 topic-modal-label">Added On</label>
                          <input className="form-control" type="text" readOnly value={activeTopic.createdDate} />
                        </div>
                      </div>

                      <div className="row mb-2">
                        <div className="col-12 table-shell">
                          <table className="comment-table">
                            <tbody>
                              {!activeComments.length ? (
                                <tr>
                                  <td colSpan="2" className="text-center">
                                    No comments available
                                  </td>
                                </tr>
                              ) : (
                                activeComments.map((comment, index) => (
                                  <tr key={`${comment.createdAt}-${index}`}>
                                    <td className="comment-meta">
                                      Name : {comment.name}
                                      <br />
                                      Date : {comment.date}
                                    </td>
                                    <td>{comment.text}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-8 mb-2">
                          <label className="control-label mb-1 topic-modal-label">Comments</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={commentText}
                            onChange={(event) => setCommentText(event.target.value)}
                          />
                        </div>
                        <div className="col-md-3 mb-2">
                          <label className="control-label mb-1 topic-modal-label">Added By</label>
                          <input
                            className="form-control"
                            type="text"
                            value={addedBy}
                            onChange={(event) => setAddedBy(event.target.value)}
                          />
                        </div>
                        <div className="col-md-1 mb-2 d-flex align-items-end topic-add-wrap">
                          <button type="button" className="btn btn-sm btn-add-comment mt-2" onClick={handleAddComment}>
                            <i className="fa fa-plus" aria-hidden="true" />
                            &nbsp;Add
                          </button>
                        </div>
                      </div>
                    </div>
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

export default DiscussionPage;
