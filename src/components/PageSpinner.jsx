function PageSpinner() {
  return (
    <div className="route-spinner" role="status" aria-live="polite">
      <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
    </div>
  );
}

export default PageSpinner;
