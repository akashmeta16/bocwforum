(function () {
  const data = window.BOCW_DATA || {};
  if (!data.topicDetails) data.topicDetails = {};
  const firebaseConfig = {
    apiKey: "AIzaSyAGFYOXC6qjkCHoFuh8NfOqf9AdBv3Y9pA",
    authDomain: "bocwforum-260304144119.firebaseapp.com",
    databaseURL: "https://bocwforum-260304144119-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bocwforum-260304144119",
    storageBucket: "bocwforum-260304144119.firebasestorage.app",
    messagingSenderId: "171305984465",
    appId: "1:171305984465:web:14d66c8045803baaa180f0"
  };
  let discussionDatabase = null;
  const pageDataSources = {
    officers: "assets/data/officers.json",
    resources: "assets/data/resources.json",
    discussion: "assets/data/discussion.json",
    gallery: "assets/data/gallery.json"
  };

  function currentPage() {
    return document.body.getAttribute("data-page") || "";
  }

  function mergePageData(payload) {
    if (!payload || typeof payload !== "object") return;
    Object.keys(payload).forEach(function (key) {
      data[key] = payload[key];
    });
    if (!data.topicDetails) data.topicDetails = {};
  }

  function loadDataForPage(page) {
    const source = pageDataSources[page];
    if (!source) return Promise.resolve();

    return fetch(source, { cache: "force-cache" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load page data: " + response.status);
        }
        return response.json();
      })
      .then(function (payload) {
        mergePageData(payload);
      })
      .catch(function (error) {
        console.error("Unable to load page data file.", error);
      });
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showWarning(message) {
    window.alert(message);
  }

  function hideSpinner() {
    const spinner = byId("spinner");
    if (!spinner) return;
    window.addEventListener("load", function () {
      setTimeout(function () {
        spinner.classList.remove("show");
      }, 250);
    });
  }

  function setActiveNav() {
    const page = document.body.getAttribute("data-page");
    const links = document.querySelectorAll(".main-navbar .nav-link[data-page]");
    links.forEach(function (link) {
      if (link.getAttribute("data-page") === page) {
        link.classList.add("active");
      }
    });
  }

  function setSelectOptions(selectId, items, title) {
    const select = byId(selectId);
    if (!select) return;
    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "0";
    placeholder.textContent = "Select Here";
    select.appendChild(placeholder);

    (items || []).forEach(function (item) {
      const option = document.createElement("option");
      option.value = String(item.id);
      option.textContent = item.item;
      select.appendChild(option);
    });
  }

  function initSumoSelect(selectId, title) {
    if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.SumoSelect) return;
    const $el = window.jQuery(selectId);
    if (!$el.length) return;
    if ($el[0].sumo) {
      $el[0].sumo.unload();
    }
    $el.SumoSelect({
      isClickAwayOk: true,
      selectAll: false,
      search: true,
      searchText: "Search " + title,
      captionFormatAllSelected: "{0} All " + title,
      csvDispCount: 3,
      showTitle: false
    });
  }

  function selectedOptionText(selectId) {
    const select = byId(selectId);
    if (!select) return "";
    const idx = select.selectedIndex;
    if (idx < 0) return "";
    return (select.options[idx] && select.options[idx].textContent) || "";
  }

  function getDiscussionDatabase() {
    if (discussionDatabase) return discussionDatabase;
    if (!window.firebase || !window.firebase.initializeApp || !window.firebase.database) return null;
    if (!window.firebase.apps || !window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
    }
    discussionDatabase = window.firebase.database();
    return discussionDatabase;
  }

  function renderOfficers(rows) {
    const tbody = byId("officersBody");
    if (!tbody) return;

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No data found</td></tr>';
      return;
    }

    tbody.innerHTML = rows
      .map(function (row) {
        return (
          "<tr>" +
          "<td>" + escapeHtml(row.state) + "</td>" +
          "<td>" + escapeHtml(row.officeName) + "</td>" +
          "<td>" + escapeHtml(row.designation) + "</td>" +
          "<td>" + escapeHtml(row.name) + "</td>" +
          "<td>" + escapeHtml(row.phone) + "</td>" +
          "<td>" + escapeHtml(row.email) + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function initOfficersPage() {
    if (document.body.getAttribute("data-page") !== "officers") return;

    setSelectOptions("ddlstate", data.states, "State");
    setSelectOptions("ddlDesignation", data.designations, "Designation");
    initSumoSelect("#ddlstate", "State");
    initSumoSelect("#ddlDesignation", "Designation");

    renderOfficers(data.officers || []);

    byId("btnsearch").addEventListener("click", function () {
      const stateId = byId("ddlstate").value;
      const designationId = byId("ddlDesignation").value;

      if (stateId === "0") {
        showWarning("Please select State");
        return;
      }
      if (designationId === "0") {
        showWarning("Please select Designation");
        return;
      }

      const stateText = selectedOptionText("ddlstate");
      const designationText = selectedOptionText("ddlDesignation");

      const filtered = (data.officers || []).filter(function (row) {
        return normalize(row.state) === normalize(stateText) && normalize(row.designation) === normalize(designationText);
      });

      renderOfficers(filtered);
    });

    byId("btnReset").addEventListener("click", function () {
      window.location.reload();
    });
  }

  function renderResources(rows) {
    const tbody = byId("resourcesBody");
    if (!tbody) return;

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No data found</td></tr>';
      return;
    }

    tbody.innerHTML = rows
      .map(function (row) {
        return (
          "<tr>" +
          '<td class="text-center">' +
          '<button type="button" class="btn btn-sm view-btn" data-resource-id="' +
          escapeHtml(row.id) +
          '"><i class="fa fa-eye" aria-hidden="true"></i></button>' +
          "</td>" +
          "<td>" + escapeHtml(row.docId) + "</td>" +
          "<td>" + escapeHtml(row.state) + "</td>" +
          "<td>" + escapeHtml(row.docName) + "</td>" +
          "<td>" + escapeHtml(row.category) + "</td>" +
          "<td>" + escapeHtml(row.uploadBy) + "</td>" +
          "<td>" + escapeHtml(row.updateDate) + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function openResourceModal(resourceId) {
    const item = (data.resources || []).find(function (row) {
      return Number(row.id) === Number(resourceId);
    });
    if (!item) return;

    byId("resourceModalTitle").textContent = item.docName;
    byId("resourceFrame").src = item.iframeUrl;

    const modal = new bootstrap.Modal(byId("resourceModal"));
    modal.show();
  }

  function initResourcesPage() {
    if (document.body.getAttribute("data-page") !== "resources") return;

    setSelectOptions("ddlstate", data.states, "State");
    setSelectOptions("ddlCategory", data.resourceCategories, "Category");
    initSumoSelect("#ddlstate", "State");
    initSumoSelect("#ddlCategory", "Category");

    renderResources(data.resources || []);

    byId("btnsearch").addEventListener("click", function () {
      const stateId = byId("ddlstate").value;
      const categoryId = byId("ddlCategory").value;

      if (stateId === "0") {
        showWarning("Please select State");
        return;
      }
      if (categoryId === "0") {
        showWarning("Please select Category");
        return;
      }

      const stateText = selectedOptionText("ddlstate");
      const categoryText = selectedOptionText("ddlCategory");

      const filtered = (data.resources || []).filter(function (row) {
        return normalize(row.state) === normalize(stateText) && normalize(row.category) === normalize(categoryText);
      });

      renderResources(filtered);
    });

    byId("btnReset").addEventListener("click", function () {
      window.location.reload();
    });

    byId("resourcesBody").addEventListener("click", function (event) {
      const button = event.target.closest("[data-resource-id]");
      if (!button) return;
      openResourceModal(button.getAttribute("data-resource-id"));
    });

    byId("resourceModal").addEventListener("hidden.bs.modal", function () {
      byId("resourceFrame").src = "";
    });
  }

  function renderDiscussionRows(rows) {
    const tbody = byId("discussionBody");
    if (!tbody) return;

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No data found</td></tr>';
      return;
    }

    tbody.innerHTML = rows
      .map(function (row) {
        return (
          "<tr>" +
          "<td>" + escapeHtml(row.topicNo) + "</td>" +
          "<td>" + escapeHtml(row.state) + "</td>" +
          '<td><button type="button" class="topic-link" data-topic-id="' +
          escapeHtml(row.id) +
          '">' +
          escapeHtml(row.topicName) +
          "</button></td>" +
          "<td>" + escapeHtml(row.category) + "</td>" +
          "<td>" + escapeHtml(row.createdBy) + "</td>" +
          '<td class="text-center">' + escapeHtml(row.createdDate) + "</td>" +
          '<td class="text-center">' + escapeHtml(row.noOfComments) + "</td>" +
          '<td class="text-center">' + escapeHtml(row.lastCommentDate) + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function ensureTopicComments(topicId) {
    const key = String(topicId);
    if (!data.topicDetails[key]) {
      data.topicDetails[key] = { comments: [] };
    }
    if (!Array.isArray(data.topicDetails[key].comments)) {
      data.topicDetails[key].comments = [];
    }
    return data.topicDetails[key].comments;
  }

  function normalizeCommentRecord(record) {
    if (!record || typeof record !== "object") return null;

    const name = String(record.name || "").trim();
    const text = String(record.text || "").trim();
    if (!name || !text) return null;

    let createdAt = Number(record.createdAt);
    if (!Number.isFinite(createdAt)) {
      const parsed = Date.parse(record.date);
      createdAt = Number.isFinite(parsed) ? parsed : Date.now();
    }

    return {
      name: name,
      text: text,
      date: String(record.date || formatDate(new Date(createdAt))),
      createdAt: createdAt
    };
  }

  function syncTopicSummary(topicId) {
    const comments = ensureTopicComments(topicId);
    const topic = (data.topics || []).find(function (row) {
      return Number(row.id) === Number(topicId);
    });
    if (!topic) return;

    topic.noOfComments = String(comments.length);
    topic.lastCommentDate = comments.length ? String(comments[comments.length - 1].date || "") : "";
  }

  function syncAllTopicSummaries() {
    (data.topics || []).forEach(function (row) {
      syncTopicSummary(row.id);
    });
  }

  function loadDiscussionFromFirebase() {
    const db = getDiscussionDatabase();
    if (!db) return Promise.resolve(false);

    return db
      .ref("discussion/topicDetails")
      .once("value")
      .then(function (snapshot) {
        const remoteTopicDetails = snapshot.val() || {};
        Object.keys(remoteTopicDetails).forEach(function (topicId) {
          const remoteTopic = remoteTopicDetails[topicId] || {};
          const remoteComments = remoteTopic.comments || {};
          const commentList = Object.keys(remoteComments)
            .map(function (commentId) {
              return normalizeCommentRecord(remoteComments[commentId]);
            })
            .filter(Boolean)
            .sort(function (a, b) {
              return a.createdAt - b.createdAt;
            });

          data.topicDetails[String(topicId)] = { comments: commentList };
        });
        syncAllTopicSummaries();
        return true;
      })
      .catch(function (error) {
        console.error("Unable to load discussion data from Firebase.", error);
        return false;
      });
  }

  function saveCommentToFirebase(topicId, comment) {
    const db = getDiscussionDatabase();
    if (!db) return Promise.reject(new Error("Firebase database SDK not loaded."));

    return db.ref("discussion/topicDetails/" + String(topicId) + "/comments").push(comment);
  }

  function renderTopicComments(topicId) {
    const tbody = byId("topicCommentsBody");
    if (!tbody) return;

    const topic = data.topicDetails[String(topicId)] || data.topicDetails[topicId];
    const comments = (topic && topic.comments) || [];

    if (!comments.length) {
      tbody.innerHTML = '<tr><td colspan="2" class="text-center">No comments available</td></tr>';
      return;
    }

    tbody.innerHTML = comments
      .map(function (comment) {
        return (
          "<tr>" +
          "<td style=\"width:220px;\">Name : " +
          escapeHtml(comment.name) +
          "<br>Date : " +
          escapeHtml(comment.date) +
          "</td>" +
          "<td>" +
          escapeHtml(comment.text) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function openTopicModal(topicId) {
    const topic = (data.topics || []).find(function (row) {
      return Number(row.id) === Number(topicId);
    });
    if (!topic) return;

    byId("hidtopicid").value = String(topic.id);
    byId("topicNameInput").value = topic.topicName;
    byId("topicCategoryInput").value = topic.category;
    byId("topicAddedByInput").value = topic.createdBy;
    byId("topicAddedOnInput").value = topic.createdDate;
    byId("txtcomments").value = "";
    byId("txtaddedby").value = "";

    renderTopicComments(topic.id);

    const modal = new bootstrap.Modal(byId("topicModal"));
    modal.show();
  }

  function formatDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    let hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;

    return month + "/" + day + "/" + year + " " + hour + ":" + minute + ":" + second + " " + ampm;
  }

  function initDiscussionPage() {
    if (document.body.getAttribute("data-page") !== "discussion") return;

    setSelectOptions("ddlstate", data.states, "State");
    setSelectOptions("ddlCategory", data.topicCategories, "Category");
    initSumoSelect("#ddlstate", "State");
    initSumoSelect("#ddlCategory", "Category");

    syncAllTopicSummaries();
    let filteredRows = (data.topics || []).slice();
    renderDiscussionRows(filteredRows);

    loadDiscussionFromFirebase().then(function (loaded) {
      if (!loaded) return;
      renderDiscussionRows(filteredRows);
      const currentTopicId = Number(byId("hidtopicid").value);
      if (currentTopicId > 0) {
        renderTopicComments(currentTopicId);
      }
    });

    byId("btnsearch").addEventListener("click", function () {
      const stateId = byId("ddlstate").value;
      const categoryId = byId("ddlCategory").value;

      if (stateId === "0") {
        showWarning("Please select State");
        return;
      }
      if (categoryId === "0") {
        showWarning("Please select Category");
        return;
      }

      const stateText = selectedOptionText("ddlstate");
      const categoryText = selectedOptionText("ddlCategory");

      filteredRows = (data.topics || []).filter(function (row) {
        return normalize(row.state) === normalize(stateText) && normalize(row.category) === normalize(categoryText);
      });

      renderDiscussionRows(filteredRows);
    });

    byId("btnReset").addEventListener("click", function () {
      window.location.reload();
    });

    byId("discussionBody").addEventListener("click", function (event) {
      const topicButton = event.target.closest("[data-topic-id]");
      if (!topicButton) return;
      openTopicModal(topicButton.getAttribute("data-topic-id"));
    });

    byId("btnaddcomments").addEventListener("click", function () {
      const topicId = Number(byId("hidtopicid").value);
      const addedBy = byId("txtaddedby").value.trim();
      const commentsText = byId("txtcomments").value.trim();

      if (!addedBy) {
        showWarning("Please Enter your name");
        return;
      }
      if (!commentsText) {
        showWarning("Please Enter your Comments");
        return;
      }

      const now = new Date();
      const newComment = {
        name: addedBy,
        date: formatDate(now),
        text: commentsText,
        createdAt: now.getTime()
      };

      ensureTopicComments(topicId).push(newComment);
      syncTopicSummary(topicId);

      renderTopicComments(topicId);
      renderDiscussionRows(filteredRows);
      byId("txtaddedby").value = "";
      byId("txtcomments").value = "";

      saveCommentToFirebase(topicId, newComment).catch(function (error) {
        const topicComments = ensureTopicComments(topicId);
        const removeIndex = topicComments.indexOf(newComment);
        if (removeIndex > -1) {
          topicComments.splice(removeIndex, 1);
        }
        syncTopicSummary(topicId);
        renderTopicComments(topicId);
        renderDiscussionRows(filteredRows);
        console.error("Unable to save discussion comment to Firebase.", error);
        showWarning("Unable to save comment right now. Please try again.");
      });
    });
  }

  function initGalleryPage() {
    if (currentPage() !== "gallery") return;

    const slidesWrap = byId("gallerySlides");
    const thumbsWrap = byId("galleryThumbs");
    const caption = byId("galleryCaption");

    const images = data.galleryImages || [];
    if (!slidesWrap || !thumbsWrap || !caption || !images.length) return;

    slidesWrap.innerHTML = images
      .map(function (image, index) {
        return (
          '<div class="my-slide">' +
          '<div class="numbertext">' +
          escapeHtml(image.numberText || index + 1 + " / " + images.length) +
          "</div>" +
          '<center><img src="' +
          escapeHtml(image.src) +
          '" alt="' +
          escapeHtml(image.alt || "Gallery image") +
          '" loading="' +
          (index === 0 ? "eager" : "lazy") +
          '" decoding="async"></center>' +
          "</div>"
        );
      })
      .join("");

    thumbsWrap.innerHTML = images
      .map(function (image, index) {
        return (
          '<div class="thumb-col">' +
          '<img class="gallery-thumb" src="' +
          escapeHtml(image.src) +
          '" alt="' +
          escapeHtml(image.alt || "Image") +
          '" data-slide-index="' +
          (index + 1) +
          '" loading="lazy" decoding="async">' +
          "</div>"
        );
      })
      .join("");

    let slideIndex = 1;

    function showSlides(targetIndex) {
      const slides = document.querySelectorAll("#gallerySlides .my-slide");
      const thumbs = document.querySelectorAll("#galleryThumbs .gallery-thumb");
      if (!slides.length) return;

      if (targetIndex > slides.length) slideIndex = 1;
      else if (targetIndex < 1) slideIndex = slides.length;
      else slideIndex = targetIndex;

      slides.forEach(function (slide) {
        slide.style.display = "none";
      });
      thumbs.forEach(function (thumb) {
        thumb.classList.remove("active");
      });

      slides[slideIndex - 1].style.display = "block";
      thumbs[slideIndex - 1].classList.add("active");
      caption.textContent = thumbs[slideIndex - 1].alt;
    }

    byId("galleryPrev").addEventListener("click", function (event) {
      event.preventDefault();
      showSlides(slideIndex - 1);
    });

    byId("galleryNext").addEventListener("click", function (event) {
      event.preventDefault();
      showSlides(slideIndex + 1);
    });

    thumbsWrap.addEventListener("click", function (event) {
      const thumb = event.target.closest("[data-slide-index]");
      if (!thumb) return;
      showSlides(Number(thumb.getAttribute("data-slide-index")));
    });

    showSlides(slideIndex);
  }

  function init() {
    hideSpinner();
    setActiveNav();
    loadDataForPage(currentPage()).finally(function () {
      initOfficersPage();
      initResourcesPage();
      initDiscussionPage();
      initGalleryPage();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
