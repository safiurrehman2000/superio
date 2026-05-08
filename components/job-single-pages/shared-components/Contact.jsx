const Contact = () => {
  return (
    <div>
      <div className="row clearfix">
        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <input type="text" name="username" placeholder="Your Name" required />
        </div>
        {/* End .col */}

        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
          />
        </div>
        {/* End .col */}

        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <textarea
            className="darma"
            name="message"
            placeholder="Message"
          ></textarea>
        </div>
        {/* End .col */}
      </div>
    </div>
  );
};

export default Contact;
