const BreadCrumb = ({ title = "" }) => {
  return (
    <div className="upper-title-box">
      <h3>{title}</h3>
      <div className="text">
        {" "}
        Just a moment, we need your CV/Resume before you can access our cool
        website :)
      </div>
    </div>
  );
};

export default BreadCrumb;
