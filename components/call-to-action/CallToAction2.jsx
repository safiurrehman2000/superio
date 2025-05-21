import Link from "next/link";

const CallToAction2 = () => {
  return (
    <section
      className="call-to-action-two"
      style={{ backgroundImage: "url(/images/background/1.jpg)" }}
    >
      <div className="auto-container" data-aos="fade-up">
        <div className="sec-title light text-center">
          <h2>Make a difference with your Flexi-Job CV!</h2>
          <div className="text">
            Create an account today! ( Login/Register). Complete your profile on
            the dashboard. Upload your CV. Highlight your skills and experience
            and choose the flexi-job that suits you best. Follow all
            applications very easily via the dashboard. Also follow us on
            Facebook for the latest new vacancies Subscribe to our newsletter to
            stay informed of fun news in the world of De flexijobber. Do you
            have any questions? Consult the FAQ questions under the heading
            Flexi-Jobbers. Use our WhatsApp chat. We are happy to help you.
          </div>
        </div>

        <div className="btn-box">
          <Link href="/job-list-v6" className="theme-btn btn-style-one">
            Search Job
          </Link>
          <Link
            target="_blank"
            href="https://www.facebook.com/people/Flexi-jobber-Vlaanderen/61571515856408/"
            className="theme-btn btn-style-four"
          >
            Follow us on Facebook
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction2;
