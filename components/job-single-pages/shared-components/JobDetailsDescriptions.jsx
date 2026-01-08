const JobDetailsDescriptions = ({
  description,
  functionDescription,
  profileSkills,
  offer,
  schedule,
}) => {
  return (
    <>
      {description && (
        <div className="job-detail">
          <h3>Beschrijving</h3>
          <p>{description}</p>
        </div>
      )}

      {functionDescription && (
        <div className="job-detail">
          <h3>Functieomschrijving</h3>
          <p>{functionDescription}</p>
        </div>
      )}

      {profileSkills && (
        <div className="job-detail">
          <h3>Profiel/vaardigheden</h3>
          <p>{profileSkills}</p>
        </div>
      )}

      {offer && (
        <div className="job-detail">
          <h3>Aanbod</h3>
          <p>{offer}</p>
        </div>
      )}

      {schedule && (
        <div className="job-detail">
          <h3>Uurrooster</h3>
          <p>{schedule}</p>
        </div>
      )}
    </>
  );
};

export default JobDetailsDescriptions;
