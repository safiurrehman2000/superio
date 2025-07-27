import funfactContent from "../../data/funfact";

const Funfact = () => {
  return (
    <>
      {funfactContent.slice(0, 4).map((item) => (
        <div
          className="col-lg-3 col-md-6 col-sm-12 counter-column"
          key={item.id}
        >
          <div
            className="counter-block-one wow slideInUp"
            data-wow-delay="300ms"
          >
            <div className="inner-box">
              <div className="icon-box">
                <i className={item.icon}></i>
              </div>
              <div className="count-outer count-box">
                <span
                  className="count-text"
                  data-speed="1500"
                  data-stop={item.count}
                >
                  0
                </span>
                <span className="plus">+</span>
              </div>
              <h4>{item.title}</h4>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Funfact;
