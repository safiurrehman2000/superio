import dynamic from "next/dynamic";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader2 from "@/components/header/DefaulHeader2";
import MobileMenu from "@/components/header/MobileMenu";
import DetailsContent from "@/components/blog-meu-pages/blog-details/details-content";
import blogs from "@/data/blogs";
import Image from "next/image";

export const metadata = {
  title: "Blog Details Dyanmic V1 || Superio - Job Borad React NextJS Template",
  description: "Superio - Job Borad React NextJS Template",
};

const BlogDetailsDynamic = ({ params }) => {
  const id = params.id;

  const blog = blogs.find((item) => item.id == id) || blogs[0];

  return (
    <>
      {/* <!-- Header Span --> */}

      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader2 />
      {/* <!--End Main Header --> */}

      <MobileMenu />
      {/* End MobileMenu */}

      {/* <!-- Blog Single --> */}
      <section className="blog-single">
        <div className="auto-container">
          <div className="upper-box">
            <h3>{blog?.blogSingleTitle}</h3>
          </div>
        </div>
        {/* End auto-container */}

        <figure className="main-image">
          <Image width={1903} height={595} src={blog?.img} alt="resource" />
        </figure>

        <DetailsContent blogId={blog?.id} />
      </section>
      {/* <!-- End Blog Single --> */}

      <FooterDefault footerStyle="alternate5" />
      {/* <!-- End Main Footer --> */}
    </>
  );
};

export default dynamic(() => Promise.resolve(BlogDetailsDynamic), {
  ssr: false,
});
